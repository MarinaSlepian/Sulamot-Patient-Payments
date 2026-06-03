import { HashRouter, Routes, Route } from 'react-router-dom'
import { StoreContext } from './context/StoreContext'
import { useStore } from './hooks/useStore'
import Dashboard from './components/Dashboard'
import PatientPage from './components/PatientPage'
import PatientForm from './components/PatientForm'
import Settings from './components/Settings'
import Layout from './components/Layout'

export default function App() {
  const store = useStore()

  return (
    <StoreContext.Provider value={store}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreContext.Provider>
  )
}
