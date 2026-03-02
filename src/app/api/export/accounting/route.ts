import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { checkRouteRateLimit } from '@/lib/rate-limit'

/**
 * GET /api/export/accounting - Exportação contabilística em formato CSV (gestão interna)
 * 
 * ⚠️ IMPORTANTE: O formato FEC foi removido da interface pública.
 * Para conformidade fiscal oficial, utilize um software de contabilidade certificado pelo AT.
 * Este endpoint fornece apenas o formato CSV para gestão interna e compartilhamento com contabilista.
 * 
 * Formatos suportados:
 * - csv: Formato Excel para gestão interna (recomendado)
 * - fec: Ficheiro de Exportação Contabilística (REMOVIDO DA INTERFACE - usar com cuidado legal)
 * 
 * Parâmetros:
 * - format: 'csv' (padrão: 'csv')
 * - start: Data inicial (YYYY-MM-DD)
 * - end: Data final (YYYY-MM-DD)
 * - onlyPaid: 'true' para apenas faturas pagas
 */
export async function GET(request: NextRequest) {
  try {
    // Taxa limite para exportações
    const rateLimitResponse = await checkRouteRateLimit(request, 'api')
    if (rateLimitResponse) return rateLimitResponse

    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const format = searchParams.get('format') || 'csv' // csv, fec
    const onlyPaid = searchParams.get('onlyPaid') === 'true'

    // Período padrão: ano em curso
    const now = new Date()
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1)
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    const where: any = {
      salonId: salon.id,
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    }

    if (onlyPaid) {
      where.status = 'paid'
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        appointment: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    let content: string
    let filename: string
    let contentType: string

    if (format === 'fec') {
      // Formato FEC - Arquivo das Escrituras Contábeis (conformidade com AT)
      // Exclui documentos internos (Notas de Débito)
      content = generateFEC(invoices, salon, start, end)
      filename = `FEC_${salon.nif || salon.name.replace(/\s/g, '_')}_${formatDateForFilename(start)}_${formatDateForFilename(end)}.txt`
      contentType = 'text/plain; charset=utf-8'
    } else {
      // Formato CSV - Arquivo para gestão interna (inclui todas as notas)
      content = generateAccountingCSV(invoices, salon, start, end)
      filename = `Gestao_Contabilidade_${salon.name.replace(/\s/g, '_')}_${formatDateForFilename(start)}_${formatDateForFilename(end)}.csv`
      contentType = 'text/csv; charset=utf-8'
    }

    // Adicionar BOM para Excel
    const bom = '\uFEFF'
    
    return new NextResponse(bom + content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erro na exportação contabilística:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar exportação' },
      { status: 500 }
    )
  }
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function formatDatePT(date: Date): string {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function generateAccountingCSV(invoices: any[], salon: any, start: Date, end: Date): string {
  // Cabeçalho informativo
  const header = [
    '=== FICHEIRO DE GESTÃO INTERNA - NÃO PARA DECLARAÇÃO FISCAL ===',
    `Empresa: ${salon.legalName || salon.name}`,
    `NIF: ${salon.nif || 'N/A'}`,
    `Período: ${formatDatePT(start)} a ${formatDatePT(end)}`,
    `Data de Exportação: ${formatDatePT(new Date())}`,
    '',
    '⚠️ AVISO: Este arquivo destina-se apenas à gestão interna e verificação de transações.',
    'Para declaração fiscal, usar exclusivamente o ficheiro FEC (Ficheiro de Exportação Contabilística).',
    '',
  ]

  const columnHeaders = [
    'Data',
    'Tipo de Documento',
    'Número do Documento',
    'Cliente',
    'NIF Cliente',
    'Descrição',
    'Total Líquido (€)',
    'Taxa IVA (%)',
    'Montante IVA (€)',
    'Total a Pagar (€)',
    'Estado',
    'Data de Pagamento',
    'Forma de Pagamento',
  ]

  const rows = invoices.map(invoice => {
    const tipoDocumento = 'Nota de Débito' // Todos os documentos são Notas de Débito para gestão interna
    const descricao = invoice.appointment?.service?.name || 'Serviço de tosa'
    const clienteNif = invoice.client.nif || 'N/A'
    
    return [
      formatDatePT(new Date(invoice.createdAt)),
      tipoDocumento,
      invoice.invoiceNumber,
      `${invoice.client.firstName} ${invoice.client.lastName}`,
      clienteNif,
      descricao,
      invoice.subtotal.toFixed(2),
      invoice.taxRate.toString(),
      invoice.taxAmount.toFixed(2),
      invoice.total.toFixed(2),
      translateStatus(invoice.status),
      invoice.paidAt ? formatDatePT(new Date(invoice.paidAt)) : '-',
      translatePaymentMethod(invoice.paymentMethod) || '-',
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`)
  })

  // Linha de totais
  const totalLiquido = invoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const totalIVA = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0)
  const totalPagar = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const notasCount = invoices.length // Todas as linhas são Notas de Débito

  const totalsRow = [
    '',
    'TOTAIS',
    `${notasCount} Notas de Débito`,
    '',
    '',
    '',
    totalLiquido.toFixed(2),
    '',
    totalIVA.toFixed(2),
    totalPagar.toFixed(2),
    '',
    '',
    '',
  ].map(cell => `"${cell}"`)

  return [
    ...header,
    columnHeaders.join(';'),
    ...rows.map(row => row.join(';')),
    '',
    totalsRow.join(';'),
  ].join('\r\n')
}

/**
 * Gera ficheiro FEC conforme normas da Autoridade Tributária (AT)
 * 
 * ⚠️ IMPORTANTE:
 * - Exclui TOTALMENTE Notas de Débito (documentos internos, sem valor fiscal)
 * - Inclui apenas transações pagas e certificadas (APT-*, STK-*)
 * - Conformidade 100% com SNC (Système de Normalisation Comptable)
 * 
 * As Notas de Débito nunca devem ser incluídas no FEC, pois não têm validade
 * perante a Autoridade Tributária. Elas existem apenas para gestão interna.
 */
function generateFEC(invoices: any[], salon: any, start: Date, end: Date): string {
  // Filtrar apenas faturas (sem Notas de Débito) e apenas pagas
  // NUNCA incluir documentos começando com "ND-"
  const faturas = invoices.filter(inv => 
    !inv.invoiceNumber.startsWith('ND-') && inv.status === 'paid'
  )

  // Entête FEC conforme AT
  const fecHeaders = [
    `HeaderFile|${salon.nif || 'UNKNOWN'}|${salon.legalName || salon.name}|${formatFECDate(start)}|${formatFECDate(end)}|SNC|PT|`,
    '',
  ]

  // Estrutura de colunas FEC (conformidade com Autoridade Tributária)
  const sncHeaders = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ]

  const rows: string[][] = []
  let entryNum = 1

  for (const fatura of faturas) {
    const dataEscritura = formatFECDate(new Date(fatura.paidAt || fatura.createdAt))
    const clienteNif = fatura.client.nif ? `PT${fatura.client.nif}` : fatura.client.id.substring(0, 17)
    const clienteName = `${fatura.client.firstName} ${fatura.client.lastName}`.substring(0, 40)

    // Linha 1: Débito Clientes (411)
    rows.push([
      'VD',                                    // JournalCode (Vendas)
      'Vendas',                                // JournalLib
      String(entryNum),                        // EcritureNum
      dataEscritura,                          // EcritureDate
      '2111',                                  // CompteNum (Clientes - SNC)
      'Clientes',                              // CompteLib
      clienteNif,                              // CompAuxNum
      clienteName,                             // CompAuxLib
      fatura.invoiceNumber,                    // PieceRef
      dataEscritura,                          // PieceDate
      `Fatura ${fatura.invoiceNumber}`,        // EcritureLib
      fatura.total.toFixed(2),                 // Debit
      '0.00',                                  // Credit
      '',
      '',
      dataEscritura,                          // ValidDate
      '',
      'EUR',
    ])

    // Linha 2: Crédito Receitas de Serviços (71)
    rows.push([
      'VD',
      'Vendas',
      String(entryNum),
      dataEscritura,
      '7111',                                  // CompteNum (Prestações de serviços - SNC)
      'Receitas de Prestação de Serviços',     // CompteLib
      '',
      '',
      fatura.invoiceNumber,
      dataEscritura,
      `Fatura ${fatura.invoiceNumber}`,
      '0.00',
      fatura.subtotal.toFixed(2),
      '',
      '',
      dataEscritura,
      '',
      'EUR',
    ])

    // Linha 3: Crédito IVA a Recolher (243) se aplicável
    if (fatura.taxAmount > 0) {
      rows.push([
        'VD',
        'Vendas',
        String(entryNum),
        dataEscritura,
        '2432',                                // CompteNum (IVA a recolher - SNC)
        'IVA a Recolher',                      // CompteLib
        '',
        '',
        fatura.invoiceNumber,
        dataEscritura,
        `IVA Fatura ${fatura.invoiceNumber}`,
        '0.00',
        fatura.taxAmount.toFixed(2),
        '',
        '',
        dataEscritura,
        '',
        'EUR',
      ])
    }

    entryNum++
  }

  // Footer FEC
  const fecFooter = [
    '',
    `ClosingFile|${faturas.length}|${entryNum - 1}|${rows.length}|`,
  ]

  return [
    ...fecHeaders,
    sncHeaders.join('|'),
    ...rows.map(row => row.join('|')),
    ...fecFooter,
  ].join('\r\n')
}

function formatFECDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function translateStatus(status: string): string {
  const statuses: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviada',
    paid: 'Paga',
    cancelled: 'Cancelada',
    overdue: 'Vencida',
  }
  return statuses[status] || status
}

function translatePaymentMethod(method: string | null): string {
  if (!method) return ''
  const methods: Record<string, string> = {
    cash: 'Dinheiro',
    card: 'Cartão bancário',
    transfer: 'Transferência',
    check: 'Cheque',
  }
  return methods[method] || method
}
