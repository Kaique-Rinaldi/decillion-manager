import { useEffect, useState } from "react"
import { fetchActivitiesByClient, createActivity } from "../services/activityService"

export default function ClientDetails({ clientId }) {
  const [activities, setActivities] = useState([])
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clientId) loadActivities()
  }, [clientId])

  async function loadActivities() {
    const data = await fetchActivitiesByClient(clientId)
    setActivities(data)
  }

  async function addActivity(e) {
    e.preventDefault()
    setLoading(true)

    await createActivity({
      clientId,
      type,
      description
    })

    setType("")
    setDescription("")
    await loadActivities()

    setLoading(false)
  }

  return (
    <div>
      <h1>Activities</h1>

      <form onSubmit={addActivity}>
        <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Tipo" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />

        <button disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {activities.map((a) => (
        <div key={a.id}>
          <b>{a.type}</b>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  )
}