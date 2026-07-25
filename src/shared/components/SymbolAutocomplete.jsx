import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { endpoints } from '../api/endpoints'

export default function SymbolAutocomplete({ value, onChange, required, placeholder }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get(endpoints.stocks.search, {
          params: { q: query },
          signal: controller.signal,
        })
        setResults(data)
        setOpen(true)
      } catch {
        // ignore aborted/failed search requests
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(result) {
    setQuery(result.symbol)
    onChange(result.symbol)
    setOpen(false)
  }

  function handleInputChange(e) {
    const raw = e.target.value.toUpperCase()
    setQuery(raw)
    onChange(raw)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder || 'Sembol veya şirket adı ara'}
        required={required}
        autoComplete="off"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-brand-bg"
              >
                <span className="font-medium">{r.symbol}</span>
                <span className="text-xs text-gray-500">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
