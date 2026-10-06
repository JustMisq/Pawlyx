'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Pesquisar...',
  emptyMessage = 'Nenhum resultado',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find((option) => option.value === value)

  const filtered = useMemo(() => {
    const terms = normalize(query).split(' ').filter(Boolean)
    if (terms.length === 0) return options
    return options.filter((option) => {
      const haystack = normalize(`${option.label} ${option.description || ''}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  useEffect(() => {
    setHighlighted(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  const openPanel = () => {
    if (disabled || open) return
    setOpen(true)
    setQuery('')
  }

  const select = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      setQuery('')
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      setQuery('')
      return
    }
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault()
      openPanel()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((prev) => Math.max(prev - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[highlighted]
      if (option) select(option.value)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={open ? query : selected?.label || ''}
          placeholder={open ? searchPlaceholder : placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={openPanel}
          onClick={openPanel}
          onKeyDown={handleKeyDown}
          className="input-base pl-9 pr-16 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {selected && !disabled && (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={() => {
                onChange('')
                setQuery('')
                setOpen(false)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Abrir lista"
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : inputRef.current?.focus())}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto overscroll-contain bg-white border border-gray-200 rounded-xl shadow-lg py-1"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => select(option.value)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 transition-colors',
                    index === highlighted ? 'bg-teal-50' : 'bg-white'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900 truncate">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-gray-500 truncate">{option.description}</span>
                    )}
                  </span>
                  {option.value === value && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
