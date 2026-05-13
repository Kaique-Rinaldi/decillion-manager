import { supabase } from "../lib/supabase"

/* =========================
   FETCH TASKS
========================= */
export async function fetchTasks(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Tasks error:", error)
    return []
  }

  return (data ?? []).map(dbToTask)
}

/* =========================
   CREATE TASK
========================= */
export async function createTask(userId, taskData) {
  if (!userId) throw new Error("Missing userId")

  const payload = {
    user_id: userId,
    title: taskData?.title || "",
    description: taskData?.description || "",
    status: taskData?.status || "pendente"
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("Create task error:", error)
    throw error
  }

  return dbToTask(data)
}

/* =========================
   UPDATE TASK
========================= */
export async function updateTask(taskId, taskData) {
  if (!taskId) return

  const payload = {}

  if (taskData.title !== undefined) payload.title = taskData.title
  if (taskData.description !== undefined) payload.description = taskData.description
  if (taskData.status !== undefined) payload.status = taskData.status

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    console.error("Update task error:", error)
    throw error
  }

  return dbToTask(data)
}

/* =========================
   DELETE TASK
========================= */
export async function deleteTask(taskId) {
  if (!taskId) return

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)

  if (error) {
    console.error("Delete task error:", error)
    throw error
  }
}

/* =========================
   MAPPER
========================= */
function dbToTask(row) {
  if (!row) return null

  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    status: row.status || "pendente",
    createdAt: row.created_at
  }
}