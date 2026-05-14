// src/hooks/useFinance.js
import { useState, useEffect, useCallback, useRef } from "react"
import {
  fetchFinancialRecords,
  fetchFinanceStats,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord,
} from "../services/financeService"

/**
 * BUG FIX:
 * The previous version passed `filters` directly into fetchFinancialRecords and
 * re-fetched every time filters changed. When `status === "all"` the service
 * still tried to query `.eq("status", "all")` which broke Supabase.
 *
 * NEW APPROACH:
 * - Always fetch ALL records once (or when forced via reload()).
 * - Apply status / search filtering CLIENT-SIDE in the hook so there are
 *   zero extra network calls when the user clicks a chip.
 * - `filters` state is kept for FinancePage to consume the filtered slice.
 */
export function useFinance(addToast) {
  const [allRecords, setAllRecords] = useState([])   // raw from DB
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [filters,    setFilters]    = useState({ status: "all", search: "" })

  // Stable toast ref so callbacks don't need it in deps
  const toastRef = useRef(addToast)
  useEffect(() => { toastRef.current = addToast }, [addToast])

  // ── load (fetches everything, no filter params to Supabase) ──
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [recs, st] = await Promise.all([
        fetchFinancialRecords(),   // no filter args — safe always
        fetchFinanceStats(),
      ])
      setAllRecords(recs)
      setStats(st)
    } catch (err) {
      setError(err)
      toastRef.current?.("Erro ao carregar financeiro.", "error")
    } finally {
      setLoading(false)
    }
  }, []) // stable — no deps needed

  useEffect(() => { load() }, [load])

  // ── client-side derived records ──────────────────────────────
  const records = (() => {
    let result = allRecords
    if (filters.status && filters.status !== "all") {
      result = result.filter(r => r.status === filters.status)
    }
    const q = filters.search?.trim().toLowerCase()
    if (q) {
      result = result.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.clients?.name?.toLowerCase().includes(q) ||
        r.clients?.company?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    }
    return result
  })()

  // ── mutations ────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    try {
      const st = await fetchFinanceStats()
      setStats(st)
    } catch { /* silent */ }
  }, [])

  const createRecord = useCallback(async (payload) => {
    try {
      const rec = await createFinancialRecord(payload)
      setAllRecords(prev => [rec, ...prev])
      refreshStats()
      toastRef.current?.("Registro financeiro criado!", "success")
      return rec
    } catch (err) {
      toastRef.current?.(`Erro ao criar registro: ${err?.message || "tente novamente"}`, "error")
      return null
    }
  }, [refreshStats])

  const updateRecord = useCallback(async (id, payload) => {
    try {
      const rec = await updateFinancialRecord(id, payload)
      setAllRecords(prev => prev.map(r => r.id === id ? rec : r))
      refreshStats()
      toastRef.current?.("Registro atualizado!", "success")
      return rec
    } catch (err) {
      toastRef.current?.(`Erro ao atualizar: ${err?.message || "tente novamente"}`, "error")
      return null
    }
  }, [refreshStats])

  const removeRecord = useCallback(async (id) => {
    try {
      await deleteFinancialRecord(id)
      setAllRecords(prev => prev.filter(r => r.id !== id))
      refreshStats()
      toastRef.current?.("Registro removido.", "warning")
    } catch (err) {
      toastRef.current?.(`Erro ao remover: ${err?.message || "tente novamente"}`, "error")
    }
  }, [refreshStats])

  // Called from FinanceDrawer after payment mutations recalculate the record
  const refreshRecord = useCallback((updatedRecord) => {
    setAllRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r))
    refreshStats()
  }, [refreshStats])

  return {
    records,          // filtered slice for display
    allRecords,       // raw, if needed
    stats,
    loading,
    error,
    filters,
    setFilters,       // FinancePage updates filters; no re-fetch
    reload: load,
    createRecord,
    updateRecord,
    removeRecord,
    refreshRecord,
  }
}