import { supabase } from '../lib/supabase'

export async function fetchClients(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(dbToClient)
}

export async function createClient(userId, clientData) {
  const payload = {
    user_id:          userId,
    name:             clientData.name,
    company:          clientData.company || null,
    email:            clientData.email || null,
    phone:            clientData.phone || null,
    project_name:     clientData.projectName || null,
    project_owner:    clientData.projectOwner || null,
    project_value:    Number(clientData.projectValue) || 0,
    payment_status:   clientData.paymentStatus || 'pendente',
    project_status:   clientData.projectStatus || 'andamento',
    project_progress: Number(clientData.projectProgress) || 0,
    start_date:       clientData.startDate || null,
    end_date:         clientData.endDate || null,
    notes:            clientData.notes || null,
    kanban_col:       clientData.kanbanCol || 'backlog',
    tags:             clientData.tags || [],
    activities:       clientData.activities || [],
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return dbToClient(data)
}

export async function updateClient(clientId, clientData) {
  const payload = {}
  if (clientData.name             !== undefined) payload.name             = clientData.name
  if (clientData.company          !== undefined) payload.company          = clientData.company
  if (clientData.email            !== undefined) payload.email            = clientData.email
  if (clientData.phone            !== undefined) payload.phone            = clientData.phone
  if (clientData.projectName      !== undefined) payload.project_name     = clientData.projectName
  if (clientData.projectOwner     !== undefined) payload.project_owner    = clientData.projectOwner
  if (clientData.projectValue     !== undefined) payload.project_value    = Number(clientData.projectValue)
  if (clientData.paymentStatus    !== undefined) payload.payment_status   = clientData.paymentStatus
  if (clientData.projectStatus    !== undefined) payload.project_status   = clientData.projectStatus
  if (clientData.projectProgress  !== undefined) payload.project_progress = Number(clientData.projectProgress)
  if (clientData.startDate        !== undefined) payload.start_date       = clientData.startDate
  if (clientData.endDate          !== undefined) payload.end_date         = clientData.endDate
  if (clientData.notes            !== undefined) payload.notes            = clientData.notes
  if (clientData.kanbanCol        !== undefined) payload.kanban_col       = clientData.kanbanCol
  if (clientData.tags             !== undefined) payload.tags             = clientData.tags
  if (clientData.activities       !== undefined) payload.activities       = clientData.activities

  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', clientId)
    .select()
    .single()

  if (error) throw error
  return dbToClient(data)
}

export async function deleteClient(clientId) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw error
}

export function dbToClient(row) {
  return {
    id:              row.id,
    name:            row.name,
    company:         row.company,
    email:           row.email,
    phone:           row.phone,
    projectName:     row.project_name,
    projectOwner:    row.project_owner,
    projectValue:    Number(row.project_value) || 0,
    paymentStatus:   row.payment_status,
    projectStatus:   row.project_status,
    projectProgress: Number(row.project_progress) || 0,
    startDate:       row.start_date,
    endDate:         row.end_date,
    notes:           row.notes,
    kanbanCol:       row.kanban_col || 'backlog',
    tags:            row.tags || [],
    activities:      row.activities || [],
    createdAt:       row.created_at,
  }
}