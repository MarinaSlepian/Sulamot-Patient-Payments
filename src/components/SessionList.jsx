import { useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import { Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'

export default function SessionList({ patientId }) {
  const { sessions, updateSession, deleteSession } = useStoreContext()
  const list = sessions
    .filter((s) => s.patientId === patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (list.length === 0) {
    return <p className="text-sm text-gray-400 py-3">No sessions recorded.</p>
  }

  return (
    <div className="space-y-1">
      {list.map((s) => (
        <SessionRow key={s.id} session={s} onUpdate={updateSession} onDelete={deleteSession} />
      ))}
    </div>
  )
}

function SessionRow({ session, onUpdate, onDelete }) {
  const [editPrice, setEditPrice] = useState(false)
  const [priceVal, setPriceVal] = useState(String(session.price ?? 0))
  const [confirmDel, setConfirmDel] = useState(false)

  function savePrice() {
    const n = parseFloat(priceVal)
    if (!isNaN(n)) onUpdate(session.id, { price: n })
    setEditPrice(false)
  }

  function toggleHeld() {
    onUpdate(session.id, { held: !session.held })
  }

  let dateStr = session.date
  try { dateStr = format(new Date(session.date), 'MMM d, yyyy') } catch {}

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleHeld}
          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
            session.held
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 text-gray-300'
          }`}
          title={session.held ? 'Mark as not held' : 'Mark as held'}
        >
          {session.held && <Check size={12} strokeWidth={3} />}
        </button>
        <span className="text-gray-600">{dateStr}</span>
      </div>

      <div className="flex items-center gap-3">
        {editPrice ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditPrice(false) }}
              autoFocus
              className="w-20 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={savePrice} className="text-green-600 hover:text-green-800"><Check size={14} /></button>
            <button onClick={() => setEditPrice(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        ) : (
          <button
            onClick={() => { setPriceVal(String(session.price ?? 0)); setEditPrice(true) }}
            className="text-gray-700 hover:text-blue-600 font-medium tabular-nums"
            title="Click to edit price"
          >
            ₪{(session.price ?? 0).toLocaleString()}
          </button>
        )}

        {confirmDel ? (
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(session.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
            <button onClick={() => setConfirmDel(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDel(true)} className="text-gray-300 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
