import { supabase } from "../lib/supabase"

/**
 * FETCH DEALS
 */
export async function fetchDeals(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("fetchDeals error:", error)
    return []
  }

  return (data ?? []).map(dbToDeal)
}

/**
 * CREATE DEAL
 */
export async function createDeal(userId, dealData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    client_id: dealData?.clientId || null,
    name: dealData?.name || "",
    company: dealData?.company || "",
    value: Number(dealData?.value || 0),
    stage: dealData?.stage || "lead",
    closed_at: dealData?.closedAt || null
  }

  const { data, error } = await supabase
    .from("deals")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("createDeal error:", error)
    throw error
  }

  return dbToDeal(data)
}

/**
 * UPDATE DEAL
 */
export async function updateDeal(dealId, dealData) {
  if (!dealId) return null

  const payload = {}

  Object.entries(dealData || {}).forEach(([key, value]) => {
    if (value !== undefined) payload[key] = value
  })

  const { data, error } = await supabase
    .from("deals")
    .update(payload)
    .eq("id", dealId)
    .select()
    .single()

  if (error) {
    console.error("updateDeal error:", error)
    throw error
  }

  return dbToDeal(data)
}

/**
 * DELETE DEAL
 */
export async function deleteDeal(dealId) {
  if (!dealId) return

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)

  if (error) {
    console.error("deleteDeal error:", error)
    throw error
  }
}

/**
 * NORMALIZER SAFE
 */
function dbToDeal(row) {
  if (!row) return null

  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name || "",
    company: row.company || "",
    value: Number(row.value || 0),
    stage: row.stage || "lead",
    closedAt: row.closed_at,
    createdAt: row.created_at
  }
}