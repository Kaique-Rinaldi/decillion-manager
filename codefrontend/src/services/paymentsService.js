// src/services/paymentsService.js
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────
// HELPER — retorna o usuário logado ou lança erro
// ─────────────────────────────────────────────────────────────
async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Usuário não autenticado");
  return user;
}

export async function fetchPayments(financialRecordId) {
  const user = await getUser();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("financial_record_id", financialRecordId)
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createPayment(financialRecordId, form) {
  const user = await getUser();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id:             user.id,
      financial_record_id: financialRecordId,
      title:               form.title?.trim(),
      description:         form.description?.trim() || null,
      amount:              Number(form.amount),
      status:              form.status         || "pending",
      payment_method:      form.payment_method || "pix",
      due_date:            form.due_date       || null,
      paid_at:             form.status === "paid"
                             ? (form.paid_at || new Date().toISOString().slice(0, 10))
                             : null,
      notes:               form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePayment(id, form) {
  const user = await getUser();

  const payload = {};
  if (form.title          !== undefined) payload.title          = form.title?.trim();
  if (form.description    !== undefined) payload.description    = form.description?.trim() || null;
  if (form.amount         !== undefined) payload.amount         = Number(form.amount);
  if (form.status         !== undefined) payload.status         = form.status;
  if (form.payment_method !== undefined) payload.payment_method = form.payment_method;
  if (form.due_date       !== undefined) payload.due_date       = form.due_date || null;
  if (form.notes          !== undefined) payload.notes          = form.notes?.trim() || null;

  if (form.status === "paid") {
    payload.paid_at = form.paid_at || new Date().toISOString().slice(0, 10);
  } else if (form.status && form.status !== "paid") {
    payload.paid_at = null;
  }

  const { data, error } = await supabase
    .from("payments")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markPaymentAsPaid(id) {
  return updatePayment(id, {
    status:  "paid",
    paid_at: new Date().toISOString().slice(0, 10),
  });
}

export async function deletePayment(id) {
  const user = await getUser();

  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function duplicatePayment(payment, financialRecordId) {
  return createPayment(financialRecordId, {
    title:          payment.title + " (cópia)",
    description:    payment.description,
    amount:         payment.amount,
    payment_method: payment.payment_method,
    status:         "pending",
    due_date:       null,
    notes:          payment.notes,
  });
}
