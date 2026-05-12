import { supabase } from '../lib/supabase'

export async function fetchDeals(userId) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(dbToDeal)
}

export async function createDeal(userId, dealData) {
  const payload = {
    user_id:   userId,
    client_id: dealData.clientId || null,
    name:      dealData.name,
    company:   dealData.company || null,
    value:     Number(dealData.value) || 0,
    stage:     dealData.stage || 'lead',
    closed_at: dealData.closedAt || null,
  }

  const { data, error } = await supabase
    .from('deals')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return dbToDeal(data)
}

export async function updateDeal(dealId, dealData) {
  const payload = {}
  if (dealData.clientId  !== undefined) payload.client_id  = dealData.clientId
  if (dealData.name      !== undefined) payload.name       = dealData.name
  if (dealData.company   !== undefined) payload.company    = dealData.company
  if (dealData.value     !== undefined) payload.value      = Number(dealData.value)
  if (dealData.stage     !== undefined) payload.stage      = dealData.stage
  if (dealData.closedAt  !== undefined) payload.closed_at  = dealData.closedAt

  const { data, error } = await supabase
    .from('deals')
    .update(payload)
    .eq('id', dealId)
    .select()
    .single()

  if (error) throw error
  return dbToDeal(data)
}

export async function deleteDeal(dealId) {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId)

  if (error) throw error
}

export function dbToDeal(row) {
  return {
    id:        row.id,
    clientId:  row.client_id,
    name:      row.name,
    company:   row.company,
    value:     Number(row.value) || 0,
    stage:     row.stage,
    closedAt:  row.closed_at,
    createdAt: row.created_at,
  }
}