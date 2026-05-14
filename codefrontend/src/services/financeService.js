// src/services/financeService.js
import { supabase } from "../lib/supabase"

// ─────────────────────────────────────────────────────────────
// PROJECT FINANCES  (vinculado diretamente ao client_id)
// ─────────────────────────────────────────────────────────────

/**
 * Busca o financeiro pelo client_id.
 */
export async function fetchProjectFinanceByClient(clientId) {
  const { data, error } = await supabase
    .from("project_finances")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/**
 * Busca o financeiro pelo seu próprio id (para refresh após operações).
 */
export async function fetchProjectFinance_byId(financeId) {
  const { data, error } = await supabase
    .from("project_finances")
    .select("*")
    .eq("id", financeId)
    .single()

  if (error) throw error
  return data
}

/**
 * Garante que o financeiro exista para o cliente.
 *
 * Fluxo:
 *   1. Busca por client_id
 *   2. Se já existir → retorna sem criar nada
 *   3. Se não existir → cria diretamente com client_id
 *
 * Retorna { data: ProjectFinance, alreadyExisted: boolean }
 *
 * ✅ Zero inserts em `projects`
 * ✅ Zero FK errors em `projects`
 * ✅ Zero RLS errors em `projects`
 */
export async function ensureProjectFinance(clientId, payload = {}) {
  // ── Etapa 1: verificar existência ──────────────────────────
  const existing = await fetchProjectFinanceByClient(clientId)
  if (existing) {
    return { data: existing, alreadyExisted: true }
  }

  // ── Etapa 2: criar financeiro vinculado ao cliente ─────────
  const { data, error } = await supabase
    .from("project_finances")
    .insert({
      client_id:    clientId,
      total_amount: Number(payload.total_amount) || 0,
      payment_type: payload.payment_type || null,
      notes:        payload.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    // Corrida rara: outro processo criou entre o select e o insert
    if (error.code === "23505") {
      const fallback = await fetchProjectFinanceByClient(clientId)
      if (fallback) return { data: fallback, alreadyExisted: true }
    }
    throw error
  }

  return { data, alreadyExisted: false }
}

// Alias de compatibilidade para chamadas antigas
export async function createProjectFinance(clientId, _projectId, payload) {
  const { data } = await ensureProjectFinance(clientId, payload)
  return data
}

export async function updateProjectFinance(financeId, payload) {
  const patch = {}
  if (payload.total_amount !== undefined) patch.total_amount = Number(payload.total_amount)
  if (payload.payment_type !== undefined) patch.payment_type = payload.payment_type
  if (payload.notes        !== undefined) patch.notes        = payload.notes?.trim() || null

  const { data, error } = await supabase
    .from("project_finances")
    .update(patch)
    .eq("id", financeId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────

export async function fetchPaymentsByFinance(financeId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("finance_id", financeId)
    .order("due_date", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createPayment(financeId, form) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      finance_id:     financeId,
      title:          form.title?.trim(),
      description:    form.description?.trim() || null,
      amount:         Number(form.amount),
      status:         form.status         || "pending",
      payment_method: form.payment_method || "pix",
      due_date:       form.due_date       || null,
      paid_at:        form.status === "paid"
                        ? (form.paid_at || new Date().toISOString().slice(0, 10))
                        : null,
      notes:          form.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePayment(id, form) {
  const payload = {}
  if (form.title          !== undefined) payload.title          = form.title?.trim()
  if (form.description    !== undefined) payload.description    = form.description?.trim() || null
  if (form.amount         !== undefined) payload.amount         = Number(form.amount)
  if (form.status         !== undefined) payload.status         = form.status
  if (form.payment_method !== undefined) payload.payment_method = form.payment_method
  if (form.due_date       !== undefined) payload.due_date       = form.due_date || null
  if (form.notes          !== undefined) payload.notes          = form.notes?.trim() || null

  if (form.status === "paid") {
    payload.paid_at = form.paid_at || new Date().toISOString().slice(0, 10)
  } else if (form.status && form.status !== "paid") {
    payload.paid_at = null
  }

  const { data, error } = await supabase
    .from("payments")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markPaymentPaid(paymentId, financeId) {
  const payment = await updatePayment(paymentId, {
    status:  "paid",
    paid_at: new Date().toISOString().slice(0, 10),
  })
  const finance = await fetchProjectFinance_byId(financeId)
  return { payment, finance }
}

export async function deletePayment(id) {
  const { error } = await supabase.from("payments").delete().eq("id", id)
  if (error) throw error
}

// ─────────────────────────────────────────────────────────────
// VISÃO GLOBAL / ANALYTICS
// ─────────────────────────────────────────────────────────────

export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      project_finances (
        id, total_amount, received_amount, remaining_amount,
        progress_percentage, status,
        clients ( id, name, company )
      )
    `)
    .order("due_date", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchFinanceAnalytics() {
  const { data, error } = await supabase
    .from("project_finances")
    .select(`
      id, total_amount, received_amount, remaining_amount,
      progress_percentage, status, created_at,
      clients ( id, name, company )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}