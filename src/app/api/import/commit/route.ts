import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { MAX_IMPORT_ROWS } from '@/lib/import/schema'
import {
  cleanPhone,
  cleanText,
  matchKey,
  parseBoolean,
  parseDateValue,
  parseIntegerValue,
  parseNumber,
  parseSpecies,
  splitFullName,
} from '@/lib/import/coerce'

export const runtime = 'nodejs'
export const maxDuration = 60

const bodySchema = z.object({
  type: z.enum(['clients', 'services', 'inventory']),
  mapping: z.record(z.string(), z.number().int().min(0).max(59)),
  rows: z.array(z.array(z.string().max(2000))).max(MAX_IMPORT_ROWS),
})

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_REPORTED_ISSUES = 50

interface ImportReport {
  created: number
  matched: number
  animalsCreated: number
  animalsSkipped: number
  errors: Array<{ row: number; message: string }>
  warnings: Array<{ row: number; message: string }>
  errorCount: number
  warningCount: number
}

class IssueLog {
  readonly errors: Array<{ row: number; message: string }> = []
  readonly warnings: Array<{ row: number; message: string }> = []
  errorCount = 0
  warningCount = 0

  error(row: number, message: string) {
    this.errorCount++
    if (this.errors.length < MAX_REPORTED_ISSUES) this.errors.push({ row, message })
  }

  warn(row: number, message: string) {
    this.warningCount++
    if (this.warnings.length < MAX_REPORTED_ISSUES) this.warnings.push({ row, message })
  }
}

function makeReader(mapping: Record<string, number>) {
  return (row: string[], key: string): string => {
    const index = mapping[key]
    if (index === undefined) return ''
    return (row[index] || '').trim()
  }
}

interface AnimalDraft {
  rowNumber: number
  name: string
  species: string
  breed: string | null
  color: string | null
  dateOfBirth: Date | null
  allergies: string | null
  notes: string | null
}

interface ClientGroup {
  rowNumber: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string | null
  nif: string | null
  notes: string | null
  animals: AnimalDraft[]
}

async function importClients(salonId: string, mapping: Record<string, number>, rows: string[][]): Promise<ImportReport> {
  const read = makeReader(mapping)
  const issues = new IssueLog()
  const groups = new Map<string, ClientGroup>()

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // +1 en-tête, +1 base 1 comme dans Excel
    const rawFirstName = read(row, 'firstName')
    const rawLastName = read(row, 'lastName')

    let firstName = cleanText(rawFirstName, 100)
    let lastName = cleanText(rawLastName, 100)

    if (!lastName && firstName.includes(' ')) {
      const split = splitFullName(firstName)
      firstName = split.firstName
      lastName = split.lastName
    }

    if (!firstName) {
      issues.error(rowNumber, 'Linha ignorada: nome do cliente em falta')
      return
    }

    const rawEmail = read(row, 'email').toLowerCase()
    let email: string | null = rawEmail || null
    if (email && !EMAIL_PATTERN.test(email)) {
      issues.warn(rowNumber, `Email ignorado (formato inválido): ${email}`)
      email = null
    }

    const phone = cleanPhone(read(row, 'phone')) || null

    const key = email ? `e:${email}` : phone ? `p:${phone}` : `n:${matchKey(`${firstName} ${lastName}`)}`
    let group = groups.get(key)
    if (!group) {
      group = {
        rowNumber,
        firstName,
        lastName,
        email,
        phone,
        address: cleanText(read(row, 'address'), 500) || null,
        nif: cleanText(read(row, 'nif'), 20) || null,
        notes: cleanText(read(row, 'notes'), 2000) || null,
        animals: [],
      }
      groups.set(key, group)
    }

    const animalName = cleanText(read(row, 'animalName'), 100)
    if (animalName) {
      const birth = read(row, 'animalBirth')
      const dateOfBirth = parseDateValue(birth)
      if (birth && !dateOfBirth) {
        issues.warn(rowNumber, `Data de nascimento ignorada (formato não reconhecido): ${birth}`)
      }

      group.animals.push({
        rowNumber,
        name: animalName,
        species: parseSpecies(read(row, 'animalSpecies')),
        breed: cleanText(read(row, 'animalBreed'), 100) || null,
        color: cleanText(read(row, 'animalColor'), 50) || null,
        dateOfBirth,
        allergies: cleanText(read(row, 'animalAllergies'), 500) || null,
        notes: cleanText(read(row, 'animalNotes'), 2000) || null,
      })
    }
  })

  const existingClients = await prisma.client.findMany({
    where: { salonId, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  })
  const existingAnimals = await prisma.animal.findMany({
    where: { client: { salonId }, deletedAt: null },
    select: { clientId: true, name: true },
  })

  const byEmail = new Map<string, string>()
  const byPhone = new Map<string, string>()
  const byName = new Map<string, string>()
  for (const client of existingClients) {
    if (client.email) byEmail.set(client.email.toLowerCase(), client.id)
    if (client.phone) byPhone.set(cleanPhone(client.phone), client.id)
    byName.set(matchKey(`${client.firstName} ${client.lastName}`), client.id)
  }

  const animalKeys = new Set(existingAnimals.map(animal => `${animal.clientId}|${matchKey(animal.name)}`))

  let created = 0
  let matched = 0
  let animalsSkipped = 0
  const animalsToCreate: Array<{
    clientId: string
    name: string
    species: string
    breed: string | null
    color: string | null
    dateOfBirth: Date | null
    allergies: string | null
    notes: string | null
  }> = []

  // Les doublons étant détectés à chaque passage, relancer le même fichier après une
  // interruption reprend sans rien dupliquer.
  for (const group of groups.values()) {
    const nameKey = matchKey(`${group.firstName} ${group.lastName}`)
    const existingId =
      (group.email && byEmail.get(group.email)) || (group.phone && byPhone.get(group.phone)) || byName.get(nameKey)

    let clientId: string
    if (existingId) {
      clientId = existingId
      matched++
    } else {
      try {
        const client = await prisma.client.create({
          data: {
            firstName: group.firstName,
            lastName: group.lastName,
            email: group.email,
            phone: group.phone,
            address: group.address,
            nif: group.nif,
            notes: group.notes,
            salonId,
          },
          select: { id: true },
        })
        clientId = client.id
        created++
        if (group.email) byEmail.set(group.email, clientId)
        if (group.phone) byPhone.set(group.phone, clientId)
        byName.set(nameKey, clientId)
      } catch (error) {
        console.error('Import client create failed:', error)
        issues.error(group.rowNumber, `Não foi possível criar o cliente ${group.firstName} ${group.lastName}`)
        continue
      }
    }

    for (const animal of group.animals) {
      const animalKey = `${clientId}|${matchKey(animal.name)}`
      if (animalKeys.has(animalKey)) {
        animalsSkipped++
        continue
      }
      animalKeys.add(animalKey)
      animalsToCreate.push({
        clientId,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        color: animal.color,
        dateOfBirth: animal.dateOfBirth,
        allergies: animal.allergies,
        notes: animal.notes,
      })
    }
  }

  if (animalsToCreate.length > 0) {
    await prisma.animal.createMany({ data: animalsToCreate })
  }

  return {
    created,
    matched,
    animalsCreated: animalsToCreate.length,
    animalsSkipped,
    errors: issues.errors,
    warnings: issues.warnings,
    errorCount: issues.errorCount,
    warningCount: issues.warningCount,
  }
}

async function importServices(salonId: string, mapping: Record<string, number>, rows: string[][]): Promise<ImportReport> {
  const read = makeReader(mapping)
  const issues = new IssueLog()

  const existing = await prisma.service.findMany({ where: { salonId }, select: { name: true } })
  const seen = new Set(existing.map(service => matchKey(service.name)))

  let matched = 0
  const toCreate: Array<{
    name: string
    description: string | null
    price: number
    minPrice: number | null
    maxPrice: number | null
    duration: number
    minDuration: number | null
    maxDuration: number | null
    isFlexible: boolean
    salonId: string
  }> = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const name = cleanText(read(row, 'name'), 100)
    if (!name) {
      issues.error(rowNumber, 'Linha ignorada: nome do serviço em falta')
      return
    }

    const nameKey = matchKey(name)
    if (seen.has(nameKey)) {
      matched++
      return
    }

    const isFlexible = parseBoolean(read(row, 'isFlexible'))
    const minPrice = parseNumber(read(row, 'minPrice'))
    const maxPrice = parseNumber(read(row, 'maxPrice'))
    const minDuration = parseIntegerValue(read(row, 'minDuration'))
    const maxDuration = parseIntegerValue(read(row, 'maxDuration'))

    let price = parseNumber(read(row, 'price'))
    if (price === null) {
      if (!isFlexible) {
        issues.error(rowNumber, `Linha ignorada: preço em falta para "${name}"`)
        return
      }
      price = minPrice ?? 0
    }
    if (price < 0) {
      issues.error(rowNumber, `Linha ignorada: preço negativo para "${name}"`)
      return
    }

    let duration = parseIntegerValue(read(row, 'duration'))
    if (duration === null || duration <= 0) {
      duration = minDuration ?? maxDuration ?? 60
      issues.warn(rowNumber, `Duração de "${name}" definida como ${duration} min por omissão`)
    }
    if (duration > 480) {
      duration = 480
      issues.warn(rowNumber, `Duração de "${name}" limitada a 480 min`)
    }

    seen.add(nameKey)
    toCreate.push({
      name,
      description: cleanText(read(row, 'description'), 500) || null,
      price,
      minPrice: minPrice !== null && minPrice > 0 ? minPrice : null,
      maxPrice: maxPrice !== null && maxPrice > 0 ? maxPrice : null,
      duration,
      minDuration: minDuration !== null && minDuration > 0 ? minDuration : null,
      maxDuration: maxDuration !== null && maxDuration > 0 ? maxDuration : null,
      isFlexible,
      salonId,
    })
  })

  if (toCreate.length > 0) {
    await prisma.service.createMany({ data: toCreate })
  }

  return {
    created: toCreate.length,
    matched,
    animalsCreated: 0,
    animalsSkipped: 0,
    errors: issues.errors,
    warnings: issues.warnings,
    errorCount: issues.errorCount,
    warningCount: issues.warningCount,
  }
}

async function importInventory(salonId: string, mapping: Record<string, number>, rows: string[][]): Promise<ImportReport> {
  const read = makeReader(mapping)
  const issues = new IssueLog()

  const existing = await prisma.inventoryItem.findMany({ where: { salonId }, select: { name: true } })
  const seen = new Set(existing.map(item => matchKey(item.name)))

  const existingCategories = await prisma.inventoryCategory.findMany({ where: { salonId }, select: { id: true, name: true } })
  const categoryIds = new Map(existingCategories.map(category => [matchKey(category.name), category.id]))

  let matched = 0
  const drafts: Array<{
    name: string
    description: string | null
    quantity: number
    unit: string
    price: number
    categoryName: string | null
  }> = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const name = cleanText(read(row, 'name'), 200)
    if (!name) {
      issues.error(rowNumber, 'Linha ignorada: nome do artigo em falta')
      return
    }

    const nameKey = matchKey(name)
    if (seen.has(nameKey)) {
      matched++
      return
    }

    const quantity = parseIntegerValue(read(row, 'quantity'))
    const price = parseNumber(read(row, 'price'))

    seen.add(nameKey)
    drafts.push({
      name,
      description: cleanText(read(row, 'description'), 500) || null,
      quantity: quantity !== null && quantity >= 0 ? quantity : 0,
      unit: cleanText(read(row, 'unit'), 20) || 'un',
      price: price !== null && price >= 0 ? price : 0,
      categoryName: cleanText(read(row, 'category'), 100) || null,
    })
  })

  for (const draft of drafts) {
    if (!draft.categoryName) continue
    const key = matchKey(draft.categoryName)
    if (categoryIds.has(key)) continue
    const category = await prisma.inventoryCategory.create({
      data: { name: draft.categoryName, salonId },
      select: { id: true },
    })
    categoryIds.set(key, category.id)
  }

  if (drafts.length > 0) {
    await prisma.inventoryItem.createMany({
      data: drafts.map(draft => ({
        name: draft.name,
        description: draft.description,
        quantity: draft.quantity,
        unit: draft.unit,
        price: draft.price,
        categoryId: draft.categoryName ? categoryIds.get(matchKey(draft.categoryName)) || null : null,
        salonId,
        lastRestocked: new Date(),
      })),
    })
  }

  return {
    created: drafts.length,
    matched,
    animalsCreated: 0,
    animalsSkipped: 0,
    errors: issues.errors,
    warnings: issues.warnings,
    errorCount: issues.errorCount,
    warningCount: issues.warningCount,
  }
}

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

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados de importação inválidos' }, { status: 400 })
    }

    const { type, mapping, rows } = parsed.data
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Nenhuma linha para importar' }, { status: 400 })
    }

    const report =
      type === 'clients'
        ? await importClients(salon.id, mapping, rows)
        : type === 'services'
          ? await importServices(salon.id, mapping, rows)
          : await importInventory(salon.id, mapping, rows)

    return NextResponse.json(report)
  } catch (error) {
    console.error('Import commit error:', error)
    return NextResponse.json({ message: 'Erro ao importar os dados.' }, { status: 500 })
  }
}
