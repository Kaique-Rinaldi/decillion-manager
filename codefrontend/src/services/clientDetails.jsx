import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

export default function ClientDetails({ clientId }) {
  const [activities, setActivities] = useState([])
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setActivities(data)
  }

  async function addActivity(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("activities").insert([
      {
        client_id: clientId,
        type,
        description,
      },
    ])

    setLoading(false)

    if (error) {
      console.log(error)
      return
    }

    // limpa form
    setType("")
    setDescription("")

    // atualiza lista automaticamente
    loadActivities()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Activities do Cliente</h1>

      {/* FORMULÁRIO */}
      <form onSubmit={addActivity} style={{ marginBottom: 20 }}>
        <input
          placeholder="Tipo (call, meeting...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar Activity"}
        </button>
      </form>

      {/* LISTA */}
      {activities.length === 0 && <p>Nenhuma activity ainda</p>}

      {activities.map((a) => (
        <div
          key={a.id}
          style={{
            padding: 10,
            border: "1px solid #ccc",
            marginBottom: 10,
          }}
        >
          <strong>{a.type}</strong>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  )
}