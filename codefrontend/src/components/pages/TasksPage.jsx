import { useMemo } from 'react'

import Badge from '../components/shared/Badge'
import { updateTask } from '../services/tasksService'

const PRIORITY_BADGE = { alta: 'red', media: 'amber', baixa: 'gray' }
const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, color: '#5a6478', textTransform: 'uppercase',
      letterSpacing: '.8px', fontFamily: 'monospace', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function TaskItem({ task, onToggle }) {
  return (
    <div
      onClick={() => onToggle(task.id)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 8, border: '1px solid rgba(255,255,255,.06)', marginBottom: 6,
        background: '#111520', cursor: 'pointer', transition: 'border-color .12s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: task.done ? 'none' : '1.5px solid rgba(255,255,255,.2)',
        background: task.done ? '#22c97d' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
      }}>
        {task.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: task.done ? '#5a6478' : '#8892a4',
          textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</div>
        <div style={{ fontSize: 9, color: '#5a6478', fontFamily: 'monospace', marginTop: 3 }}>{task.client}</div>
      </div>
      <Badge colorKey={PRIORITY_BADGE[task.priority] ?? 'gray'} label={PRIORITY_LABEL[task.priority] ?? task.priority} />
    </div>
  )
}

export default function TasksPage({ addToast }) {
  const { tasks, upsertTask } = useAppStore()
  const pending = useMemo(() => tasks.filter(t => !t.done), [tasks])
  const done    = useMemo(() => tasks.filter(t =>  t.done), [tasks])

  async function toggle(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done
    upsertTask({ ...task, done: newDone }) // optimistic
    try {
      const updated = await updateTask(id, { done: newDone })
      upsertTask(updated)
      addToast(newDone ? 'Tarefa concluída! ✓' : 'Tarefa reaberta.', 'success')
    } catch {
      upsertTask(task) // rollback
      addToast('Erro ao atualizar tarefa.', 'error')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <SectionLabel>Pendentes ({pending.length})</SectionLabel>
        {pending.length === 0
          ? <div style={{ textAlign: 'center', color: '#5a6478', padding: '24px 0', fontSize: 12 }}>Nenhuma tarefa pendente 🎉</div>
          : pending.map(t => <TaskItem key={t.id} task={t} onToggle={toggle} />)
        }
      </div>
      <div>
        <SectionLabel>Concluídas ({done.length})</SectionLabel>
        {done.length === 0
          ? <div style={{ textAlign: 'center', color: '#5a6478', padding: '24px 0', fontSize: 12 }}>Nenhuma concluída ainda</div>
          : done.map(t => <TaskItem key={t.id} task={t} onToggle={toggle} />)
        }
      </div>
    </div>
  )
}