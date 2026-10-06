'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Package,
  Scissors,
  Upload,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { importTypes, isImportType, type ImportType } from '@/lib/import/schema'

interface ParsedSheet {
  headers: string[]
  rows: string[][]
  totalRows: number
  truncated: boolean
  mapping: Record<string, number>
}

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

const typeIcons: Record<ImportType, typeof Users> = {
  clients: Users,
  services: Scissors,
  inventory: Package,
}

const typeLinks: Record<ImportType, string> = {
  clients: '/dashboard/clients',
  services: '/dashboard/services',
  inventory: '/dashboard/inventory',
}

function ImportPageContent() {
  const searchParams = useSearchParams()
  const requestedType = searchParams.get('type')

  const [type, setType] = useState<ImportType>(isImportType(requestedType) ? requestedType : 'clients')
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [fileName, setFileName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const definition = importTypes[type]

  useEffect(() => {
    if (isImportType(requestedType)) setType(requestedType)
  }, [requestedType])

  const missingRequired = useMemo(
    () => definition.fields.filter(field => field.required && mapping[field.key] === undefined),
    [definition, mapping]
  )

  const mappedFields = useMemo(
    () => definition.fields.filter(field => mapping[field.key] !== undefined),
    [definition, mapping]
  )

  const resetFile = () => {
    setSheet(null)
    setMapping({})
    setFileName('')
    setReport(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFile = async (file: File) => {
    setParsing(true)
    setReport(null)
    try {
      const body = new FormData()
      body.append('type', type)
      body.append('file', file)

      const res = await fetch('/api/import/parse', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Não foi possível ler o ficheiro')
        return
      }

      setSheet(data)
      setMapping(data.mapping || {})
      setFileName(file.name)
      if (data.truncated) {
        toast.error(`O ficheiro tem ${data.totalRows} linhas. Só as primeiras ${data.rows.length} serão importadas.`)
      }
    } catch (error) {
      console.error('Parse error:', error)
      toast.error('Ocorreu um erro ao ler o ficheiro')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!sheet) return
    setImporting(true)
    try {
      const res = await fetch('/api/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, mapping, rows: sheet.rows }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Erro ao importar')
        return
      }

      setReport(data)
      setSheet(null)
      toast.success('Importação concluída!')
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Ocorreu um erro durante a importação')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Upload className="w-7 h-7 text-teal-500" />
          Importar dados
        </h1>
        <p className="text-gray-500 mt-1">
          Já tem os seus dados no Excel ou noutro programa? Envie o ficheiro e o Pawlyx preenche tudo por si.
        </p>
      </div>

      {report ? (
        <ImportResult
          report={report}
          type={type}
          onRestart={() => {
            resetFile()
          }}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {(Object.keys(importTypes) as ImportType[]).map(candidate => {
              const Icon = typeIcons[candidate]
              const active = candidate === type
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => {
                    setType(candidate)
                    resetFile()
                  }}
                  className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                    active ? 'border-teal-500 bg-teal-50/50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                  <p className="font-semibold text-gray-900">{importTypes[candidate].label}</p>
                </button>
              )
            })}
          </div>

          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
            {definition.description}
          </p>

          {!sheet ? (
            <div
              onDragOver={event => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={event => {
                event.preventDefault()
                setDragging(false)
                const file = event.dataTransfer.files?.[0]
                if (file) handleFile(file)
              }}
              className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              {parsing ? (
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> A analisar o ficheiro...
                </p>
              ) : (
                <>
                  <p className="font-medium text-gray-900">Arraste o ficheiro para aqui</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Formatos aceites: Excel (.xlsx) ou CSV — até 5 MB</p>
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Escolher um ficheiro
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm,.csv,.tsv,.txt"
                className="hidden"
                onChange={event => {
                  const file = event.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{fileName}</p>
                    <p className="text-sm text-gray-500">
                      {sheet.rows.length} linha{sheet.rows.length !== 1 ? 's' : ''} · {sheet.headers.length} coluna
                      {sheet.headers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={resetFile}>
                    <ArrowLeft className="w-4 h-4" /> Trocar de ficheiro
                  </Button>
                </div>

                <h2 className="text-sm font-semibold text-gray-900 mb-1">Associação das colunas</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Verifique o que o Pawlyx detetou e corrija o que estiver trocado.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {definition.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={mapping[field.key] ?? ''}
                        onChange={event => {
                          const value = event.target.value
                          setMapping(prev => {
                            const next = { ...prev }
                            if (value === '') delete next[field.key]
                            else next[field.key] = Number(value)
                            return next
                          })
                        }}
                        className="input-base"
                      >
                        <option value="">— Ignorar —</option>
                        {sheet.headers.map((header, index) => (
                          <option key={index} value={index}>
                            {header || `Coluna ${index + 1}`}
                          </option>
                        ))}
                      </select>
                      {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {mappedFields.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">
                    Pré-visualização das {Math.min(5, sheet.rows.length)} primeiras linhas
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/80">
                        <tr>
                          {mappedFields.map(field => (
                            <th
                              key={field.key}
                              className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sheet.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {mappedFields.map(field => (
                              <td key={field.key} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                {row[mapping[field.key]] || <span className="text-gray-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {missingRequired.length > 0 && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Associe primeiro: {missingRequired.map(field => field.label).join(', ')}
                  </span>
                </div>
              )}

              <Button
                type="button"
                onClick={handleImport}
                disabled={importing || missingRequired.length > 0}
                className="w-full sm:w-auto"
              >
                {importing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> A importar...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Importar {sheet.rows.length} linha{sheet.rows.length !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ImportResult({ report, type, onRestart }: { report: ImportReport; type: ImportType; onRestart: () => void }) {
  const createdLabel =
    type === 'clients' ? 'clientes criados' : type === 'services' ? 'serviços criados' : 'artigos criados'

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border-2 border-teal-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Importação concluída</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat value={report.created} label={createdLabel} />
          <Stat value={report.matched} label="já existiam" muted />
          {type === 'clients' && (
            <>
              <Stat value={report.animalsCreated} label="animais criados" />
              <Stat value={report.animalsSkipped} label="animais já existentes" muted />
            </>
          )}
        </div>
      </div>

      {report.errorCount > 0 && (
        <IssueList
          tone="error"
          title={`${report.errorCount} linha${report.errorCount !== 1 ? 's' : ''} ignorada${report.errorCount !== 1 ? 's' : ''}`}
          issues={report.errors}
          total={report.errorCount}
        />
      )}

      {report.warningCount > 0 && (
        <IssueList
          tone="warning"
          title={`${report.warningCount} aviso${report.warningCount !== 1 ? 's' : ''}`}
          issues={report.warnings}
          total={report.warningCount}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={typeLinks[type]}>
          <Button className="w-full sm:w-auto">Ver os dados importados</Button>
        </Link>
        <Button variant="outline" onClick={onRestart} className="w-full sm:w-auto">
          <Upload className="w-4 h-4" /> Importar outro ficheiro
        </Button>
      </div>
    </div>
  )
}

function Stat({ value, label, muted }: { value: number; label: string; muted?: boolean }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${muted ? 'text-gray-400' : 'text-teal-600'}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function IssueList({
  tone,
  title,
  issues,
  total,
}: {
  tone: 'error' | 'warning'
  title: string
  issues: Array<{ row: number; message: string }>
  total: number
}) {
  const styles =
    tone === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-orange-50 border-orange-200 text-orange-800'

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> {title}
      </p>
      <ul className="space-y-1 text-sm">
        {issues.map((issue, index) => (
          <li key={index}>
            <span className="font-medium">Linha {issue.row}:</span> {issue.message}
          </li>
        ))}
      </ul>
      {total > issues.length && <p className="text-xs mt-2 opacity-80">… e {total - issues.length} outra(s).</p>}
    </div>
  )
}

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      }
    >
      <ImportPageContent />
    </Suspense>
  )
}
