import { Link, useLocation } from 'react-router-dom'
import { Activity, Settings } from 'lucide-react'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={22} />
            <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
              Sulamot Payments
            </Link>
          </div>
          <Link
            to="/settings"
            className={`p-2 rounded-lg transition-colors ${pathname === '/settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
