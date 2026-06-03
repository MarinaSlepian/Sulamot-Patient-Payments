import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { useStoreContext } from '../context/StoreContext'
import { calcScoreboard } from '../utils/calculations'
import Scoreboard from './Scoreboard'
import SessionList from './SessionList'
import PaymentHistory from './PaymentHistory'
import LogPaymentModal from './LogPaymentModal'
import AddSessionModal from './AddSessionModal'

export default function PatientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, sessions, payments } = useStoreContext()

  const patient = patients.find((p) => p.id === id)
  const [showPayment, setShowPayment] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)

  if (!patient) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Patient not found.</p>
        <Link to="/" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to dashboard</Link>
      </div>
    )
  }

  const score = calcScoreboard(id, sessions, payments)
  const hasDebt = score.sessionsInDebt > 0 || score.moneyBalance > 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Patients</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
          {patient.phone && <p className="text-sm text-gray-400 mt-0.5">{patient.phone}</p>}
          {patient.notes && <p className="text-sm text-gray-500 mt-1">{patient.notes}</p>}
        </div>
        <Link
          to={`/patients/${id}/edit`}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>

      <Scoreboard score={score} hasDebt={hasDebt} />

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Sessions</h2>
        <button
          onClick={() => setShowAddSession(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          <Plus size={14} />
          Add Session
        </button>
      </div>
      <SessionList patientId={id} />

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Payments</h2>
        <button
          onClick={() => setShowPayment(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={14} />
          Log Payment
        </button>
      </div>
      <PaymentHistory patientId={id} />

      {showPayment && (
        <LogPaymentModal patientId={id} onClose={() => setShowPayment(false)} />
      )}
      {showAddSession && (
        <AddSessionModal patientId={id} onClose={() => setShowAddSession(false)} />
      )}
    </div>
  )
}
