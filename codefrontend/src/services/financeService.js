// src/services/financeService.js
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────
// HELPER — retorna o usuário logado ou lança erro
// ─────────────────────────────────────────────────────────────
async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Usuário não autenticado");
  return user;
}

// ─────────────────────────────────────────────────────────────
// FINANCIAL RECORDS
// ─────────────────────────────────────────────────────────────

export async function fetchFinancialRecords() {
  const user = await getUser();

  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchFinancialRecord(id) {
  const user = await getUser();

  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      *,
      clients ( id, name, company )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createFinancialRecord(payload) {
  const user = await getUser();
  const totalAmount = Number(payload.total_amount) || 0;

  const { data, error } = await supabase
    .from("financial_records")
    .insert({
      user_id:          user.id,
      client_id:        payload.client_id,
      title:            payload.title?.trim(),
      description:      payload.description?.trim() || null,
      total_amount:     totalAmount,
      received_amount:  0,
      remaining_amount: totalAmount,
      status:           "pending",
      start_date:       payload.start_date || null,
      due_date:         payload.due_date   || null,
      notes:            payload.notes?.trim() || null,
    })
    .select(`*, clients ( id, name, company )`)
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// AUTO-CREATE FROM CLIENT
// Called right after createClient() succeeds.
// Silently returns null if projectName or projectValue are
// missing/zero — no crash, no orphan record.
// ─────────────────────────────────────────────────────────────
export async function createFinancialRecordFromClient(client) {
  const title  = client.projectName?.trim();
  const amount = Number(client.projectValue) || 0;

  // Guard: only create when meaningful data exists
  if (!title || amount <= 0) return null;

  const user = await getUser();

  const { data, error } = await supabase
    .from("financial_records")
    .insert({
      user_id:          user.id,
      client_id:        client.id,
      title,
      description:      "Registro financeiro criado automaticamente",
      total_amount:     amount,
      received_amount:  0,
      remaining_amount: amount,
      status:           "pending",
      start_date:       client.startDate || null,
      due_date:         client.endDate   || null,
      notes:            null,
    })
    .select(`*, clients ( id, name, company )`)
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// SYNC CLIENT PAYMENT STATUS
// Maps financial_record.status → clients.payment_status
// ─────────────────────────────────────────────────────────────
export async function syncClientPaymentStatus(clientId, financialStatus) {
  if (!clientId) return;

  const STATUS_MAP = {
    paid:    "pago",
    partial: "pendente",
    overdue: "atrasado",
    pending: "pendente",
  };

  const { error } = await supabase
    .from("clients")
    .update({ payment_status: STATUS_MAP[financialStatus] ?? "pendente" })
    .eq("id", clientId);

  if (error) throw error;
}

export async function updateFinancialRecord(id, payload) {
  const user = await getUser();

  const patch = {};
  if (payload.title        !== undefined) patch.title        = payload.title?.trim();
  if (payload.description  !== undefined) patch.description  = payload.description?.trim() || null;
  if (payload.total_amount !== undefined) patch.total_amount = Number(payload.total_amount);
  if (payload.start_date   !== undefined) patch.start_date   = payload.start_date || null;
  if (payload.due_date     !== undefined) patch.due_date     = payload.due_date   || null;
  if (payload.notes        !== undefined) patch.notes        = payload.notes?.trim() || null;
  if (payload.status       !== undefined) patch.status       = payload.status;

  const { data, error } = await supabase
    .from("financial_records")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`*, clients ( id, name, company )`)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFinancialRecord(id) {
  const user = await getUser();

  const { error } = await supabase
    .from("financial_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// RECALCULATE + SYNC
// ─────────────────────────────────────────────────────────────
export async function recalculateRecord(recordId) {
  const user = await getUser();

  const { data: payments, error: pe } = await supabase
    .from("payments")
    .select("amount, status, due_date")
    .eq("financial_record_id", recordId)
    .eq("user_id", user.id);

  if (pe) throw pe;

  const { data: record, error: re } = await supabase
    .from("financial_records")
    .select("total_amount, client_id")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .single();

  if (re) throw re;

  const received  = payments
    .filter(p => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const total     = Number(record.total_amount);
  const remaining = Math.max(total - received, 0);

  let status = "pending";
  if (received >= total && total > 0) {
    status = "paid";
  } else if (received > 0) {
    status = "partial";
  } else {
    const today   = new Date().toISOString().slice(0, 10);
    const overdue = payments.some(
      p => p.status === "pending" && p.due_date && p.due_date < today
    );
    if (overdue) status = "overdue";
  }

  const { data, error } = await supabase
    .from("financial_records")
    .update({ received_amount: received, remaining_amount: remaining, status })
    .eq("id", recordId)
    .eq("user_id", user.id)
    .select(`*, clients ( id, name, company )`)
    .single();

  if (error) throw error;

  // Sync payment status back to clients (non-blocking)
  syncClientPaymentStatus(record.client_id, status).catch(() => {});

  return data;
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────
export async function fetchFinanceStats() {
  const user = await getUser();

  const { data, error } = await supabase
    .from("financial_records")
    .select("total_amount, received_amount, remaining_amount, status, due_date")
    .eq("user_id", user.id);

  if (error) throw error;

  const totalRevenue  = data.reduce((s, r) => s + Number(r.total_amount),    0);
  const totalReceived = data.reduce((s, r) => s + Number(r.received_amount), 0);
  const totalPending  = data
    .filter(r => r.status === "pending" || r.status === "partial")
    .reduce((s, r) => s + Number(r.remaining_amount), 0);
  const totalOverdue  = data
    .filter(r => r.status === "overdue")
    .reduce((s, r) => s + Number(r.remaining_amount), 0);

  return {
    totalRevenue,
    totalReceived,
    totalPending,
    totalOverdue,
    countRecords: data.length,
    countOverdue: data.filter(r => r.status === "overdue").length,
    countPaid:    data.filter(r => r.status === "paid").length,
    countPending: data.filter(r => r.status === "pending" || r.status === "partial").length,
  };
}
