import { useState } from "react"
import { supabase } from "../lib/supabase"
import { createDeal } from "../services/dealsService"

export default function DealForm({ onSuccess }) {
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreateDeal(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      await createDeal(user.id, {
        name,
        company,
        value,
        stage: "lead",
      })

      // limpa form
      setName("")
      setCompany("")
      setValue("")

      // atualiza lista / UI
      if (onSuccess) onSuccess()

    } catch (error) {
      console.error("Erro ao criar deal:", error.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleCreateDeal} style={{ padding: 20 }}>
      <h2>Criar Deal</h2>

      <input
        placeholder="Nome do deal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Empresa"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <input
        placeholder="Valor"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Adicionar Deal"}
      </button>
    </form>
  )
}