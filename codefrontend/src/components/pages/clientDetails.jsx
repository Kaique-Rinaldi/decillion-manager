import { useEffect, useState } from "react"
import {
  fetchActivitiesByClient,
  createActivity
} from "../services/activityService"

export default function ClientDetails({ clientId }) {
  const [activities, setActivities] = useState([])
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // ✔ proteção contra clientId undefined
  if (!clientId) return <p>Carregando cliente...</p>

  useEffect(() => {
    if (!clientId) return
    loadActivities()
  }, [clientId])

  // ✔ load otimizado (sem bug de estado)
  async function loadActivities() {
    const data = await fetchActivitiesByClient(clientId)
    setActivities(data ?? [])
  }

  async function addActivity(e) {
    e.preventDefault()
    setLoading(true)

    // ✔ validação obrigatória (profissional)
    if (!type.trim() || !description.trim()) {
      setLoading(false)
      return
    }

    try {
      await createActivity({
        clientId,
        type,
        description
      })

      // limpa form
      setType("")
      setDescription("")

      // atualiza lista
      await loadActivities()
    } catch (error) {
      console.log(error)
    }

    setLoading(false)
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