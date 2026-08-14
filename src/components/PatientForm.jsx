import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStoreContext } from '../context/StoreContext'
import { Trash2, AlertCircle } from 'lucide-react'

export default function PatientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, addPatient, updatePatient, deletePatient } = useStoreContext()

  const existing = id ? patients.find((p) => p.id === id) : null
  const isEdit = Boolean(existing)

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    phone: existing?.phone ?? '',
    notes: existing?.notes ?? '',
    sessionPrice: existing?.sessionPrice ?? '300',
    active: existing?.active ?? true,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dupError, setDupError] = useState(false)

  function handleChange(e) {
    setDupError(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const duplicate = patients.some(
      (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.id !== id
    )
    if (duplicate) { setDupError(true); return }
    if (isEdit) {
      updatePatient(id, form)
      navigate(`/patients/${id}`)
    } else {
      const p = addPatient(form)
      navigate(`/patients/${p.id}`)
    }
  }

  function handleDelete() {
    deletePatient(id)
    navigate('/')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Patient' : 'New Patient'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${dupError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`}
            placeholder="Patient name"
          />
          {dupError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
              <AlertCircle size={14} />
              A patient named "{form.name.trim()}" already exists.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session price (₪)</label>
          <input
            name="sessionPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.sessionPrice}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="300"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            Active
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Any notes..."
          />
        </div>
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/patients/${id}` : '/')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEdit ? 'Save Changes' : 'Create Patient'}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="mt-6">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} />
              Delete patient and all their data
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
              <p className="text-red-800 font-medium mb-3">
                Delete {existing.name}? This removes all sessions and payments. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
