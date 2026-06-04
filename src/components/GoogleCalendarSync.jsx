import { useState, useEffect } from 'react'
import { X, Calendar, AlertCircle, Loader, Trash2 } from 'lucide-react'
import { useStoreContext } from '../context/StoreContext'
import { storage } from '../utils/storage'
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

function getWeekRange(offset = 0) {
  const base = addWeeks(new Date(), offset)
  const start = startOfWeek(base, { weekStartsOn: 0 })
  const end = endOfWeek(base, { weekStartsOn: 0 })
  return { start, end }
}

export default function GoogleCalendarSync({ onClose }) {
  const { patients, sessions, addSessionsBatch, deleteSessionsBatch } = useStoreContext()
  const [step, setStep] = useState('pick') // pick | loading | preview | done
  const [weekOffset, setWeekOffset] = useState(0)
  const [token, setToken] = useState(() => storage.getGoogleToken()?.access_token ?? null)
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState({})
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const { start, end } = getWeekRange(weekOffset)

  async function signIn() {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services not loaded.'))
        return
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) { reject(new Error(resp.error)); return }
          storage.saveGoogleToken(resp)
          setToken(resp.access_token)
          resolve(resp.access_token)
        },
      })
      client.requestAccessToken()
    })
  }

  async function fetchEvents(accessToken) {
    setStep('loading')
    setError(null)
    try {
      const params = new URLSearchParams({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
      })
      const calendarId = encodeURIComponent(storage.getCalendarId())
      const resp = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (resp.status === 401) {
        storage.clearGoogleToken()
        setToken(null)
        throw new Error('Token expired. Please sign in again.')
      }
      if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`)
      const data = await resp.json()

      const matched = (data.items ?? []).flatMap((ev) => {
        const title = ev.summary ?? ''
        const matchedPatients = patients.filter((p) => {
          const escaped = p.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`(?<![\\p{L}\\d&+/\\-])${escaped}(?![\\p{L}\\d&+/\\-])`, 'iu').test(title)
        })
        const date = (ev.start?.date ?? ev.start?.dateTime ?? '').slice(0, 10)
        return matchedPatients.map((p) => {
          const duplicate = sessions.some(
            (s) => s.patientId === p.id && s.date === date
          )
          return { eventId: ev.id, patientId: p.id, patientName: p.name, title, date, duplicate }
        })
      })

      setEvents(matched)
      const sel = {}
      matched.forEach((ev, i) => { sel[i] = !ev.duplicate })
      setSelected(sel)
      setStep('preview')
    } catch (err) {
      setError(err.message)
      setStep('pick')
    }
  }

  const sessionsInWeek = sessions.filter((s) => s.date >= start.toISOString().slice(0, 10) && s.date <= end.toISOString().slice(0, 10))

  function handleClearWeek() {
    deleteSessionsBatch(sessionsInWeek.map((s) => s.id))
    setConfirmClear(false)
  }

  async function handleSync() {
    try {
      let tok = token
      if (!tok) tok = await signIn()
      await fetchEvents(tok)
    } catch (err) {
      setError(err.message)
    }
  }

  function toggleSelect(i) {
    setSelected((s) => ({ ...s, [i]: !s[i] }))
  }

  function handleImport() {
    setImporting(true)
    const toImport = events
      .filter((_, i) => selected[i])
      .map((ev) => ({
        patientId: ev.patientId,
        date: ev.date,
        price: 300,
        held: true,
      }))
    addSessionsBatch(toImport)
    setStep('done')
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Sync from Google Calendar</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'pick' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Fetch events from your Google Calendar for a specific week. Events whose titles contain a patient's name will be imported as sessions.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select week</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-700 min-w-[180px] text-center">
                    {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {!CLIENT_ID && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  VITE_GOOGLE_CLIENT_ID is not set. Add it to your .env file.
                </div>
              )}

              <button
                onClick={handleSync}
                disabled={!CLIENT_ID}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {token ? 'Fetch Events' : 'Sign in & Fetch Events'}
              </button>

              <div className="border-t border-gray-100 pt-3">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    disabled={sessionsInWeek.length === 0}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    Clear week
                    {sessionsInWeek.length > 0 && <span className="text-red-400">({sessionsInWeek.length} session{sessionsInWeek.length !== 1 ? 's' : ''})</span>}
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    <p className="text-red-800 font-medium mb-2">
                      Delete all {sessionsInWeek.length} session{sessionsInWeek.length !== 1 ? 's' : ''} for {format(start, 'MMM d')}–{format(end, 'MMM d')}?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={handleClearWeek} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium">
                        Yes, clear
                      </button>
                      <button onClick={() => setConfirmClear(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {token && (
                <button
                  onClick={() => { storage.clearGoogleToken(); setToken(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
                >
                  Sign out of Google
                </button>
              )}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
              <Loader size={24} className="animate-spin" />
              <p className="text-sm">Fetching calendar events…</p>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-3">
              {(() => {
                const newCount = events.filter((e) => !e.duplicate).length
                const dupCount = events.filter((e) => e.duplicate).length
                return (
                  <p className="text-sm text-gray-600">
                    Found <strong>{newCount} new</strong> event{newCount !== 1 ? 's' : ''}
                    {dupCount > 0 && <> and <span className="text-amber-600 font-medium">{dupCount} already imported</span></>}
                    {' '}for {format(start, 'MMM d')}–{format(end, 'MMM d')}.
                  </p>
                )
              })()}

              {events.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No events matched any patient names.</p>
              ) : (
                <div className="space-y-1">
                  {events.map((ev, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        ev.duplicate
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : selected[i]
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[i]}
                        onChange={() => toggleSelect(i)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">
                          {ev.patientName} · {ev.date ? format(new Date(ev.date + 'T00:00:00'), 'MMM d, yyyy') : ev.date}
                        </p>
                      </div>
                      {ev.duplicate && (
                        <span className="shrink-0 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                          Already imported
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-3">✓</div>
              <p className="text-gray-800 font-medium">Sessions imported!</p>
              <p className="text-sm text-gray-400 mt-1">Prices are set to ₪300 — edit them on each patient's page if needed.</p>
            </div>
          )}
        </div>

        {step === 'preview' && events.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-between">
            <button
              onClick={() => setStep('pick')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleImport}
              disabled={!Object.values(selected).some(Boolean) || importing}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Import {Object.values(selected).filter(Boolean).length} Session{Object.values(selected).filter(Boolean).length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
