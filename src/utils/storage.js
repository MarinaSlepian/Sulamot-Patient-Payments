const KEYS = {
  patients: 'spp_patients',
  sessions: 'spp_sessions',
  payments: 'spp_payments',
  googleToken: 'spp_google_token',
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const storage = {
  getPatients: () => load(KEYS.patients),
  savePatients: (d) => save(KEYS.patients, d),

  getSessions: () => load(KEYS.sessions),
  saveSessions: (d) => save(KEYS.sessions, d),

  getPayments: () => load(KEYS.payments),
  savePayments: (d) => save(KEYS.payments, d),

  getGoogleToken: () => {
    try {
      const raw = localStorage.getItem(KEYS.googleToken)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  saveGoogleToken: (t) => localStorage.setItem(KEYS.googleToken, JSON.stringify(t)),
  clearGoogleToken: () => localStorage.removeItem(KEYS.googleToken),

  exportAll() {
    return {
      patients: load(KEYS.patients),
      sessions: load(KEYS.sessions),
      payments: load(KEYS.payments),
    }
  },

  importAll({ patients, sessions, payments }) {
    save(KEYS.patients, patients ?? [])
    save(KEYS.sessions, sessions ?? [])
    save(KEYS.payments, payments ?? [])
  },
}
