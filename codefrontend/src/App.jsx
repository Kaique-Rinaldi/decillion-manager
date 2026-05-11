import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useAuth }    from './hooks/useAuth'
import { useClients } from './hooks/useClients'
import { useToast }   from './hooks/useToast'

import LoginPage   from './components/shared/auth/LoginPage'
import Sidebar     from './components/layout/Sidebar'
import Dashboard   from './components/dashboard/Dashboard'
import ClientsPage from './components/clients/ClientsPage'
import ToastContainer from './components/shared/Toast'

// ─── Page transition ──────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: .22 } },
  exit:    { opacity: 0, y: -6, transition: { duration: .15 } },
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading, error, login, logout, setError } = useAuth()
  const {
    filteredClients, stats, clients,
    search, setSearch,
    filterPayment, setFilterPayment,
    filterProject, setFilterProject,
    sortBy, setSortBy,
    addClient, updateClient, deleteClient,
  } = useClients()

  const { toasts, addToast, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')

  // ── Not logged in → show Login ────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <LoginPage
          onLogin={login}
          loading={loading}
          error={error}
          clearError={() => setError('')}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  // ── Logged in → main layout ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={logout}
        clientCount={clients.length}
      />

      {/* Main content */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg)',
        minWidth: 0, // prevent overflow
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                clients={clients}
                onNavigateToClients={() => setActiveTab('clients')}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsPage
                filteredClients={filteredClients}
                stats={stats}
                search={search}           setSearch={setSearch}
                filterPayment={filterPayment} setFilterPayment={setFilterPayment}
                filterProject={filterProject} setFilterProject={setFilterProject}
                sortBy={sortBy}           setSortBy={setSortBy}
                addClient={addClient}
                updateClient={updateClient}
                deleteClient={deleteClient}
                addToast={addToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}