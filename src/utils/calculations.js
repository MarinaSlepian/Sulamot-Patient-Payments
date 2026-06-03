export function calcScoreboard(patientId, sessions, payments) {
  const ps = sessions.filter((s) => s.patientId === patientId)
  const pp = payments.filter((p) => p.patientId === patientId)

  const heldSessions = ps.filter((s) => s.held)
  const totalHeld = heldSessions.length
  const totalPaid = pp.reduce((sum, p) => sum + (p.sessionsCovered ?? 0), 0)
  const sessionsInDebt = totalHeld - totalPaid

  const moneyCharged = heldSessions.reduce((sum, s) => sum + (s.price ?? 0), 0)
  const moneyPaid = pp.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const moneyBalance = moneyCharged - moneyPaid

  return { totalHeld, totalPaid, sessionsInDebt, moneyBalance }
}
