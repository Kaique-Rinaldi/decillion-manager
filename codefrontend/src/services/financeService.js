// src/services/financeService.js
import { supabase } from "../lib/supabase"

// ─────────────────────────────────────────────────────────────
// FINANCIAL RECORDS
// ─────────────────────────────────────────────────────────────

export async function fetchFinancialRecords(filters = {}) {
  let query = supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company, avatar_url )
    `)
    .order("created_at", { ascending: false })

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }
  if (filters.client_id) {
    query = query.eq("client_id", filters.client_id)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchFinancialRecord(id) {
  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company, avatar_url )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createFinancialRecord(payload) {
  const { data, error } = await supabase
    .from("financial_records")
    .insert({
      client_id:    payload.client_id,
      title:        payload.title?.trim(),
      description:  payload.description?.trim() || null,
      total_amount: Number(payload.total_amount) || 0,
      start_date:   payload.start_date || null,
      due_date:     payload.due_date   || null,
      notes:        payload.notes?.trim() || null,
      status:       "pending",
      received_amount:  0,
      remaining_amount: Number(payload.total_amount) || 0,
    })
    .select(`*, clients ( id, name, company, avatar_url )`)
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
    .select(`*, clients ( id, name, company, avatar_url )`)
    .single()

  if (error) throw error
  return data
}

export async function deleteFinancialRecord(id) {
  const { error } = await supabase.from("financial_records").delete().eq("id", id)
  if (error) throw error
}

// Recalcula received/remaining/status após mudança de pagamentos
export async function recalculateRecord(recordId) {
  const { data: payments, error: pe } = await supabase
    .from("payments")
    .select("amount, status")
    .eq("financial_record_id", recordId)

  if (pe) throw pe

  const { data: record, error: re } = await supabase
    .from("financial_records")
    .select("total_amount")
    .eq("id", recordId)
    .single()

  if (re) throw re

  const received = payments
    .filter(p => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0)

  const total     = Number(record.total_amount)
  const remaining = Math.max(total - received, 0)

  let status = "pending"
  if (received >= total && total > 0) status = "paid"
  else if (received > 0) status = "partial"
  else {
    // verificar inadimplência pelo due_date dos pagamentos pendentes
    const today = new Date().toISOString().slice(0, 10)
    const overdue = payments.some(
      p => p.status === "pending" && p.due_date && p.due_date < today
    )
    if (overdue) status = "overdue"
  }

  const { data, error } = await supabase
    .from("financial_records")
    .update({ received_amount: received, remaining_amount: remaining, status })
    .eq("id", recordId)
    .select(`*, clients ( id, name, company, avatar_url )`)
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

  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)

  const totalRevenue  = data.reduce((s, r) => s + Number(r.total_amount),    0)
  const totalReceived = data.reduce((s, r) => s + Number(r.received_amount), 0)
  const totalPending  = data.filter(r => r.status === "pending" || r.status === "partial")
                             .reduce((s, r) => s + Number(r.remaining_amount), 0)
  const totalOverdue  = data.filter(r => r.status === "overdue")
                             .reduce((s, r) => s + Number(r.remaining_amount), 0)

  // Received this month: would need payments table — approximate from records
  const receivedThisMonth = data
    .filter(r => r.status === "paid" && r.due_date?.startsWith(thisMonth))
    .reduce((s, r) => s + Number(r.received_amount), 0)

  return {
    totalRevenue,
    totalReceived,
    totalPending,
    totalOverdue,
    receivedThisMonth,
    countRecords:  data.length,
    countOverdue:  data.filter(r => r.status === "overdue").length,
    countPaid:     data.filter(r => r.status === "paid").length,
    countPending:  data.filter(r => r.status === "pending" || r.status === "partial").length,
  }
}