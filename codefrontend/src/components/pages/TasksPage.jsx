import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { fetchTasks, updateTask } from "../../services/tasksService"

export default function TasksPage() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const data = await fetchTasks(user.id)
    setTasks(data)
  }

  async function toggle(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const updated = await updateTask(id, { status: task.status === "done" ? "pending" : "done" })

    setTasks(prev =>
      prev.map(t => (t.id === updated.id ? updated : t))
    )
  }

  return (
    <div>
      {tasks.map(t => (
        <div key={t.id} onClick={() => toggle(t.id)}>
          {t.title} - {t.status}
        </div>
      ))}
    </div>
  )
}