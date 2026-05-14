// src/services/notificationService.js
import { supabase } from "../lib/supabase"

export async function createNotification({ userId, title, message, type = "info" }) {
  const { error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, title, message, type })

  if (error) console.error("Erro notification:", error)
}

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)

  if (error) throw error
}

export async function markOneAsRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)

  if (error) throw error
}
