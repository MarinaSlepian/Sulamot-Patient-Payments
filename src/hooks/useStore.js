import { useState, useCallback } from 'react'
import { storage } from '../utils/storage'
import { genId } from '../utils/id'

export function useStore() {
  const [patients, setPatients] = useState(() => storage.getPatients())
  const [sessions, setSessions] = useState(() => storage.getSessions())
  const [payments, setPayments] = useState(() => storage.getPayments())

  // --- patients ---
  const addPatient = useCallback((data) => {
    const p = { id: genId(), ...data }
    setPatients((prev) => {
      const next = [...prev, p]
      storage.savePatients(next)
      return next
    })
    return p
  }, [])

  const updatePatient = useCallback((id, data) => {
    setPatients((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      storage.savePatients(next)
      return next
    })
  }, [])

  const deletePatient = useCallback((id) => {
    setPatients((prev) => {
      const next = prev.filter((p) => p.id !== id)
      storage.savePatients(next)
      return next
    })
    setSessions((prev) => {
      const next = prev.filter((s) => s.patientId !== id)
      storage.saveSessions(next)
      return next
    })
    setPayments((prev) => {
      const next = prev.filter((p) => p.patientId !== id)
      storage.savePayments(next)
      return next
    })
  }, [])

  // --- sessions ---
  const addSession = useCallback((data) => {
    const s = { id: genId(), ...data }
    setSessions((prev) => {
      const next = [...prev, s]
      storage.saveSessions(next)
      return next
    })
    return s
  }, [])

  const updateSession = useCallback((id, data) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      storage.saveSessions(next)
      return next
    })
  }, [])

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      storage.saveSessions(next)
      return next
    })
  }, [])

  const addSessionsBatch = useCallback((list) => {
    setSessions((prev) => {
      const next = [...prev, ...list.map((s) => ({ id: genId(), ...s }))]
      storage.saveSessions(next)
      return next
    })
  }, [])

  // --- payments ---
  const addPayment = useCallback((data) => {
    const p = { id: genId(), ...data }
    setPayments((prev) => {
      const next = [...prev, p]
      storage.savePayments(next)
      return next
    })
    return p
  }, [])

  const updatePayment = useCallback((id, data) => {
    setPayments((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      storage.savePayments(next)
      return next
    })
  }, [])

  const deletePayment = useCallback((id) => {
    setPayments((prev) => {
      const next = prev.filter((p) => p.id !== id)
      storage.savePayments(next)
      return next
    })
  }, [])

  // --- data management ---
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(storage.exportAll(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sulamot-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          storage.importAll(data)
          setPatients(storage.getPatients())
          setSessions(storage.getSessions())
          setPayments(storage.getPayments())
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsText(file)
    })
  }, [])

  return {
    patients,
    sessions,
    payments,
    addPatient,
    updatePatient,
    deletePatient,
    addSession,
    updateSession,
    deleteSession,
    addSessionsBatch,
    addPayment,
    updatePayment,
    deletePayment,
    exportData,
    importData,
  }
}
