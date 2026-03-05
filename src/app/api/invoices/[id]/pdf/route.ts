import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invoices/[id]/pdf - Gera um PDF de nota de débito
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        salonId: salon.id,
        deletedAt: null,
      },
      include: {
        client: true,
        appointment: {
          include: {
            animal: true,
            services: { include: { service: true } },
          },
        },
        salon: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 })
    }

    // Gerar o HTML da nota de débito
    const html = generateInvoiceHTML(invoice)

    // Retornar o HTML (o frontend pode usar window.print() ou uma lib como html2pdf)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF da nota:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar nota de débito' },
      { status: 500 }
    )
  }
}

// ✅ SEGURANÇA: Função de escape HTML para prevenir XSS
function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function generateInvoiceHTML(invoice: any) {
  const salon = invoice.salon
  const client = invoice.client
  const appointment = invoice.appointment
  const createdAt = new Date(invoice.createdAt)
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null

  const formatDate = (date: Date) => date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviada',
    paid: 'Paga',
    cancelled: 'Cancelada',
    overdue: 'Vencida',
  }

  const paymentMethodLabel: Record<string, string> = {
    cash: 'Dinheiro',
    card: 'Cartão bancário',
    transfer: 'Transferência',
    check: 'Cheque',
  }

  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="Nota de débito ${invoice.invoiceNumber} - ${escapeHtml(salon.name)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota de Débito ${invoice.invoiceNumber} | ${escapeHtml(salon.name)}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 30px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #1f2937; }
    .invoice-date { color: #6b7280; margin-top: 5px; }
    
    /* Status badge */
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #fef3c7; color: #92400e; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    
    /* Parties */
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party-title { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; }
    .party-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
    .party-details { color: #4b5563; font-size: 12px; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
    td { padding: 15px 12px; border-bottom: 1px solid #f3f4f6; }
    .text-right { text-align: right; }
    .total-row td { font-weight: bold; border-top: 2px solid #e5e7eb; }
    .grand-total { font-size: 16px; color: #3b82f6; }
    
    /* Footer */
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { font-size: 10px; color: #9ca3af; text-align: center; }
    .terms { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 11px; color: #6b7280; }
    
    /* Payment info */
    .payment-info { margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; }
    .payment-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    
    @media print {
      .invoice { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">🐾 ${escapeHtml(salon.name)}</div>
        <div class="party-details" style="margin-top: 10px;">
          ${escapeHtml(salon.address)}<br>
          ${escapeHtml(salon.postalCode)} ${escapeHtml(salon.city)}<br>
          ${salon.phone ? `📞 ${escapeHtml(salon.phone)}` : ''}<br>
          ${salon.email ? `📧 ${escapeHtml(salon.email)}` : ''}
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">NOTA DE DÉBITO ${escapeHtml(invoice.invoiceNumber)}</div>
        <div class="invoice-date">
          Data : ${formatDate(createdAt)}<br>
          ${dueDate ? `Vencimento : ${formatDate(dueDate)}` : ''}
        </div>
        <div style="margin-top: 10px;">
          <span class="status status-${escapeHtml(invoice.status)}">${escapeHtml(statusLabel[invoice.status] || invoice.status)}</span>
        </div>
      </div>
    </div>

    <!-- Partes -->
    <div class="parties">
      <div class="party">
        <div class="party-title">Emissor</div>
        <div class="party-name">${escapeHtml(salon.legalName || salon.name)}</div>
        <div class="party-details">
          ${escapeHtml(salon.legalForm)}<br>
          ${escapeHtml(salon.address)}<br>
          ${escapeHtml(salon.postalCode)} ${escapeHtml(salon.city)}<br>
          ${salon.nif ? `NIF: ${escapeHtml(salon.nif)}<br>` : ''}
        </div>
      </div>
      <div class="party">
        <div class="party-title">Cliente</div>
        <div class="party-name">${escapeHtml(client.firstName)} ${escapeHtml(client.lastName)}</div>
        <div class="party-details">
          ${escapeHtml(client.address)}<br>
          ${escapeHtml(client.email)}<br>
          ${escapeHtml(client.phone)}<br>
          ${client.nif ? `NIF : ${escapeHtml(client.nif)}<br>` : ''}
        </div>
      </div>
    </div>

    <!-- Detalhes -->
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Quantidade</th>
          <th class="text-right">Preço unitário</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(() => {
          try {
            const items = invoice.items ? JSON.parse(invoice.items) : []
            if (items.length > 0) {
              return items.map((item: any) => {
                const itemName = item.service || item.product || 'Produit'
                const quantity = item.quantity || 1
                const pricePerUnit = item.pricePerUnit || (invoice.subtotal / quantity)
                const totalItem = pricePerUnit * quantity
                
                return `
                <tr>
                  <td>
                    <strong>${escapeHtml(itemName)}</strong><br>
                    <span style="color: #6b7280; font-size: 11px;">
                      ${item.description ? escapeHtml(item.description) : ''}
                      ${appointment?.animal && invoice.type === 'appointment' ? `Animal: ${escapeHtml(appointment.animal.name)}<br>` : ''}
                      ${appointment && invoice.type === 'appointment' ? `Data do Agendamento: ${formatDate(new Date(appointment.startTime))}` : ''}
                    </span>
                  </td>
                  <td>${quantity}${item.unit ? ' ' + escapeHtml(item.unit) : ''}</td>
                  <td class="text-right">${pricePerUnit.toFixed(2)} €</td>
                  <td class="text-right">${totalItem.toFixed(2)} €</td>
                </tr>
                `
              }).join('')
            }
            
            // Fallback si pas d'items
            return `
            <tr>
              <td>
                <strong>${escapeHtml(appointment?.service?.name) || 'Serviço de tosa'}</strong><br>
                <span style="color: #6b7280; font-size: 11px;">
                  ${appointment?.animal ? `Animal: ${escapeHtml(appointment.animal.name)}<br>` : ''}
                  ${appointment ? `Data do Agendamento: ${formatDate(new Date(appointment.startTime))}` : ''}
                </span>
              </td>
              <td>1</td>
              <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
              <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
            </tr>
            `
          } catch (e) {
            // Se erro ao fazer parse do JSON
            return `
            <tr>
              <td>
                <strong>${escapeHtml(appointment?.service?.name) || 'Serviço de tosa'}</strong><br>
                <span style="color: #6b7280; font-size: 11px;">
                  ${appointment?.animal ? `Animal: ${escapeHtml(appointment.animal.name)}<br>` : ''}
                  ${appointment ? `Data do Agendamento: ${formatDate(new Date(appointment.startTime))}` : ''}
                </span>
              </td>
              <td>1</td>
              <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
              <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
            </tr>
            `
          }
        })()}
        
        <!-- Subtotal -->
        <tr>
          <td colspan="3" class="text-right">Subtotal</td>
          <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right">Total a Pagar</td>
          <td class="text-right grand-total">${invoice.total.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>

    ${invoice.status === 'paid' ? `
    <div class="payment-info">
      <div class="payment-title">✅ Nota de Débito Paga</div>
      <div>
        Paga em: ${invoice.paidAt ? formatDate(new Date(invoice.paidAt)) : '-'}<br>
        Forma de pagamento: ${invoice.paymentMethod ? escapeHtml(paymentMethodLabel[invoice.paymentMethod] || invoice.paymentMethod) : '-'}
      </div>
    </div>
    ` : ''}

    <!-- Condições -->
    ${salon.invoiceTerms || salon.invoiceNotes ? `
    <div class="terms">
      <strong>Condições de Pagamento:</strong><br>
      ${escapeHtml(salon.invoiceTerms) || 'Pagamento na recepção da nota de débito'}<br><br>
      ${escapeHtml(salon.invoiceNotes)}
    </div>
    ` : `
    <div class="terms">
      <strong>Condições de Pagamento:</strong><br>
      Pagamento na recepção da nota de débito.<br>
      Formas de pagamento aceitas: Dinheiro, Cartão bancário, Cheque.
    </div>
    `}

    <!-- Rodapé -->
    <div class="footer">
      <div class="legal">
        ${escapeHtml(salon.legalName || salon.name)} ${salon.legalForm ? `- ${escapeHtml(salon.legalForm)}` : ''}<br>
        ${salon.nif ? `NIF: ${escapeHtml(salon.nif)}` : ''}<br>
        Documento gerado automaticamente por Pawlyx<br>
        <br>
        <em>Este documento não tem efeitos contabilísticos.</em>
      </div>
    </div>
  </div>

  <script>
    // Impressão automática se solicitado
    if (window.location.search.includes('print=true')) {
      window.onload = function() { window.print(); }
    }
  </script>
</body>
</html>
  `
}
