import { supabase } from "../lib/supabase"

/* =========================
   FETCH DEALS
========================= */
export async function fetchDeals(userId) {
  if (!userId) throw new Error("Missing userId")

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map(dbToDeal)
}

/* =========================
   CREATE DEAL
========================= */
export async function createDeal(userId, dealData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    client_id: dealData.clientId || null,
    name: dealData.name || "",
    company: dealData.company || "",
    value: Number(dealData.value) || 0,
    stage: dealData.stage || "lead",
    closed_at: dealData.closedAt || null,
  }

  console.log("CREATE DEAL:", payload)

  const { data, error } = await supabase
    .from("deals")
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return dbToDeal(data)
}

/* =========================
   UPDATE DEAL
========================= */
export async function updateDeal(dealId, dealData) {
  if (!dealId) throw new Error("Missing dealId")

  const payload = {}

  if (dealData.name !== undefined) payload.name = dealData.name
  if (dealData.company !== undefined) payload.company = dealData.company
  if (dealData.value !== undefined) payload.value = Number(dealData.value)
  if (dealData.stage !== undefined) payload.stage = dealData.stage
  if (dealData.closedAt !== undefined) payload.closed_at = dealData.closedAt

  const { data, error } = await supabase
    .from("deals")
    .update(payload)
    .eq("id", dealId)
    .select()
    .single()

  if (error) throw error

  return dbToDeal(data)
}

/* =========================
   DELETE DEAL
========================= */
export async function deleteDeal(dealId) {
  if (!dealId) throw new Error("Missing dealId")

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)

  if (error) throw error
}

/* =========================
   MAPPER
========================= */
export function dbToDeal(row) {
  if (!row) return null

  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name || "",
    company: row.company || "",
    value: Number(row.value) || 0,
    stage: row.stage || "lead",
    closedAt: row.closed_at,
    createdAt: row.created_at,
  }
}