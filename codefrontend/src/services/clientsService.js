// src/services/clientsService.js
import { supabase } from "../lib/supabase";
import { createFinancialRecordFromClient } from "./financeService";

// ─────────────────────────────────────────────────────────────
// MAPPER  snake_case (DB) → camelCase (app)
// ─────────────────────────────────────────────────────────────
function toClient(row) {
  if (!row) return null;
  return {
    id:              row.id,
    userId:          row.user_id,
    name:            row.name,
    email:           row.email,
    phone:           row.phone,
    company:         row.company,
    projectName:     row.project_name,
    projectOwner:    row.project_owner,
    projectValue:    row.project_value,
    projectStatus:   row.project_status,
    paymentStatus:   row.payment_status,
    projectProgress: row.project_progress,
    startDate:       row.start_date,
    endDate:         row.end_date,
    notes:           row.notes,
    kanbanCol:       row.kanban_col ?? "backlog",
    tags:            row.tags        ?? [],
    activities:      row.activities  ?? [],
    createdAt:       row.created_at,
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────
export async function fetchClients(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toClient);
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────
export async function createClient(userId, clientData) {
  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      user_id:          userId,
      name:             clientData.name?.trim(),
      email:            clientData.email?.trim(),
      phone:            clientData.phone?.trim()     || null,
      company:          clientData.company?.trim()   || null,
      project_name:     clientData.projectName?.trim() || null,
      project_owner:    clientData.projectOwner?.trim() || null,
      project_value:    Number(clientData.projectValue) || 0,
      project_status:   clientData.projectStatus  || "andamento",
      payment_status:   clientData.paymentStatus  || "pendente",
      project_progress: Number(clientData.projectProgress) || 0,
      start_date:       clientData.startDate || null,
      end_date:         clientData.endDate   || null,
      notes:            clientData.notes?.trim() || null,
      kanban_col:       clientData.kanbanCol  || "backlog",
      tags:             clientData.tags       || [],
      activities:       clientData.activities || [],
    })
    .select()
    .single();

  if (error) throw error;

  try {
    await createFinancialRecordFromClient({
      id:           client.id,
      projectName:  client.project_name,
      projectValue: client.project_value,
      startDate:    client.start_date,
      endDate:      client.end_date,
    });
  } catch (finErr) {
    console.warn("[clientsService] Auto-create financial record failed:", finErr.message);
    const warn = new Error("CLIENT_SAVED_FINANCE_FAILED:" + finErr.message);
    warn.clientCreated = toClient(client);
    throw warn;
  }

  return toClient(client);
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────
export async function updateClient(id, clientData) {
  const patch = {};

  if (clientData.name             !== undefined) patch.name             = clientData.name?.trim();
  if (clientData.email            !== undefined) patch.email            = clientData.email?.trim();
  if (clientData.phone            !== undefined) patch.phone            = clientData.phone?.trim() || null;
  if (clientData.company          !== undefined) patch.company          = clientData.company?.trim() || null;
  if (clientData.projectName      !== undefined) patch.project_name     = clientData.projectName?.trim() || null;
  if (clientData.projectOwner     !== undefined) patch.project_owner    = clientData.projectOwner?.trim() || null;
  if (clientData.projectValue     !== undefined) patch.project_value    = Number(clientData.projectValue) || 0;
  if (clientData.projectStatus    !== undefined) patch.project_status   = clientData.projectStatus;
  if (clientData.paymentStatus    !== undefined) patch.payment_status   = clientData.paymentStatus;
  if (clientData.projectProgress  !== undefined) patch.project_progress = Number(clientData.projectProgress) || 0;
  if (clientData.startDate        !== undefined) patch.start_date       = clientData.startDate || null;
  if (clientData.endDate          !== undefined) patch.end_date         = clientData.endDate   || null;
  if (clientData.notes            !== undefined) patch.notes            = clientData.notes?.trim() || null;
  if (clientData.kanbanCol        !== undefined) patch.kanban_col       = clientData.kanbanCol;
  if (clientData.tags             !== undefined) patch.tags             = clientData.tags;
  if (clientData.activities       !== undefined) patch.activities       = clientData.activities;

  const { data, error } = await supabase
    .from("clients")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toClient(data);
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export async function deleteClient(id) {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
