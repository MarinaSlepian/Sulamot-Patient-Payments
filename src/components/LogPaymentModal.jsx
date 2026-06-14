import { useState } from 'react'
import { X } from 'lucide-react'
import { useStoreContext } from '../context/StoreContext'

const today = () => new Date().toISOString().slice(0, 10)

export default function LogPaymentModal({ patientId, sessionPrice, onClose }) {
  const { addPayment } = useStoreContext()
  const [form, setForm] = useState({
    amount: sessionPrice ? String(parseFloat(sessionPrice)) : '300',
    method: 'cash',
    sessionsCovered: '1',
    date: today(),
    note: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'sessionsCovered') {
      const n = parseInt(value)
      const price = parseFloat(sessionPrice) || 0
      const auto = !isNaN(n) && n > 0 ? String(n * price) : form.amount
      setForm((f) => ({ ...f, sessionsCovered: value, amount: auto }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return
    addPayment({
      patientId,
      amount,
      method: form.method,
      sessionsCovered: parseInt(form.sessionsCovered) || 0,
      date: form.date,
      note: form.note.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Log Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₪) *</label>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="bit">Bit</option>
                <option value="paybox">PayBox</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sessions Covered</label>
              <input
                name="sessionsCovered"
                type="number"
                min="0"
                value={form.sessionsCovered}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional note"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
