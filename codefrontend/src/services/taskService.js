import { supabase } from '../lib/supabase'

export async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(dbToTask)
}

export async function createTask(userId, taskData) {
  const payload = {
    user_id:   userId,
    text:      taskData.text,
    priority:  taskData.priority || 'media',
    done:      taskData.done ?? false,
    client_id: taskData.clientId || null,
    client:    taskData.client || 'Interno',
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return dbToTask(data)
}

export async function updateTask(taskId, taskData) {
  const payload = {}
  if (taskData.text      !== undefined) payload.text      = taskData.text
  if (taskData.priority  !== undefined) payload.priority  = taskData.priority
  if (taskData.done      !== undefined) payload.done      = taskData.done
  if (taskData.clientId  !== undefined) payload.client_id = taskData.clientId
  if (taskData.client    !== undefined) payload.client    = taskData.client

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return dbToTask(data)
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

export function dbToTask(row) {
  return {
    id:        row.id,
    text:      row.text,
    priority:  row.priority,
    done:      row.done,
    clientId:  row.client_id,
    client:    row.client,
    createdAt: row.created_at,
  }
}