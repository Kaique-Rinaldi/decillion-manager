import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { fetchTasks, createTask, updateTask } from "../../services/tasksService"

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUser(user)

    const data = await fetchTasks(user.id)
    setTasks(data)
  }

  async function handleCreate() {
    if (!input.trim()) return

    const newTask = await createTask(user.id, input)

    setTasks(prev => [newTask, ...prev])
    setInput("")
  }

  async function toggle(id) {
    const task = tasks.find(t => t.id === id)

    const updated = await updateTask(id, {
      done: !task.done
    })

    setTasks(prev =>
      prev.map(t => (t.id === id ? updated : t))
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nova tarefa..."
        />
        <button onClick={handleCreate}>Adicionar</button>
      </div>

      {tasks.map(t => (
        <div
          key={t.id}
          onClick={() => toggle(t.id)}
          style={{
            textDecoration: t.done ? "line-through" : "none",
            cursor: "pointer"
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}