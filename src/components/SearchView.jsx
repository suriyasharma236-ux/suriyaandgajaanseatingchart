import { useState, useRef, useEffect } from 'react'

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-indigo-600">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SearchView({ guests }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selected, setSelected] = useState(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const containerRef = useRef(null)

  const matches = query.length > 0
    ? guests.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    : []

  useEffect(() => {
    setActiveIdx(-1)
  }, [query])

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      selectGuest(matches[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function selectGuest(guest) {
    setSelected(guest)
    setOpen(false)
    setQuery('')
  }

  function reset() {
    setSelected(null)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (selected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <p className="text-slate-500 text-sm mb-1">Welcome,</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{selected.name}</h2>
        <div className="bg-indigo-50 rounded-xl py-5 px-8 inline-block mb-6">
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-1">Your Table</p>
          <p className="text-6xl font-extrabold text-indigo-600">{selected.table}</p>
        </div>
        <p className="text-slate-500 text-sm mb-4">Find your table on the floor plan below:</p>
        <img
          src="/floor-plan.png"
          alt="Event floor plan"
          className="w-full rounded-xl border border-slate-200 mb-6"
        />
        <button
          onClick={reset}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
        >
          Search again
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing your name…"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-slate-400"
      />

      {open && query.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No matches found</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {matches.map((g, i) => (
                <li
                  key={i}
                  onMouseDown={() => selectGuest(g)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${
                    i === activeIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-slate-700">{highlight(g.name, query)}</span>
                  <span className="ml-3 shrink-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Table {g.table}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
