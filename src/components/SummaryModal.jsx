import { useState } from 'react'
import { X } from 'lucide-react'
import { useStoreContext } from '../context/StoreContext'

function firstOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function SummaryModal({ onClose }) {
  const { patients, sessions, payments } = useStoreContext()
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())

  const rows = patients
    .map((p) => {
      const heldSessions = sessions.filter(
        (s) => s.patientId === p.id && s.held && s.date >= from && s.date <= to
      )
      const paidInPeriod = payments
        .filter((pay) => pay.patientId === p.id && pay.date >= from && pay.date <= to)
        .reduce((sum, pay) => sum + (pay.amount ?? 0), 0)

      const price = p.sessionPrice ? parseFloat(p.sessionPrice) : 300
      const owed = heldSessions.length * price
      const debt = Math.max(0, owed - paidInPeriod)
      return {
        name: p.name,
        sessionCount: heldSessions.length,
        sessionPrice: price,
        owed,
        paid: paidInPeriod,
        debt,
        covered: paidInPeriod >= owed && heldSessions.length > 0,
      }
    })
    .filter((r) => r.sessionCount > 0 || r.paid > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const totals = rows.reduce(
    (acc, r) => ({
      sessionCount: acc.sessionCount + r.sessionCount,
      owed: acc.owed + r.owed,
      paid: acc.paid + r.paid,
      debt: acc.debt + r.debt,
    }),
    { sessionCount: 0, owed: 0, paid: 0, debt: 0 }
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Summary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-auto flex-1 px-6 py-4">
          {rows.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No sessions or payments in this period.</p>
          ) : (
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                  <th className="py-2 px-3 border border-gray-200">Patient</th>
                  <th className="py-2 px-3 text-right border border-gray-200">Sessions</th>
                  <th className="py-2 px-3 text-right border border-gray-200">Price / session</th>
                  <th className="py-2 px-3 text-right border border-gray-200">Owed</th>
                  <th className="py-2 px-3 text-right border border-gray-200">Paid</th>
                  <th className="py-2 px-3 text-right border border-gray-200">Debt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className={r.debt > 0 ? 'bg-red-50' : ''}>
                    <td className="py-2.5 px-3 font-medium text-gray-800 border border-gray-200">{r.name}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 border border-gray-200">{r.sessionCount}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 border border-gray-200">₪{r.sessionPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 border border-gray-200">₪{r.owed.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 border border-gray-200">
                      {r.paid > 0 ? `₪${r.paid.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium border border-gray-200">
                      {r.debt > 0 ? <span className="text-red-600">₪{r.debt.toLocaleString()}</span> : <span className="text-green-600">✓</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold text-gray-800">
                  <td className="py-2.5 px-3 border border-gray-200">Total</td>
                  <td className="py-2.5 px-3 text-right border border-gray-200">{totals.sessionCount}</td>
                  <td className="py-2.5 px-3 border border-gray-200"></td>
                  <td className="py-2.5 px-3 text-right border border-gray-200">₪{totals.owed.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right border border-gray-200">₪{totals.paid.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right border border-gray-200">
                    {totals.debt > 0 ? <span className="text-red-600">₪{totals.debt.toLocaleString()}</span> : <span className="text-green-600">✓</span>}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
