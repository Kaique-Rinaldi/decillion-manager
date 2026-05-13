import { supabase } from "../../lib/supabase"

/**
 * QUERY SEGURA (evita crash de schema)
 */
export async function safeSelect(table, query) {
  const { data, error } = await supabase.from(table).select(query)

  if (error) {
    console.error(`❌ Supabase error on table: ${table}`, error)
    return []
  }

  return data ?? []
}

export async function safeInsert(table, payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()

  if (error) {
    console.error(`❌ Insert error on table: ${table}`, error)
    throw error
  }

  return data
}