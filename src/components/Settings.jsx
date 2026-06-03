import { useState } from 'react'
import { Calendar, LogIn, LogOut, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { storage } from '../utils/storage'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export default function Settings() {
  const [token, setToken] = useState(() => storage.getGoogleToken()?.access_token ?? null)
  const [calendars, setCalendars] = useState([])
  const [selectedId, setSelectedId] = useState(() => storage.getCalendarId())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  async function signIn() {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services not loaded. Try refreshing the page.'))
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

  async function fetchCalendars(accessToken) {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (resp.status === 401) {
        storage.clearGoogleToken()
        setToken(null)
        throw new Error('Session expired. Please sign in again.')
      }
      if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`)
      const data = await resp.json()
      const items = (data.items ?? []).sort((a, b) => {
        if (a.primary) return -1
        if (b.primary) return 1
        return (a.summary ?? '').localeCompare(b.summary ?? '')
      })
      setCalendars(items)
      // keep current selection if it's still in the list, else default to primary
      const ids = items.map((c) => c.id)
      if (!ids.includes(selectedId)) {
        const primaryCal = items.find((c) => c.primary)
        const fallback = primaryCal?.id ?? items[0]?.id ?? 'primary'
        setSelectedId(fallback)
        storage.saveCalendarId(fallback)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    setError(null)
    try {
      const tok = await signIn()
      await fetchCalendars(tok)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReload() {
    if (!token) return
    await fetchCalendars(token)
  }

  function handleSignOut() {
    storage.clearGoogleToken()
    setToken(null)
    setCalendars([])
  }

  function handleSelect(e) {
    const id = e.target.value
    setSelectedId(id)
    storage.saveCalendarId(id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Google Calendar</h2>
        </div>

        {!CLIENT_ID && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>VITE_GOOGLE_CLIENT_ID</strong> is not configured. Add it to your <code>.env</code> file.
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {!token ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Connect your Google account to choose which calendar to sync sessions from.
            </p>
            <button
              onClick={handleConnect}
              disabled={!CLIENT_ID}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={15} />
              Connect Google Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                <CheckCircle size={15} />
                Connected
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Sync from calendar
                </label>
                {calendars.length === 0 && !loading && (
                  <button
                    onClick={handleReload}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Load calendars
                  </button>
                )}
                {calendars.length > 0 && (
                  <button
                    onClick={handleReload}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader size={14} className="animate-spin" />
                  Loading calendars…
                </div>
              ) : calendars.length === 0 ? (
                <button
                  onClick={handleReload}
                  className="w-full py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600"
                >
                  Click to load your calendars
                </button>
              ) : (
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={handleSelect}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    {calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.summary}{cal.primary ? ' (primary)' : ''}
                      </option>
                    ))}
                  </select>
                  {saved && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium pointer-events-none">
                      Saved
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                This calendar will be used when you click "Sync Week" on the dashboard.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
