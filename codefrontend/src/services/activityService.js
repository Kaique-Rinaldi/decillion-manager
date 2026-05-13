import { supabase } from '../lib/supabase'

// 🔥 Buscar activities de um cliente
export async function fetchActivitiesByClient(clientId) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// 🔥 Criar nova activity
export async function createActivity({ clientId, type, description }) {
  const { data, error } = await supabase
    .from('activities')
    .insert([
      {
        client_id: clientId,
        type,
        description
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// 🔥 Deletar activity
export async function deleteActivity(activityId) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)

  if (error) throw error
}