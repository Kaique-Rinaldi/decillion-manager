import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ClientDetails({ clientId }) {
  const [activities, setActivities] = useState([])
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clientId) return
    loadActivities()
  }, [clientId])

  async function loadActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) return

    setActivities(data || [])
  }

  async function addActivity(e) {
    e.preventDefault()

    const safeType = (type || "").trim()
    const safeDescription = (description || "").trim()

    if (!safeType || !safeDescription) return

    setLoading(true)

    const { error } = await supabase.from("activities").insert([
      {
        client_id: clientId,
        type: safeType,
        description: safeDescription
      }
    ])

    setLoading(false)

    if (error) return

    setType("")
    setDescription("")
    loadActivities()
  }

  if (!clientId) return <p>Carregando cliente...</p>

  return (
    <div>
      <form onSubmit={addActivity}>
        <input value={type} onChange={e => setType(e.target.value)} />
        <input value={description} onChange={e => setDescription(e.target.value)} />
        <button disabled={loading}>Add</button>
      </form>

      {activities.map(a => (
        <div key={a.id}>
          <b>{a.type}</b>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  )
}