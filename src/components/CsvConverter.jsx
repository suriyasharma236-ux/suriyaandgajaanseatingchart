import { useState } from 'react'

function parseCsv(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return { rows: [], error: 'CSV must have a header row and at least one data row.' }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const nameIdx = headers.findIndex(h => h === 'name')
  const tableIdx = headers.findIndex(h => h === 'table' || h === 'table_number' || h === 'table number')

  if (nameIdx === -1) return { rows: [], error: 'Could not find a "Name" column.' }
  if (tableIdx === -1) return { rows: [], error: 'Could not find a "Table" column.' }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    const name = cols[nameIdx]
    const table = cols[tableIdx]
    if (name && table) rows.push({ name, table })
  }
  return { rows, error: null }
}

export default function CsvConverter() {
  const [csv, setCsv] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  function handleConvert() {
    const { rows, error } = parseCsv(csv)
    setResult({ rows, error })
    setCopied(false)
  }

  function handleCopy() {
    const json = JSON.stringify(result.rows, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const json = result?.rows ? JSON.stringify(result.rows, null, 2) : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">CSV → JSON Converter</h1>
          <p className="text-slate-500 text-sm">Convert your guest list CSV into the format needed for <code className="bg-slate-100 px-1 rounded">guests.json</code></p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Paste your CSV here</label>
          <p className="text-xs text-slate-400 mb-3">Expected columns: <code className="bg-slate-100 px-1 rounded">Name</code> and <code className="bg-slate-100 px-1 rounded">Table</code></p>
          <textarea
            value={csv}
            onChange={e => setCsv(e.target.value)}
            rows={10}
            placeholder={"Name,Table\nJane Smith,5\nJohn Doe,12"}
            className="w-full font-mono text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-slate-300"
          />
          <button
            onClick={handleConvert}
            disabled={!csv.trim()}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Convert
          </button>
        </div>

        {result?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {result.error}
          </div>
        )}

        {result?.rows?.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">Preview — {result.rows.length} guests</h2>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-medium">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-700">{r.name}</td>
                        <td className="px-3 py-2 text-slate-500">{r.table}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">Generated JSON</h2>
                <button
                  onClick={handleCopy}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs overflow-x-auto max-h-48 overflow-y-auto font-mono text-slate-600">
                {json}
              </pre>
              <p className="mt-3 text-xs text-slate-400">
                Paste this into <code className="bg-slate-100 px-1 rounded">public/guests.json</code>, commit, and push — your hosting service will auto-deploy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
