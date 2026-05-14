// src/services/financeService.js
import { supabase } from "../lib/supabase"

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Resolve o project_id real da tabela `projects` a partir de um client_id.
 * Retorna o primeiro projeto vinculado ao cliente, ou null se não existir.
 */
export async function fetchProjectIdByClient(clientId) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null   // { id, name } ou null
}

/**
 * Cria um projeto na tabela `projects` vinculado ao cliente.
 * Usado quando o cliente ainda não tem projeto registrado.
 */
export async function createProjectForClient(clientId, projectName) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: clientId,
      name:      projectName || "Projeto Principal",
    })
    .select()
    .single()

  if (error) throw error
  return data   // { id, name, client_id, ... }
}

// ─────────────────────────────────────────────────────────────
// PROJECT FINANCES
// ─────────────────────────────────────────────────────────────

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
 * Busca o financeiro pelo client_id (via join com projects).
 * Útil quando não temos o project_id ainda.
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
 * Garante que o financeiro exista para o projeto — nunca gera 409 ou 23503.
 *
 * Fluxo:
 *   1. Resolve o project_id real (da tabela projects), criando se necessário
 *   2. Verifica se já existe um project_finances para esse project_id
 *   3. Upsert atômico com onConflict para evitar 409
 *
 * Retorna { data: ProjectFinance, alreadyExisted: boolean, resolvedProjectId: string }
 */
export async function ensureProjectFinance(clientId, projectId, payload) {
  // ── Etapa 1: resolver project_id real ─────────────────────
  let realProjectId = projectId

  // Se o projectId passado parece ser o clientId (mesmo valor) ou não é
  // um UUID de projeto válido, busca/cria o projeto real
  if (!realProjectId || realProjectId === clientId) {
    const project = await fetchProjectIdByClient(clientId)

    if (project) {
      realProjectId = project.id
    } else {
      // Cria o projeto vinculado ao cliente
      const newProject = await createProjectForClient(
        clientId,
        payload.projectName || payload.name || "Projeto Principal"
      )
      realProjectId = newProject.id
    }
  }

  // ── Etapa 2: verificar existência do financeiro ────────────
  const existing = await fetchProjectFinance(realProjectId)
  if (existing) {
    return { data: existing, alreadyExisted: true, resolvedProjectId: realProjectId }
  }

  // ── Etapa 3: upsert atômico ────────────────────────────────
  const { data, error } = await supabase
    .from("project_finances")
    .upsert(
      {
        client_id:    clientId,
        project_id:   realProjectId,
        total_amount: Number(payload.total_amount) || 0,
        payment_type: payload.payment_type || null,
        notes:        payload.notes?.trim() || null,
      },
      {
        onConflict:       "project_id",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (!error) {
    return { data, alreadyExisted: false, resolvedProjectId: realProjectId }
  }

  // ── Etapa 4: fallback final ────────────────────────────────
  const fallback = await fetchProjectFinance(realProjectId)
    ?? await fetchProjectFinanceByClient(clientId)

  if (fallback) {
    return { data: fallback, alreadyExisted: true, resolvedProjectId: realProjectId }
  }

  throw error
}

// Alias de compatibilidade
export async function createProjectFinance(clientId, projectId, payload) {
  const { data } = await ensureProjectFinance(clientId, projectId, payload)
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
// VISÃO GLOBAL
// ─────────────────────────────────────────────────────────────

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