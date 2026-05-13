import { supabase } from "../lib/supabase"

// status no banco: "pending" | "done"
// (ajuste os valores abaixo se usar outros, ex: "completed", "finished")

export async function fetchTasks(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("fetchTasks error:", error)
    return []
  }

  return (data ?? []).map(dbToTask)
}

export async function createTask(userId, title) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  return dbToTask(data)
}

export async function updateTask(id, updates) {
  // Converte { done: true/false } → { status: "done"/"pending" }
  const payload = { ...updates }
  if ("done" in payload) {
    payload.status = payload.done ? "done" : "pending"
    delete payload.done
  }
  if ("text" in payload) {
    payload.title = payload.text
    delete payload.text
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  return dbToTask(data)
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)

  if (error) throw error
}

function dbToTask(row) {
  return {
    id:          row.id,
    text:        row.title || row.description || "",
    description: row.description || "",
    done:        row.status === "done",
    createdAt:   row.created_at,
  }
}