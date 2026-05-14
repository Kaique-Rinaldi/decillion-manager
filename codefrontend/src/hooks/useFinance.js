// src/hooks/useFinance.js
import { useState, useEffect, useCallback } from "react"
import {
  fetchFinancialRecords,
  fetchFinanceStats,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
} from "../services/financeService"

export function useFinance(addToast) {
  const [records,   setRecords]   = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [filters,   setFilters]   = useState({ status: "all", search: "" })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [recs, st] = await Promise.all([
        fetchFinancialRecords(filters),
        fetchFinanceStats(),
      ])
      setRecords(recs)
      setStats(st)
    } catch (err) {
      setError(err)
      addToast?.("Erro ao carregar financeiro.", "error")
    } finally {
      setLoading(false)
    }
  }, [filters]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  const createRecord = useCallback(async (payload) => {
    try {
      const rec = await createFinancialRecord(payload)
      setRecords(prev => [rec, ...prev])
      await refreshStats()
      addToast?.("Registro financeiro criado!", "success")
      return rec
    } catch {
      addToast?.("Erro ao criar registro.", "error")
    }
  }, []) // eslint-disable-line

  const updateRecord = useCallback(async (id, payload) => {
    try {
      const rec = await updateFinancialRecord(id, payload)
      setRecords(prev => prev.map(r => r.id === id ? rec : r))
      await refreshStats()
      addToast?.("Registro atualizado!", "success")
      return rec
    } catch {
      addToast?.("Erro ao atualizar registro.", "error")
    }
  }, []) // eslint-disable-line

  const removeRecord = useCallback(async (id) => {
    try {
      await deleteFinancialRecord(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      await refreshStats()
      addToast?.("Registro removido.", "warning")
    } catch {
      addToast?.("Erro ao remover registro.", "error")
    }
  }, []) // eslint-disable-line

  const refreshRecord = useCallback((updatedRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r))
    refreshStats()
  }, []) // eslint-disable-line

  const refreshStats = useCallback(async () => {
    try {
      const st = await fetchFinanceStats()
      setStats(st)
    } catch { /* silent */ }
  }, [])

  return {
    records,
    stats,
    loading,
    error,
    filters,
    setFilters,
    reload:        load,
    createRecord,
    updateRecord,
    removeRecord,
    refreshRecord,
  }
}