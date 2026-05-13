import { supabase } from "./supabase"

export async function getUserSafe() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Auth error:", error)
    return null
  }

  return data?.user ?? null
}