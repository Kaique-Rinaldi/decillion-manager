import { supabase } from "../lib/supabase"

/**
 * Campos somente-leitura que NUNCA devem ser enviados num UPDATE.
 * O Supabase rejeita qualquer campo que não existe como coluna editável.
 */
const READONLY_FIELDS = new Set(["id", "user_id", "userId", "createdAt", "created_at"])

/**
 * Converte um objeto camelCase (vindo do front) para snake_case (colunas do banco).
 * Campos desconhecidos são ignorados silenciosamente.
 */
function toSnakeCase(clientData) {
  const MAP = {
    name:            "name",
    company:         "company",
    email:           "email",
    phone:           "phone",
    projectName:     "project_name",
    projectOwner:    "project_owner",
    projectValue:    "project_value",
    paymentStatus:   "payment_status",
    projectStatus:   "project_status",
    projectProgress: "project_progress",
    startDate:       "start_date",
    endDate:         "end_date",
    notes:           "notes",
    kanbanCol:       "kanban_col",
    kanban_col:      "kanban_col",   // aceita os dois formatos
    tags:            "tags",
  }

  const payload = {}
  for (const [key, value] of Object.entries(clientData || {})) {
    if (READONLY_FIELDS.has(key)) continue   // ignora id, createdAt, etc.
    const col = MAP[key]
    if (col && value !== undefined) payload[col] = value
  }
  return payload
}

export async function fetchClients(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("fetchClients error:", error)
    return []
  }

  return (data ?? []).map(dbToClient)
}

export async function createClient(userId, clientData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    ...toSnakeCase(clientData),
  }

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("createClient error:", error)
    throw error
  }

  return dbToClient(data)
}

export async function updateClient(clientId, clientData) {
  if (!clientId) return null

  const payload = toSnakeCase(clientData)

  if (Object.keys(payload).length === 0) {
    console.warn("updateClient: nenhum campo válido para atualizar", clientData)
    return null
  }

  const { data, error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", clientId)
    .select()
    .single()

  if (error) {
    console.error("updateClient error:", error)
    throw error
  }

  return dbToClient(data)
}

export async function deleteClient(clientId) {
  if (!clientId) return

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)

  if (error) {
    console.error("deleteClient error:", error)
    throw error
  }
}

function dbToClient(row) {
  if (!row) return null

  return {
    id:              row.id,
    name:            row.name            || "",
    company:         row.company         || "",
    email:           row.email           || "",
    phone:           row.phone           || "",
    projectName:     row.project_name    || "",
    projectOwner:    row.project_owner   || "",
    projectValue:    Number(row.project_value    || 0),
    paymentStatus:   row.payment_status  || "pendente",
    projectStatus:   row.project_status  || "andamento",
    projectProgress: Number(row.project_progress || 0),
    startDate:       row.start_date,
    endDate:         row.end_date,
    notes:           row.notes           || "",
    kanbanCol:       row.kanban_col      || "backlog",
    tags:            row.tags            || [],
    createdAt:       row.created_at,
  }
}