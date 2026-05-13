import { supabase } from "../lib/supabase"

/**
 * FETCH CLIENTS
 */
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

/**
 * CREATE CLIENT
 */
export async function createClient(userId, clientData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    name: clientData?.name || "",
    company: clientData?.company || "",
    email: clientData?.email || "",
    phone: clientData?.phone || "",
    project_name: clientData?.projectName || "",
    project_owner: clientData?.projectOwner || "",
    project_value: Number(clientData?.projectValue || 0),
    payment_status: clientData?.paymentStatus || "pendente",
    project_status: clientData?.projectStatus || "andamento",
    project_progress: Number(clientData?.projectProgress || 0),
    start_date: clientData?.startDate || null,
    end_date: clientData?.endDate || null,
    notes: clientData?.notes || "",
    kanban_col: clientData?.kanbanCol || "backlog",
    tags: clientData?.tags || []
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

/**
 * UPDATE CLIENT
 */
export async function updateClient(clientId, clientData) {
  if (!clientId) return null

  const payload = {}

  Object.entries(clientData || {}).forEach(([key, value]) => {
    if (value !== undefined) payload[key] = value
  })

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

/**
 * DELETE CLIENT
 */
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

/**
 * NORMALIZER SAFE
 */
function dbToClient(row) {
  if (!row) return null

  return {
    id: row.id,
    name: row.name || "",
    company: row.company || "",
    email: row.email || "",
    phone: row.phone || "",
    projectName: row.project_name || "",
    projectOwner: row.project_owner || "",
    projectValue: Number(row.project_value || 0),
    paymentStatus: row.payment_status || "pendente",
    projectStatus: row.project_status || "andamento",
    projectProgress: Number(row.project_progress || 0),
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes || "",
    kanbanCol: row.kanban_col || "backlog",
    tags: row.tags || [],
    createdAt: row.created_at
  }
}