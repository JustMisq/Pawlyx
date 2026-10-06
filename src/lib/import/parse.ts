import ExcelJS from 'exceljs'
import { MAX_IMPORT_ROWS } from './schema'

export interface ParsedSheet {
  headers: string[]
  rows: string[][]
  totalRows: number
  truncated: boolean
}

export class ImportParseError extends Error {}

const MAX_COLUMNS = 60

/** Excel en pt-PT exporte souvent du CSV en windows-1252 : on retombe dessus si l'UTF-8 est invalide. */
function decodeText(buffer: Buffer): string {
  const withoutBom =
    buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf ? buffer.subarray(3) : buffer
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(withoutBom)
  } catch {
    return new TextDecoder('windows-1252').decode(withoutBom)
  }
}

function detectDelimiter(text: string): string {
  const candidates = [';', ',', '\t', '|']
  let firstLine = ''
  let inQuotes = false
  for (const char of text) {
    if (char === '"') inQuotes = !inQuotes
    if (char === '\n' && !inQuotes) break
    firstLine += char
  }

  let best = ','
  let bestCount = 0
  for (const candidate of candidates) {
    const count = firstLine.split(candidate).length - 1
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }
  return best
}

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field.trim())
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      pushField()
    } else if (char === '\r') {
      // géré par le \n qui suit
    } else if (char === '\n') {
      pushRow()
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) pushRow()

  return rows
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return formatDate(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return value.trim()

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (Array.isArray(record.richText)) {
      return (record.richText as Array<{ text?: string }>).map(part => part.text || '').join('').trim()
    }
    if ('result' in record) return cellToString(record.result)
    if ('text' in record) return cellToString(record.text)
    if ('error' in record) return ''
  }

  return ''
}

function isEmptyRow(row: string[]): boolean {
  return row.every(cell => cell.length === 0)
}

function toSheet(table: string[][]): ParsedSheet {
  const firstContentIndex = table.findIndex(row => !isEmptyRow(row))
  if (firstContentIndex === -1) {
    throw new ImportParseError('O ficheiro está vazio.')
  }

  const headers = table[firstContentIndex].slice(0, MAX_COLUMNS)
  if (headers.every(header => header.length === 0)) {
    throw new ImportParseError('Não foi possível ler a primeira linha com os nomes das colunas.')
  }

  const dataRows = table.slice(firstContentIndex + 1).filter(row => !isEmptyRow(row))
  const normalized = dataRows.map(row => {
    const trimmed = row.slice(0, headers.length)
    while (trimmed.length < headers.length) trimmed.push('')
    return trimmed
  })

  return {
    headers,
    rows: normalized.slice(0, MAX_IMPORT_ROWS),
    totalRows: normalized.length,
    truncated: normalized.length > MAX_IMPORT_ROWS,
  }
}

async function parseXlsx(buffer: Buffer): Promise<ParsedSheet> {
  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer)
  } catch {
    throw new ImportParseError('Não foi possível abrir o ficheiro Excel. Verifique que não está protegido por palavra-passe.')
  }

  const sheet = workbook.worksheets.find(candidate => candidate.actualRowCount > 0) || workbook.worksheets[0]
  if (!sheet) {
    throw new ImportParseError('O ficheiro Excel não tem nenhuma folha com dados.')
  }

  const table: string[][] = []
  sheet.eachRow({ includeEmpty: false }, row => {
    const cells: string[] = []
    for (let column = 1; column <= Math.min(sheet.columnCount, MAX_COLUMNS); column++) {
      cells.push(cellToString(row.getCell(column).value))
    }
    table.push(cells)
  })

  return toSheet(table)
}

export async function parseSpreadsheet(buffer: Buffer, filename: string): Promise<ParsedSheet> {
  const extension = filename.toLowerCase().split('.').pop() || ''

  if (extension === 'xlsx' || extension === 'xlsm') {
    return parseXlsx(buffer)
  }

  if (extension === 'xls') {
    throw new ImportParseError(
      'O formato .xls (Excel 97-2003) não é suportado. Abra o ficheiro e grave-o como .xlsx ou .csv.'
    )
  }

  if (extension === 'csv' || extension === 'txt' || extension === 'tsv') {
    const text = decodeText(buffer)
    return toSheet(parseCsv(text, detectDelimiter(text)))
  }

  throw new ImportParseError('Formato não suportado. Use um ficheiro .xlsx ou .csv.')
}
