import { useState, useEffect, useMemo } from 'react'
import { SEED_CLIENTS } from '../data/mockData'

const STORAGE_KEY = 'dcl_clients'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
  return 'client_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_CLIENTS // primeiro acesso: carrega dados demo
    return JSON.parse(raw)
  } catch {
    return SEED_CLIENTS
  }
}

function saveToStorage(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

// ─── useClients ───────────────────────────────────────────────────────────────
// Gerencia CRUD completo de clientes com filtros e estatísticas.
export function useClients() {
  const [clients, setClients] = useState(loadFromStorage)
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterProject, setFilterProject] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt_desc')

  // Persiste sempre que clientes mudam
  useEffect(() => {
    saveToStorage(clients)
  }, [clients])

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function addClient(data) {
    const newClient = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setClients(prev => [newClient, ...prev])
    return newClient
  }

  function updateClient(id, data) {
    setClients(prev =>
      prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)
    )
  }

  function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  function getClientById(id) {
    return clients.find(c => c.id === id)
  }

  // ── FILTERED + SORTED LIST ───────────────────────────────────────────────
  const filteredClients = useMemo(() => {
    let result = [...clients]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
      )
    }

    // Payment filter
    if (filterPayment !== 'all') {
      result = result.filter(c => c.paymentStatus === filterPayment)
    }

    // Project filter
    if (filterProject !== 'all') {
      result = result.filter(c => c.projectStatus === filterProject)
    }

    // Sort
    const [field, dir] = sortBy.split('_')
    result.sort((a, b) => {
      let va = a[field], vb = b[field]
      if (field === 'projectValue') { va = Number(va); vb = Number(vb) }
      if (field === 'name')         { va = va?.toLowerCase(); vb = vb?.toLowerCase() }
      if (va < vb) return dir === 'asc' ? -1 : 1
      if (va > vb) return dir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [clients, search, filterPayment, filterProject, sortBy])

  // ── STATS ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = clients.length
    const active = clients.filter(c => c.projectStatus === 'andamento').length
    const concluded = clients.filter(c => c.projectStatus === 'concluido').length
    const totalValue = clients.reduce((sum, c) => sum + Number(c.projectValue || 0), 0)
    const paidValue = clients
      .filter(c => c.paymentStatus === 'pago')
      .reduce((sum, c) => sum + Number(c.projectValue || 0), 0)
    const pendingValue = clients
      .filter(c => c.paymentStatus !== 'pago')
      .reduce((sum, c) => sum + Number(c.projectValue || 0), 0)
    const overdue = clients.filter(c => c.paymentStatus === 'atrasado').length

    return { total, active, concluded, totalValue, paidValue, pendingValue, overdue }
  }, [clients])

  return {
    clients,
    filteredClients,
    stats,
    search, setSearch,
    filterPayment, setFilterPayment,
    filterProject, setFilterProject,
    sortBy, setSortBy,
    addClient, updateClient, deleteClient, getClientById,
  }
}