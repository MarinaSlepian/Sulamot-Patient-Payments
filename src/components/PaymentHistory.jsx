import { useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const METHOD_LABELS = { cash: 'Cash', transfer: 'Transfer', bit: 'Bit', paybox: 'PayBox', check: 'Check', other: 'Other' }

export default function PaymentHistory({ patientId }) {
  const { payments, deletePayment } = useStoreContext()
  const list = payments
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (list.length === 0) {
    return <p className="text-sm text-gray-400 py-3">No payments recorded.</p>
  }

  return (
    <div className="space-y-1">
      {list.map((p) => (
        <PaymentRow key={p.id} payment={p} onDelete={deletePayment} />
      ))}
    </div>
  )
}

function PaymentRow({ payment, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false)
  let dateStr = payment.date
  try { dateStr = format(new Date(payment.date), 'MMM d, yyyy') } catch {}

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
      <div className="flex items-center gap-3">
        <span className="text-gray-600">{dateStr}</span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
          {METHOD_LABELS[payment.method] ?? payment.method}
        </span>
        {payment.sessionsCovered > 0 && (
          <span className="text-gray-400 text-xs">{payment.sessionsCovered} session{payment.sessionsCovered !== 1 ? 's' : ''}</span>
        )}
        {payment.note && <span className="text-gray-400 text-xs italic truncate max-w-[160px]">{payment.note}</span>}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-green-700">₪{(payment.amount ?? 0).toLocaleString()}</span>
        {confirmDel ? (
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(payment.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
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
