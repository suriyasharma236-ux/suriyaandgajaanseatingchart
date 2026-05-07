import { useState, useEffect } from 'react'
import SearchView from './components/SearchView.jsx'
import CsvConverter from './components/CsvConverter.jsx'

export default function App() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const isConvert = params.get('convert') === '1'

  useEffect(() => {
    if (isConvert) { setLoading(false); return }
    fetch('/guests.json')
      .then(r => r.json())
      .then(data => { setGuests(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isConvert])

  if (isConvert) return <CsvConverter />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Find Your Seat</h1>
          <p className="text-slate-500 text-sm">Search your name to find your table</p>
        </div>
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading guest list…</div>
        ) : (
          <SearchView guests={guests} />
        )}
      </div>
    </div>
  )
}
