import { supabase } from "../lib/supabase"

/* =========================
   FETCH
========================= */
export async function fetchTasks(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data ?? []).map(dbToTask)
}

/* =========================
   CREATE
========================= */
export async function createTask(userId, text) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      text,
      done: false
    })
    .select()
    .single()

  if (error) throw error

  return dbToTask(data)
}

/* =========================
   UPDATE
========================= */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  return dbToTask(data)
}

/* =========================
   DELETE
========================= */
export async function deleteTask(id) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)

  if (error) throw error
}

/* =========================
   MAPPER
========================= */
function dbToTask(row) {
  return {
    id: row.id,
    text: row.text,
    done: row.done,
    createdAt: row.created_at
  }
}