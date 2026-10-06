const SPECIES_ALIASES: Record<string, string> = {
  dog: 'dog', cao: 'dog', cães: 'dog', caes: 'dog', cachorro: 'dog', canino: 'dog', perro: 'dog', chien: 'dog',
  cat: 'cat', gato: 'cat', gata: 'cat', felino: 'cat', chat: 'cat',
  rabbit: 'rabbit', coelho: 'rabbit', coelha: 'rabbit', lapin: 'rabbit',
  bird: 'bird', passaro: 'bird', ave: 'bird', papagaio: 'bird', canario: 'bird', periquito: 'bird', oiseau: 'bird',
}

const TRUE_VALUES = new Set(['sim', 's', 'yes', 'y', 'true', 'verdadeiro', 'x', '1', 'oui'])

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/**
 * Accepte les écritures européennes et anglo-saxonnes : "12,50", "1.234,56", "1,234.56", "15 €".
 * Quand un seul séparateur est présent, il est traité comme séparateur décimal.
 */
export function parseNumber(raw: string): number | null {
  if (!raw) return null

  let cleaned = raw.replace(/[^\d,.\-]/g, '')
  if (!cleaned || cleaned === '-') return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.'
    const thousandSeparator = decimalSeparator === ',' ? '.' : ','
    cleaned = cleaned.split(thousandSeparator).join('').replace(decimalSeparator, '.')
  } else if (lastComma !== -1) {
    cleaned = cleaned.replace(',', '.')
  }

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseIntegerValue(raw: string): number | null {
  const parsed = parseNumber(raw)
  return parsed === null ? null : Math.round(parsed)
}

export function parseBoolean(raw: string): boolean {
  return TRUE_VALUES.has(stripAccents(raw))
}

export function parseSpecies(raw: string): string {
  if (!raw) return 'dog'
  const key = stripAccents(raw)
  if (SPECIES_ALIASES[key]) return SPECIES_ALIASES[key]
  const match = Object.keys(SPECIES_ALIASES).find(alias => key.startsWith(alias))
  return match ? SPECIES_ALIASES[match] : 'other'
}

/** Formats acceptés : yyyy-mm-dd (issu d'Excel) et dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy (pt-PT). */
export function parseDateValue(raw: string): Date | null {
  if (!raw) return null

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const local = raw.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/)
  if (local) {
    const day = Number(local[1])
    const month = Number(local[2])
    const year = Number(local[3].length === 2 ? `20${local[3]}` : local[3])
    if (day > 31 || month > 12) return null
    const date = new Date(Date.UTC(year, month - 1, day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function cleanPhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '').slice(0, 20)
}

export function cleanText(raw: string, maxLength: number): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

/** Sépare "João Silva" en prénom + nom quand le fichier n'a qu'une colonne de nom. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = cleanText(fullName, 200).split(' ').filter(Boolean)
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' }
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] }
}

export function matchKey(value: string): string {
  return stripAccents(value).replace(/\s+/g, ' ')
}
