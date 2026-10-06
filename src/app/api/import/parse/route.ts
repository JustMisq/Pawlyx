import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { ImportParseError, parseSpreadsheet } from '@/lib/import/parse'
import { autoMapColumns, importTypes, isImportType, MAX_IMPORT_FILE_BYTES } from '@/lib/import/schema'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({ where: { userId: session.user.id } })
    if (!salon) {
      return NextResponse.json({ message: 'Crie primeiro o seu salão', error: 'NO_SALON' }, { status: 404 })
    }

    const formData = await request.formData()
    const type = formData.get('type')
    const file = formData.get('file')

    if (!isImportType(type)) {
      return NextResponse.json({ message: 'Tipo de importação inválido' }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Nenhum ficheiro enviado' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ message: 'O ficheiro está vazio.' }, { status: 400 })
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      return NextResponse.json(
        { message: `O ficheiro é demasiado grande (máximo ${MAX_IMPORT_FILE_BYTES / (1024 * 1024)} MB).` },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const sheet = await parseSpreadsheet(buffer, file.name)

    return NextResponse.json({
      ...sheet,
      mapping: autoMapColumns(sheet.headers, importTypes[type].fields),
    })
  } catch (error) {
    if (error instanceof ImportParseError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Import parse error:', error)
    return NextResponse.json({ message: 'Não foi possível ler o ficheiro.' }, { status: 500 })
  }
}
