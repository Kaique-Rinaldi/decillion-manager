import { supabase } from "../lib/supabase"

const READONLY = new Set(["id", "userId", "user_id", "createdAt", "created_at"])

function toSnake(dealData) {
  const MAP = {
    clientId: "client_id",
    client_id: "client_id",
    name:     "name",
    company:  "company",
    value:    "value",
    stage:    "stage",
    closedAt: "closed_at",
    closed_at: "closed_at",
  }
  const payload = {}
  for (const [key, value] of Object.entries(dealData || {})) {
    if (READONLY.has(key)) continue
    const col = MAP[key]
    if (col && value !== undefined) payload[col] = value
  }
  return payload
}

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

export async function createDeal(userId, dealData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    ...toSnake(dealData),
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

export async function updateDeal(dealId, dealData) {
  if (!dealId) return null

  const payload = toSnake(dealData)

  if (Object.keys(payload).length === 0) {
    console.warn("updateDeal: nenhum campo válido", dealData)
    return null
  }

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

function dbToDeal(row) {
  if (!row) return null
  return {
    id:        row.id,
    clientId:  row.client_id,
    name:      row.name     || "",
    company:   row.company  || "",
    value:     Number(row.value || 0),
    stage:     row.stage    || "lead",
    closedAt:  row.closed_at,
    createdAt: row.created_at,
  }
}