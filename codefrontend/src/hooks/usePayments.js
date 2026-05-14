// src/hooks/usePayments.js
import { useState, useEffect, useCallback } from "react"
import {
  fetchPayments,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  deletePayment,
  duplicatePayment,
} from "../services/paymentsService"
import { recalculateRecord } from "../services/financeService"

export function usePayments(financialRecordId, onRecordUpdated, addToast) {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(false)

  const load = useCallback(async () => {
    if (!financialRecordId) return
    setLoading(true)
    try {
      const pays = await fetchPayments(financialRecordId)
      setPayments(pays)
    } catch {
      addToast?.("Erro ao carregar pagamentos.", "error")
    } finally {
      setLoading(false)
    }
  }, [financialRecordId]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  const afterMutation = useCallback(async () => {
    const [pays, updatedRecord] = await Promise.all([
      fetchPayments(financialRecordId),
      recalculateRecord(financialRecordId),
    ])
    setPayments(pays)
    onRecordUpdated?.(updatedRecord)
  }, [financialRecordId, onRecordUpdated])

  const addPayment = useCallback(async (form) => {
    try {
      await createPayment(financialRecordId, form)
      await afterMutation()
      addToast?.("Pagamento criado!", "success")
    } catch {
      addToast?.("Erro ao criar pagamento.", "error")
    }
  }, [financialRecordId, afterMutation]) // eslint-disable-line

  const editPayment = useCallback(async (id, form) => {
    try {
      await updatePayment(id, form)
      await afterMutation()
      addToast?.("Pagamento atualizado!", "success")
    } catch {
      addToast?.("Erro ao atualizar pagamento.", "error")
    }
  }, [afterMutation]) // eslint-disable-line

  const markPaid = useCallback(async (id) => {
    try {
      await markPaymentAsPaid(id)
      await afterMutation()
      addToast?.("Pagamento marcado como pago! ✓", "success")
    } catch {
      addToast?.("Erro ao marcar pagamento.", "error")
    }
  }, [afterMutation]) // eslint-disable-line

  const removePayment = useCallback(async (id) => {
    try {
      await deletePayment(id)
      await afterMutation()
      addToast?.("Pagamento removido.", "warning")
    } catch {
      addToast?.("Erro ao excluir pagamento.", "error")
    }
  }, [afterMutation]) // eslint-disable-line

  const dupPayment = useCallback(async (payment) => {
    try {
      await duplicatePayment(payment, financialRecordId)
      await afterMutation()
      addToast?.("Pagamento duplicado!", "success")
    } catch {
      addToast?.("Erro ao duplicar pagamento.", "error")
    }
  }, [financialRecordId, afterMutation]) // eslint-disable-line

  return {
    payments,
    loading,
    reload:          load,
    addPayment,
    editPayment,
    markPaid,
    removePayment,
    dupPayment,
  }
}