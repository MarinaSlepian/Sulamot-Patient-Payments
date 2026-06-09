import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Download, Upload, Calendar, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react'
import { useStoreContext } from '../context/StoreContext'
import { calcScoreboard } from '../utils/calculations'
import GoogleCalendarSync from './GoogleCalendarSync'
import SummaryModal from './SummaryModal'

export default function Dashboard() {
  const { patients, sessions, payments, exportData, importData } = useStoreContext()
  const [showSync, setShowSync] = useState(false)
  const [showSyncDay, setShowSyncDay] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [importMsg, setImportMsg] = useState(null)
  const fileRef = useRef()

  const rows = patients
    .map((p) => ({ patient: p, score: calcScoreboard(p.id, sessions, payments) }))
    .sort((a, b) => {
      const aDebt = a.score.sessionsInDebt > 0 || a.score.moneyBalance > 0 ? 1 : 0
      const bDebt = b.score.sessionsInDebt > 0 || b.score.moneyBalance > 0 ? 1 : 0
      if (bDebt !== aDebt) return bDebt - aDebt
      return a.patient.name.localeCompare(b.patient.name)
    })

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importData(file)
      setImportMsg({ ok: true, text: 'Data imported successfully.' })
    } catch {
      setImportMsg({ ok: false, text: 'Failed to import — invalid JSON file.' })
    }
    e.target.value = ''
    setTimeout(() => setImportMsg(null), 4000)
  }

  const hasDebt = (score) => score.sessionsInDebt > 0 || score.moneyBalance > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <BarChart2 size={15} />
            Summary
          </button>
          <button
            onClick={() => setShowSyncDay(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Calendar size={15} />
            Sync Day
          </button>
          <button
            onClick={() => setShowSync(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Calendar size={15} />
            Sync Week
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => fileRef.current.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Upload size={15} />
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Link
            to="/patients/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={15} />
            Add Patient
          </Link>
        </div>
      </div>

      {importMsg && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-lg text-sm ${importMsg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {importMsg.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {importMsg.text}
        </div>
      )}

      {patients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No patients yet.</p>
          <Link to="/patients/new" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            Add your first patient →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ patient, score }, index) => {
            const debt = hasDebt(score)
            const credit = !debt && score.moneyBalance < 0
            return (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors hover:shadow-sm ${
                  debt
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : credit
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-6 text-right shrink-0 ${debt ? 'text-red-400' : credit ? 'text-green-400' : 'text-gray-300'}`}>
                    {index + 1}.
                  </span>
                  {debt ? (
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${debt ? 'text-red-800' : credit ? 'text-green-800' : 'text-gray-800'}`}>
                      {patient.name}
                    </p>
                    {patient.phone && (
                      <p className="text-xs text-gray-400">{patient.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-right">
                  <div>
                    <p className="text-xs text-gray-400">Sessions</p>
                    <p className={`font-semibold ${debt ? 'text-red-700' : credit ? 'text-green-700' : 'text-gray-700'}`}>
                      {score.totalHeld} held / {score.totalPaid} paid
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className={`font-semibold ${score.moneyBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {score.moneyBalance > 0 ? `₪${score.moneyBalance.toLocaleString()} owed` : score.moneyBalance < 0 ? `₪${Math.abs(score.moneyBalance).toLocaleString()} credit` : 'Settled'}
                    </p>
                  </div>
                  {score.sessionsInDebt > 0 && (
                    <div>
                      <p className="text-xs text-gray-400">Debt</p>
                      <p className="font-semibold text-red-700">{score.sessionsInDebt} session{score.sessionsInDebt !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showSyncDay && <GoogleCalendarSync mode="day" onClose={() => setShowSyncDay(false)} />}
      {showSync && <GoogleCalendarSync onClose={() => setShowSync(false)} />}
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
    </div>
  )
}
