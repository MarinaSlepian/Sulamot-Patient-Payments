export default function Scoreboard({ score, hasDebt }) {
  const { totalHeld, totalPaid, sessionsInDebt, moneyBalance } = score

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border ${hasDebt ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
      <Tile label="Sessions Held" value={totalHeld} />
      <Tile label="Sessions Paid" value={totalPaid} />
      <Tile
        label="Sessions in Debt"
        value={sessionsInDebt}
        highlight={sessionsInDebt > 0 ? 'red' : sessionsInDebt < 0 ? 'green' : null}
      />
      <Tile
        label="Money Balance"
        value={moneyBalance > 0 ? `₪${moneyBalance.toLocaleString()} owed` : moneyBalance < 0 ? `₪${Math.abs(moneyBalance).toLocaleString()} credit` : 'Settled'}
        highlight={moneyBalance > 0 ? 'red' : moneyBalance < 0 ? 'green' : null}
      />
    </div>
  )
}

function Tile({ label, value, highlight }) {
  const color = highlight === 'red' ? 'text-red-700' : highlight === 'green' ? 'text-green-700' : 'text-gray-800'
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
