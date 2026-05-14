// src/services/paymentsService.js
// Segue o mesmo padrão de clientsService.js e dealsService.js

import { supabase } from "../lib/supabaseClient"

// ─────────────────────────────────────────────────────────────
// BUSCAR pagamentos de um cliente
// ─────────────────────────────────────────────────────────────
export async function fetchPayments(clientId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─────────────────────────────────────────────────────────────
// BUSCAR todos os pagamentos (visão global — FinancePage)
// ─────────────────────────────────────────────────────────────
export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, clients(name, company)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─────────────────────────────────────────────────────────────
// CRIAR pagamento
// ─────────────────────────────────────────────────────────────
export async function createPayment(clientId, form) {
  const payload = {
    client_id:      clientId,
    title:          form.title?.trim(),
    description:    form.description?.trim() || null,
    amount:         Number(form.amount),
    status:         form.status        || "pendente",
    payment_method: form.payment_method || "pix",
    due_date:       form.due_date      || null,
    paid_at:        form.status === "pago"
                      ? (form.paid_at || new Date().toISOString().slice(0, 10))
                      : null,
    installments:   Number(form.installments) || 1,
    recurring:      Boolean(form.recurring),
    notes:          form.notes?.trim() || null,
    receipt_url:    form.receipt_url   || null,
  }

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────
// ATUALIZAR pagamento
// ─────────────────────────────────────────────────────────────
export async function updatePayment(id, form) {
  const payload = {}

  if (form.title          !== undefined) payload.title          = form.title?.trim()
  if (form.description    !== undefined) payload.description    = form.description?.trim() || null
  if (form.amount         !== undefined) payload.amount         = Number(form.amount)
  if (form.status         !== undefined) payload.status         = form.status
  if (form.payment_method !== undefined) payload.payment_method = form.payment_method
  if (form.due_date       !== undefined) payload.due_date       = form.due_date || null
  if (form.installments   !== undefined) payload.installments   = Number(form.installments) || 1
  if (form.recurring      !== undefined) payload.recurring      = Boolean(form.recurring)
  if (form.notes          !== undefined) payload.notes          = form.notes?.trim() || null
  if (form.receipt_url    !== undefined) payload.receipt_url    = form.receipt_url || null

  // paid_at: define automaticamente ao marcar como pago
  if (form.status === "pago" && form.paid_at !== undefined) {
    payload.paid_at = form.paid_at || new Date().toISOString().slice(0, 10)
  } else if (form.status === "pago" && payload.paid_at === undefined) {
    payload.paid_at = new Date().toISOString().slice(0, 10)
  } else if (form.status && form.status !== "pago") {
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

// ─────────────────────────────────────────────────────────────
// EXCLUIR pagamento
// ─────────────────────────────────────────────────────────────
export async function deletePayment(id) {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)

  if (error) throw error
}