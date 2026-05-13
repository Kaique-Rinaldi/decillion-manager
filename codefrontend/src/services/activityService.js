import { supabase } from "../lib/supabase"

/* =========================
   FETCH ACTIVITIES BY CLIENT
========================= */
export async function fetchActivitiesByClient(clientId) {
  if (!clientId) return []

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Activities fetch error:", error)
    return []
  }

  return (data ?? []).map(dbToActivity)
}

/* =========================
   CREATE ACTIVITY
========================= */
export async function createActivity({ clientId, type, description }) {
  if (!clientId) throw new Error("Missing clientId")

  const payload = {
    client_id: clientId,
    type: type || "note",
    description: description || ""
  }

  const { data, error } = await supabase
    .from("activities")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("Create activity error:", error)
    throw error
  }

  return dbToActivity(data)
}

/* =========================
   DELETE ACTIVITY
========================= */
export async function deleteActivity(activityId) {
  if (!activityId) return

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)

  if (error) {
    console.error("Delete activity error:", error)
    throw error
  }
}

/* =========================
   MAPPER SAFE
========================= */
function dbToActivity(row) {
  if (!row) return null

  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type || "note",
    description: row.description || "",
    createdAt: row.created_at
  }
}