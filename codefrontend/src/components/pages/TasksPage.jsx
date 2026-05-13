import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { fetchTasks, createTask, updateTask } from "../../services/tasksService"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeTask(t) {
  return {
    ...t,
    text: t.text ?? t.title ?? t.description ?? "",
    done: t.done ?? t.completed ?? false,
  }
}

export default function TasksPage() {
  const [tasks,   setTasks]   = useState([])
  const [input,   setInput]   = useState("")
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [user,    setUser]    = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const data = await fetchTasks(user.id)
      setTasks((data ?? []).map(normalizeTask))
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!input.trim() || !user) return
    setSaving(true)
    try {
      const newTask = await createTask(user.id, input.trim())
      setTasks(prev => [normalizeTask(newTask), ...prev])
      setInput("")
    } catch (err) {
      console.error("Erro ao criar tarefa:", err)
    } finally {
      setSaving(false)
    }
  }

  async function toggle(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

    try {
      const updated = await updateTask(id, { done: !task.done })
      setTasks(prev => prev.map(t => t.id === id ? normalizeTask(updated) : t))
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err)
      // Reverte
      setTasks(prev => prev.map(t => t.id === id ? task : t))
    }
  }

  const pending   = tasks.filter(t => !t.done).length
  const completed = tasks.filter(t =>  t.done).length

  return (
    <div>
      {/* Totais */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20,
      }}>
        {[
          { label: "Total",      value: tasks.length,  color: "#60a5fa" },
          { label: "Pendentes",  value: pending,        color: "#f59e0b" },
          { label: "Concluídas", value: completed,      color: "#22c97d" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "#111520", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 10, padding: "10px 14px",
          }}>
            <div style={{ fontSize: 9, color, fontFamily: "monospace",
              textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf0", fontFamily: "monospace" }}>
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      {/* Input para nova tarefa */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder="Nova tarefa..."
          disabled={saving}
          style={{
            flex: 1,
            background: "#111520",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "#e8eaf0",
            fontFamily: "monospace",
            outline: "none",
            transition: "border-color .15s",
          }}
          onFocus={e  => e.target.style.borderColor = "rgba(96,165,250,.5)"}
          onBlur={e   => e.target.style.borderColor = "rgba(255,255,255,.09)"}
        />
        <button
          onClick={handleCreate}
          disabled={!input.trim() || saving}
          style={{
            background: saving || !input.trim() ? "rgba(96,165,250,.1)" : "rgba(96,165,250,.15)",
            border: "1px solid rgba(96,165,250,.3)",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: saving || !input.trim() ? "#4a6a9a" : "#60a5fa",
            fontFamily: "monospace",
            cursor: saving || !input.trim() ? "not-allowed" : "pointer",
            transition: "all .15s",
            whiteSpace: "nowrap",
          }}
        >
          {saving ? "..." : "+ Adicionar"}
        </button>
      </div>

      {/* Lista de tarefas */}
      {loading ? (
        [1,2,3,4].map(i => (
          <div key={i} style={{
            height: 48, borderRadius: 8, marginBottom: 8,
            background: "linear-gradient(90deg,#1c2236 25%,#252d42 50%,#1c2236 75%)",
            backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite",
          }}/>
        ))
      ) : tasks.length === 0 ? (
        <div style={{
          border: "1px dashed rgba(255,255,255,.07)", borderRadius: 10,
          padding: "32px 16px", textAlign: "center",
          color: "#3a4255", fontSize: 12, fontFamily: "monospace",
        }}>
          Nenhuma tarefa ainda. Crie a primeira acima!
        </div>
      ) : (
        tasks.map(t => (
          <div
            key={t.id}
            onClick={() => toggle(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#111520",
              border: `1px solid ${t.done ? "rgba(34,201,125,.15)" : "rgba(255,255,255,.06)"}`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 6,
              cursor: "pointer",
              transition: "all .15s",
              opacity: t.done ? 0.6 : 1,
            }}
          >
            {/* Checkbox visual */}
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${t.done ? "#22c97d" : "rgba(255,255,255,.2)"}`,
              background: t.done ? "rgba(34,201,125,.15)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}>
              {t.done && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3l2.5 2.5L8 1" stroke="#22c97d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* Texto */}
            <span style={{
              fontSize: 13,
              color: t.done ? "#4a5568" : "#c8cce0",
              fontFamily: "monospace",
              textDecoration: t.done ? "line-through" : "none",
              flex: 1,
              transition: "all .15s",
            }}>
              {t.text}
            </span>

            {/* Badge status */}
            <span style={{
              fontSize: 8, fontFamily: "monospace", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".3px",
              color:      t.done ? "#22c97d" : "#f59e0b",
              background: t.done ? "rgba(34,201,125,.1)" : "rgba(245,158,11,.1)",
              padding: "2px 6px", borderRadius: 4, flexShrink: 0,
            }}>
              {t.done ? "Feito" : "Pendente"}
            </span>
          </div>
        ))
      )}

      <style>{`
        @keyframes shimmer { to { background-position: -400% 0; } }
        input::placeholder { color: #3a4255; }
      `}</style>
    </div>
  )
}