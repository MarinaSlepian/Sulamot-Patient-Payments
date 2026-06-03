import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Activity className="text-blue-600" size={22} />
          <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
            Sulamot Payments
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
