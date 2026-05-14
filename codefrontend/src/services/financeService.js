// src/services/financeService.js
import { supabase } from "../lib/supabase"

// ─────────────────────────────────────────────────────────────
// FINANCIAL RECORDS
// BUG FIX: fetchFinancialRecords no longer accepts filter params.
// Filtering is done client-side in useFinance to avoid invalid
// Supabase queries (e.g. .eq("status","all") breaking the request).
// ─────────────────────────────────────────────────────────────

export async function fetchFinancialRecords() {
  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchFinancialRecord(id) {
  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createFinancialRecord(payload) {
  const totalAmount = Number(payload.total_amount) || 0

  const insert = {
    client_id:        payload.client_id,
    title:            payload.title?.trim(),
    description:      payload.description?.trim() || null,
    total_amount:     totalAmount,
    received_amount:  0,
    remaining_amount: totalAmount,   // BUG FIX: always set on create
    status:           "pending",     // BUG FIX: always "pending" on create
    start_date:       payload.start_date || null,
    due_date:         payload.due_date   || null,
    notes:            payload.notes?.trim() || null,
  }

  const { data, error } = await supabase
    .from("financial_records")
    .insert(insert)
    .select(`*, clients ( id, name, company )`)
    .single()

  if (error) throw error
  return data
}

export async function updateFinancialRecord(id, payload) {
  const patch = {}
  if (payload.title        !== undefined) patch.title        = payload.title?.trim()
  if (payload.description  !== undefined) patch.description  = payload.description?.trim() || null
  if (payload.total_amount !== undefined) patch.total_amount = Number(payload.total_amount)
  if (payload.start_date   !== undefined) patch.start_date   = payload.start_date || null
  if (payload.due_date     !== undefined) patch.due_date     = payload.due_date   || null
  if (payload.notes        !== undefined) patch.notes        = payload.notes?.trim() || null
  if (payload.status       !== undefined) patch.status       = payload.status

  const { data, error } = await supabase
    .from("financial_records")
    .update(patch)
    .eq("id", id)
    .select(`*, clients ( id, name, company )`)
    .single()

  if (error) throw error
  return data
}

export async function deleteFinancialRecord(id) {
  const { error } = await supabase.from("financial_records").delete().eq("id", id)
  if (error) throw error
}

// Recalculates received/remaining/status after payment changes
export async function recalculateRecord(recordId) {
  const { data: payments, error: pe } = await supabase
    .from("payments")
    .select("amount, status, due_date")
    .eq("financial_record_id", recordId)

  if (pe) throw pe

  const { data: record, error: re } = await supabase
    .from("financial_records")
    .select("total_amount")
    .eq("id", recordId)
    .single()

  if (re) throw re

  const received  = payments
    .filter(p => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0)

  const total     = Number(record.total_amount)
  const remaining = Math.max(total - received, 0)

  let status = "pending"
  if (received >= total && total > 0) {
    status = "paid"
  } else if (received > 0) {
    status = "partial"
  } else {
    const today   = new Date().toISOString().slice(0, 10)
    const overdue = payments.some(
      p => p.status === "pending" && p.due_date && p.due_date < today
    )
    if (overdue) status = "overdue"
  }

  const { data, error } = await supabase
    .from("financial_records")
    .update({ received_amount: received, remaining_amount: remaining, status })
    .eq("id", recordId)
    .select(`*, clients ( id, name, company )`)
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────

export async function fetchFinanceStats() {
  const { data, error } = await supabase
    .from("financial_records")
    .select("total_amount, received_amount, remaining_amount, status, due_date")

  if (error) throw error

  const totalRevenue  = data.reduce((s, r) => s + Number(r.total_amount),    0)
  const totalReceived = data.reduce((s, r) => s + Number(r.received_amount), 0)
  const totalPending  = data
    .filter(r => r.status === "pending" || r.status === "partial")
    .reduce((s, r) => s + Number(r.remaining_amount), 0)
  const totalOverdue  = data
    .filter(r => r.status === "overdue")
    .reduce((s, r) => s + Number(r.remaining_amount), 0)

  return {
    totalRevenue,
    totalReceived,
    totalPending,
    totalOverdue,
    countRecords: data.length,
    countOverdue: data.filter(r => r.status === "overdue").length,
    countPaid:    data.filter(r => r.status === "paid").length,
    countPending: data.filter(r => r.status === "pending" || r.status === "partial").length,
  }
}