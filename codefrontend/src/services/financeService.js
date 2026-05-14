// src/services/financeService.js
// Gestão Financeira por Projeto — Decillion CRM

import { supabase } from "../lib/supabase"

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Verifica se é um erro de conflito/duplicidade (409, unique constraint, etc.)
 */
function isConflictError(error) {
  if (!error) return false
  const code    = error?.code    ?? ""
  const message = (error?.message ?? "").toLowerCase()
  return (
    code === "23505"               ||   // PostgreSQL: unique_violation
    code === "409"                 ||   // HTTP conflict
    message.includes("duplicate") ||
    message.includes("unique")    ||
    message.includes("conflict")  ||
    message.includes("already exists")
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT FINANCES
// ─────────────────────────────────────────────────────────────

/**
 * Busca o financeiro de um projeto pelo project_id.
 * Retorna null se ainda não existir.
 */
export async function fetchProjectFinance(projectId) {
  const { data, error } = await supabase
    .from("project_finances")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/**
 * Busca financeiro por ID direto (uso interno após trigger).
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
 * Cria o financeiro do projeto com proteção contra duplicidade.
 *
 * Estratégia "fetch-first":
 *   1. Tenta buscar o financeiro existente
 *   2. Se existir → retorna o existente (+ flag `alreadyExisted: true`)
 *   3. Se não existir → cria e retorna o novo
 *
 * Isso evita 409 mesmo em condições de race-condition.
 */
export async function createProjectFinance(clientId, projectId, payload) {
  // ── 1. Verificar existência antes de inserir ──
  const existing = await fetchProjectFinance(projectId)

  if (existing) {
    // Já existe: devolve o registro com flag para o caller exibir toast adequado
    return { ...existing, _alreadyExisted: true }
  }

  // ── 2. Tentar criar ──
  const { data, error } = await supabase
    .from("project_finances")
    .insert({
      client_id:    clientId,
      project_id:   projectId,
      total_amount: Number(payload.total_amount) || 0,
      payment_type: payload.payment_type || null,
      notes:        payload.notes?.trim() || null,
    })
    .select()
    .single()

  // ── 3. Tratar conflito residual (race-condition) ──
  if (error) {
    if (isConflictError(error)) {
      // Outro processo criou antes de nós: busca e retorna o existente
      const fallback = await fetchProjectFinance(projectId)
      if (fallback) return { ...fallback, _alreadyExisted: true }
    }
    throw error
  }

  return data
}

/**
 * Upsert do financeiro do projeto:
 *   - Cria se não existir
 *   - Atualiza se já existir
 * Use esta função quando quiser garantir a existência sem se preocupar
 * com a distinção create/update.
 */
export async function upsertProjectFinance(clientId, projectId, payload) {
  const { data, error } = await supabase
    .from("project_finances")
    .upsert(
      {
        client_id:    clientId,
        project_id:   projectId,
        total_amount: Number(payload.total_amount) || 0,
        payment_type: payload.payment_type || null,
        notes:        payload.notes?.trim() || null,
      },
      {
        onConflict:        "project_id",   // coluna com unique constraint
        ignoreDuplicates:  false,          // merge ao invés de ignorar
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Atualiza o financeiro do projeto (total_amount, notas, etc.)
 */
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
// PAYMENTS (vinculados ao finance_id)
// ─────────────────────────────────────────────────────────────

/**
 * Busca todos os pagamentos de um financeiro de projeto.
 */
export async function fetchPaymentsByFinance(financeId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("finance_id", financeId)
    .order("due_date", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Cria um pagamento vinculado a um finance_id.
 */
export async function createPayment(financeId, form) {
  const payload = {
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
  }

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Atualiza um pagamento.
 * O trigger SQL sincroniza o project_finances automaticamente.
 */
export async function updatePayment(id, form) {
  const payload = {}

  if (form.title          !== undefined) payload.title          = form.title?.trim()
  if (form.description    !== undefined) payload.description    = form.description?.trim() || null
  if (form.amount         !== undefined) payload.amount         = Number(form.amount)
  if (form.status         !== undefined) payload.status         = form.status
  if (form.payment_method !== undefined) payload.payment_method = form.payment_method
  if (form.due_date       !== undefined) payload.due_date       = form.due_date || null
  if (form.notes          !== undefined) payload.notes          = form.notes?.trim() || null

  // paid_at
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

/**
 * Marca um pagamento como pago e retorna também o finance atualizado.
 */
export async function markPaymentPaid(paymentId, financeId) {
  const payment = await updatePayment(paymentId, {
    status:  "paid",
    paid_at: new Date().toISOString().slice(0, 10),
  })

  // Re-busca o financeiro já atualizado pelo trigger
  const finance = await fetchProjectFinance_byId(financeId)
  return { payment, finance }
}

/**
 * Exclui um pagamento.
 */
export async function deletePayment(id) {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ─────────────────────────────────────────────────────────────
// VISÃO GLOBAL (sidebar Financeiro)
// ─────────────────────────────────────────────────────────────

/**
 * Busca todos os pagamentos com dados do cliente e projeto.
 * Usado pela FinancePage (visão administrativa global).
 */
export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      project_finances (
        id, total_amount, received_amount, remaining_amount,
        progress_percentage, status,
        projects ( id, name ),
        clients  ( id, name, company )
      )
    `)
    .order("due_date", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Analytics: receita mensal/anual, inadimplência.
 */
export async function fetchFinanceAnalytics() {
  const { data, error } = await supabase
    .from("project_finances")
    .select(`
      id, total_amount, received_amount, remaining_amount,
      progress_percentage, status, created_at,
      projects ( id, name ),
      clients  ( id, name, company )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}