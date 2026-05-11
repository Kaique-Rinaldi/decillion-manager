import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── HOOKS ────────────────────────────────────────────────────────────────────
import { useAuth }    from "./hooks/useAuth"
import { useClients } from "./hooks/useClients"
import { useToast }   from "./hooks/useToast"

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
import LoginPage      from "./components/auth/LoginPage"
import ToastContainer from "./components/shared/Toast"

// ─── ICONS ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { id: "dashboard",     label: "Dashboard",    icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
      { id: "pipeline",      label: "Pipeline CRM", icon: "M4 6h16M4 12h16M4 18h16", badge: "12" },
      { id: "clients",       label: "Clientes",     icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { id: "projects",      label: "Projetos",     icon: "M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z", badge: "7" },
      { id: "tasks",         label: "Tarefas",      icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", badge: "3" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { id: "finance",  label: "Financeiro",  icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" },
      { id: "reports",  label: "Relatórios",  icon: "M18 20V10M12 20V4M6 20v-6" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "notifications", label: "Notificações",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badge: "4" },
      { id: "settings",      label: "Configurações", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
    ],
  },
]

const PAGE_META = {
  dashboard:     { title: "Dashboard",       sub: "Visão geral do sistema" },
  pipeline:      { title: "Pipeline CRM",    sub: "Kanban de oportunidades" },
  clients:       { title: "Clientes",        sub: "Base de contatos e contas" },
  projects:      { title: "Projetos",        sub: "Gestão de projetos ativos" },
  tasks:         { title: "Tarefas",         sub: "Gerenciamento de atividades" },
  finance:       { title: "Financeiro",      sub: "Receitas e pagamentos" },
  reports:       { title: "Relatórios",      sub: "Análises e métricas" },
  notifications: { title: "Notificações",    sub: "Central de alertas" },
  settings:      { title: "Configurações",   sub: "Preferências do sistema" },
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const DEALS_DATA = [
  { stage: 0, name: "Beatriz Lemos",  company: "Empresa Digital", value: "R$8.400",  date: "12 Mai" },
  { stage: 0, name: "Tech Holding",   company: "Tech Holding",    value: "R$15.000", date: "15 Mai" },
  { stage: 1, name: "Grupo Omega",    company: "Grupo Omega",     value: "R$22.000", date: "10 Mai" },
  { stage: 1, name: "Startup Beta",   company: "Startup Beta",    value: "R$6.200",  date: "11 Mai" },
  { stage: 2, name: "Tech Solutions", company: "Tech Solutions",  value: "R$28.750", date: "08 Mai" },
  { stage: 3, name: "Inovação Co.",   company: "Inovação Co.",    value: "R$14.100", date: "07 Mai" },
  { stage: 4, name: "Alpha S.A.",     company: "Alpha S.A.",      value: "R$42.400", date: "06 Mai" },
  { stage: 4, name: "Grupo Beta",     company: "Grupo Beta",      value: "R$21.200", date: "05 Mai" },
]

const PROJECTS_DATA = [
  { name: "Redesign Portal v2",  client: "Alpha S.A.",     status: "Em progresso", deadline: "30 Jun 2026", owner: "Mariana A.", progress: 65 },
  { name: "Integração CRM",      client: "Tech Solutions", status: "Em revisão",   deadline: "15 Jun 2026", owner: "Carlos M.",  progress: 88 },
  { name: "App Mobile",          client: "Inovação Co.",   status: "Planejamento", deadline: "30 Ago 2026", owner: "Rafael P.",  progress: 20 },
  { name: "Automação Marketing", client: "Grupo Beta",     status: "Em progresso", deadline: "20 Jul 2026", owner: "Mariana A.", progress: 45 },
  { name: "Dashboard Analytics", client: "Digital Hub",    status: "Concluído",    deadline: "01 Mai 2026", owner: "Carlos M.",  progress: 100 },
  { name: "API REST v3",         client: "Cloud Corp",     status: "Em progresso", deadline: "10 Jul 2026", owner: "Admin",      progress: 55 },
  { name: "E-commerce B2B",      client: "Startup XYZ",   status: "Pausado",       deadline: "—",          owner: "Rafael P.",  progress: 30 },
]

const TASKS_DATA = [
  { text: "Ligar para Alpha S.A. sobre renovação",       priority: "Alta",  done: false, client: "Alpha S.A." },
  { text: "Enviar proposta atualizada — Tech Solutions", priority: "Alta",  done: false, client: "Tech Solutions" },
  { text: "Preparar demo para Beatriz Lemos",            priority: "Média", done: false, client: "Empresa Digital" },
  { text: "Seguir up com Startup XYZ sobre pagamento",   priority: "Alta",  done: false, client: "Startup XYZ" },
  { text: "Atualizar pipeline Q2",                       priority: "Baixa", done: true,  client: "Interno" },
  { text: "Reunião de alinhamento com equipe",           priority: "Média", done: true,  client: "Interno" },
  { text: "Configurar webhook de notificações",          priority: "Baixa", done: true,  client: "Interno" },
]

const REVENUE_DATA = [
  { month: "Dez", value: 28 }, { month: "Jan", value: 34 },
  { month: "Fev", value: 31 }, { month: "Mar", value: 42 },
  { month: "Abr", value: 38 }, { month: "Mai", value: 47 },
]

const PIPELINE_STAGES = [
  { label: "Lead",       color: "#60a5fa" },
  { label: "Contactado", color: "#a78bfa" },
  { label: "Proposta",   color: "#f59e0b" },
  { label: "Negociação", color: "#ec4899" },
  { label: "Fechado ✓",  color: "#22c97d" },
]

const AVATAR_PALETTE = [
  { bg: "rgba(79,110,247,.15)",  fg: "#4f6ef7" },
  { bg: "rgba(167,139,250,.15)", fg: "#a78bfa" },
  { bg: "rgba(34,201,125,.15)",  fg: "#22c97d" },
  { bg: "rgba(245,158,11,.15)",  fg: "#f59e0b" },
  { bg: "rgba(236,72,153,.15)",  fg: "#ec4899" },
]

const BADGE_STYLES = {
  Ativo:          { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  Trial:          { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  Inadimplente:   { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  "Em progresso": { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  "Em revisão":   { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  Planejamento:   { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
  Concluído:      { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  Pausado:        { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  Pago:           { bg: "rgba(34,201,125,.12)",  color: "#22c97d" },
  Pendente:       { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  Atrasado:       { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  Alta:           { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  Média:          { bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  Baixa:          { bg: "rgba(90,100,120,.15)",  color: "#8892a4" },
  Pro:            { bg: "rgba(167,139,250,.12)", color: "#a78bfa" },
  Admin:          { bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
  Sales:          { bg: "rgba(79,110,247,.12)",  color: "#4f6ef7" },
  Manager:        { bg: "rgba(167,139,250,.12)", color: "#a78bfa" },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function initials(name) {
  return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}
function avatarEl(name, idx) {
  const p = AVATAR_PALETTE[idx % AVATAR_PALETTE.length]
  return (
    <div style={{ width: 28, height: 28, borderRadius: 7, background: p.bg, color: p.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontWeight: 600, flexShrink: 0 }}>
      {initials(name)}
    </div>
  )
}
function Badge({ label }) {
  const s = BADGE_STYLES[label] ?? { bg: "rgba(90,100,120,.15)", color: "#8892a4" }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px",
      borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: ".3px", background: s.bg, color: s.color }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {label}
    </span>
  )
}
function StatCard({ label, value, delta, deltaType = "up", iconPath, iconColor }) {
  const colors = { blue: "#4f6ef7", green: "#22c97d", amber: "#f59e0b", purple: "#a78bfa" }
  const ic = colors[iconColor] ?? "#4f6ef7"
  return (
    <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: 16 }}>
      {iconPath && (
        <div style={{ float: "right", width: 32, height: 32, borderRadius: 8,
          background: ic + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={iconPath} size={15} />
        </div>
      )}
      <div style={{ fontSize: 10, color: "#5a6478", textTransform: "uppercase",
        letterSpacing: ".8px", fontFamily: "monospace", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: "#e8eaf0", letterSpacing: -1 }}>{value}</div>
      {delta && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 8,
          fontSize: 10, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4,
          background: deltaType === "up" ? "rgba(34,201,125,.1)" : "rgba(239,68,68,.1)",
          color: deltaType === "up" ? "#22c97d" : "#ef4444" }}>
          {deltaType === "up" ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  )
}
function Card({ title, sub, children, style = {} }) {
  return (
    <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 12, padding: 16, ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>{title}</div>
            {sub && <div style={{ fontSize: 10, color: "#5a6478", marginTop: 2 }}>{sub}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, color: "#5a6478", textTransform: "uppercase",
      letterSpacing: ".8px", fontFamily: "monospace", marginBottom: 10 }}>
      {children}
    </div>
  )
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────
function DashboardView({ clients }) {
  const maxR = Math.max(...REVENUE_DATA.map(r => r.value))
  const total = clients.length
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Clientes ativos"  value={total || 0}   delta="+12% este mês"       iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" iconColor="blue" />
        <StatCard label="Receita total"    value="R$184k"        delta="+8.4% vs mês"        iconPath="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2"                                                                                   iconColor="green" />
        <StatCard label="Deals em aberto"  value="12"            delta="-2 esta semana"       deltaType="down" iconPath="M4 6h16M4 12h16M4 18h16"                                                                                              iconColor="amber" />
        <StatCard label="Taxa conversão"   value="34%"           delta="+4pp trimestre"       iconPath="M18 20V10M12 20V4M6 20v-6"                                                                                                             iconColor="purple" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Card title="Receita mensal" sub="Últimos 6 meses">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
            {REVENUE_DATA.map((r, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", borderRadius: "4px 4px 0 0",
                  height: `${(r.value / maxR) * 100}%`,
                  background: i === REVENUE_DATA.length - 1 ? "#4f6ef7" : "#1c2236" }} />
                <div style={{ fontSize: 8, color: "#5a6478", fontFamily: "monospace", marginTop: 4 }}>{r.month}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pipeline por etapa" sub="Deals ativos">
          {[{ n: "Lead", c: 2 }, { n: "Contactado", c: 2 }, { n: "Proposta", c: 1 }, { n: "Fechado", c: 2 }].map((s, i) => {
            const colors = ["#60a5fa", "#a78bfa", "#f59e0b", "#22c97d"]
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#8892a4", width: 72, fontFamily: "monospace" }}>{s.n}</div>
                <div style={{ flex: 1, background: "#1c2236", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ background: colors[i], height: "100%", width: `${(s.c / 4) * 100}%`, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace", width: 12 }}>{s.c}</div>
              </div>
            )
          })}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Atividades recentes">
          {[
            { icon: "✓", color: "#22c97d", bg: "rgba(34,201,125,.1)", text: "Deal fechado",    detail: "Empresa Alpha S.A.",    time: "há 23 min · por Carlos M." },
            { icon: "+", color: "#4f6ef7", bg: "rgba(79,110,247,.1)", text: "Novo cliente",    detail: "Beatriz Lemos adicionada", time: "há 1h · por Admin" },
            { icon: "✉", color: "#f59e0b", bg: "rgba(245,158,11,.1)", text: "Proposta enviada", detail: "Tech Solutions Ltda",    time: "há 3h · por Mariana A." },
            { icon: "●", color: "#a78bfa", bg: "rgba(167,139,250,.1)", text: "Projeto criado",  detail: "Redesign Portal v2",     time: "hoje, 09:14 · por Admin" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: a.bg, color: a.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8892a4" }}>
                  <strong style={{ color: "#e8eaf0", fontWeight: 500 }}>{a.text}</strong> — {a.detail}
                </div>
                <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Top clientes por receita">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Cliente", "Plano", "Receita"].map(h => (
                  <th key={h} style={{ textAlign: h === "Receita" ? "right" : "left", padding: "6px 0",
                    fontSize: 9, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase",
                    letterSpacing: ".5px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { n: "Alpha S.A.",    plan: "Enterprise", rev: "R$42.400" },
                { n: "Tech Solutions", plan: "Pro",       rev: "R$28.750" },
                { n: "Grupo Beta",    plan: "Enterprise", rev: "R$21.200" },
                { n: "Inovação Co.",  plan: "Starter",    rev: "R$14.100" },
                { n: "Startup XYZ",   plan: "Pro",        rev: "R$9.400"  },
              ].map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                  <td style={{ padding: "7px 0", fontSize: 12, color: "#e8eaf0", fontWeight: 500 }}>{c.n}</td>
                  <td style={{ padding: "7px 0", fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>{c.plan}</td>
                  <td style={{ padding: "7px 0", fontSize: 12, color: "#22c97d", fontFamily: "monospace", textAlign: "right" }}>{c.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

function PipelineView() {
  const [deals, setDeals] = useState(DEALS_DATA)
  const [dragging, setDragging] = useState(null)

  function onDrop(stageIdx) {
    if (dragging === null) return
    setDeals(prev => prev.map((d, i) => i === dragging ? { ...d, stage: stageIdx } : d))
    setDragging(null)
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
        {PIPELINE_STAGES.map((stage, si) => {
          const stageDeals = deals.filter(d => d.stage === si)
          return (
            <div key={si} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(si)}
              style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 10, padding: 10, minHeight: 120 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: ".5px", fontFamily: "monospace", color: stage.color }}>{stage.label}</div>
                <div style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4,
                  background: stage.color + "18", color: stage.color, fontFamily: "monospace" }}>
                  {stageDeals.length}
                </div>
              </div>
              <AnimatePresence>
                {stageDeals.map((d) => {
                  const realIdx = deals.indexOf(d)
                  return (
                    <motion.div key={d.name + si} layout
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
                      draggable onDragStart={() => setDragging(realIdx)}
                      style={{ background: "#161b2a", border: "1px solid rgba(255,255,255,.06)",
                        borderRadius: 8, padding: 8, marginBottom: 6, cursor: "grab" }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "#e8eaf0", marginBottom: 3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: "#5a6478", marginBottom: 6 }}>{d.company}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#22c97d", fontFamily: "monospace" }}>{d.value}</div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                        <div style={{ fontSize: 8, color: "#5a6478", fontFamily: "monospace" }}>{d.date}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard label="Valor total pipeline" value="R$287k" />
        <StatCard label="Ticket médio"         value="R$23,9k" />
        <StatCard label="Ciclo médio"          value="18 dias" />
      </div>
    </div>
  )
}

function ClientsView({ clients, addClient }) {
  const [query, setQuery]       = useState("")
  const [showForm, setShowForm] = useState(false)
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [company, setCompany]   = useState("")
  const [filterPayment, setFilterPayment] = useState("all")
  const [filterProject, setFilterProject] = useState("all")

  // Usa clientes reais do hook se houver, senão mostra mensagem vazia
  let list = clients.filter(c => {
    const q = query.toLowerCase()
    const matchQ = !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || (c.company || "").toLowerCase().includes(q)
    const matchP = filterPayment === "all" || c.paymentStatus === filterPayment
    const matchPr = filterProject === "all" || c.projectStatus === filterProject
    return matchQ && matchP && matchPr
  })

  function handleAdd() {
    if (!name.trim() || !email.trim()) return
    addClient({ name: name.trim(), email: email.trim(), company: company.trim() })
    setName(""); setEmail(""); setCompany(""); setShowForm(false)
  }

  const inputStyle = {
    background: "#161b2a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7,
    padding: "7px 10px", fontSize: 12, color: "#e8eaf0", fontFamily: "inherit",
    outline: "none", width: "100%",
  }
  const chipStyle = (active) => ({
    padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
    border: "1px solid", fontFamily: "inherit",
    borderColor: active ? "#4f6ef7" : "rgba(255,255,255,.1)",
    background: active ? "#4f6ef7" : "transparent",
    color: active ? "#fff" : "#8892a4",
  })

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#161b2a",
          border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "6px 10px", flex: 1, minWidth: 200 }}>
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, email ou empresa…"
            style={{ background: "none", border: "none", outline: "none", fontSize: 12,
              color: "#e8eaf0", fontFamily: "inherit", width: "100%" }} />
          {query && (
            <button onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#5a6478", fontSize: 16 }}>×</button>
          )}
        </div>
        <button onClick={() => setShowForm(p => !p)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7,
            background: "#4f6ef7", border: "none", color: "#fff", fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit" }}>
          + Novo cliente
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace" }}>PAGAMENTO:</span>
        {[["all","Todos"],["pendente","Pendente"],["pago","Pago"],["atrasado","Atrasado"]].map(([v,l]) => (
          <button key={v} style={chipStyle(filterPayment === v)} onClick={() => setFilterPayment(v)}>{l}</button>
        ))}
        <span style={{ fontSize: 10, color: "#5a6478", fontFamily: "monospace", marginLeft: 8 }}>PROJETO:</span>
        {[["all","Todos"],["andamento","Em andamento"],["concluido","Concluído"],["cancelado","Cancelado"]].map(([v,l]) => (
          <button key={v} style={chipStyle(filterProject === v)} onClick={() => setFilterProject(v)}>{l}</button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 12 }}>
            <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#5a6478", textTransform: "uppercase",
                letterSpacing: ".8px", fontFamily: "monospace", marginBottom: 12 }}>Novo cliente</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[["Nome", name, setName, "Ana Souza"],["Email", email, setEmail, "ana@empresa.com"],["Empresa", company, setCompany, "Empresa S.A."]].map(([label, val, setter, ph]) => (
                  <div key={label}>
                    <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace",
                      textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>{label}</div>
                    <input style={inputStyle} value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAdd}
                  style={{ padding: "7px 14px", borderRadius: 7, background: "#4f6ef7", border: "none",
                    color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Adicionar
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: "7px 14px", borderRadius: 7, background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)", color: "#8892a4", fontSize: 12,
                    cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Nome", "Empresa", "Email", "Pagamento", "Projeto", "Valor", "Entrega"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: ".8px", color: "#5a6478", fontFamily: "monospace",
                  borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "48px 0", textAlign: "center", color: "#5a6478", fontSize: 13 }}>
                Nenhum cliente encontrado
              </td></tr>
            ) : list.map((c, i) => (
              <tr key={c.id ?? i}
                style={{ borderBottom: "1px solid rgba(255,255,255,.03)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "11px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {avatarEl(c.name, i)}
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: "#8892a4" }}>{c.company || "—"}</td>
                <td style={{ padding: "11px 16px", fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>{c.email}</td>
                <td style={{ padding: "11px 16px" }}>
                  <Badge label={c.paymentStatus === "pago" ? "Pago" : c.paymentStatus === "atrasado" ? "Atrasado" : "Pendente"} />
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <Badge label={c.projectStatus === "concluido" ? "Concluído" : c.projectStatus === "cancelado" ? "Pausado" : "Em progresso"} />
                </td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: "#22c97d", fontFamily: "monospace" }}>
                  {c.projectValue ? `R$${Number(c.projectValue).toLocaleString("pt-BR")}` : "—"}
                </td>
                <td style={{ padding: "11px 16px", fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>
                  {c.endDate ? c.endDate.split("-").reverse().join("/") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProjectsView() {
  return (
    <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Projeto", "Cliente", "Status", "Prazo", "Responsável", "Progresso"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: ".8px", color: "#5a6478", fontFamily: "monospace",
                borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROJECTS_DATA.map((p, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.03)", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{p.name}</td>
              <td style={{ padding: "11px 16px", fontSize: 12, color: "#8892a4" }}>{p.client}</td>
              <td style={{ padding: "11px 16px" }}><Badge label={p.status} /></td>
              <td style={{ padding: "11px 16px", fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>{p.deadline}</td>
              <td style={{ padding: "11px 16px", fontSize: 12, color: "#8892a4" }}>{p.owner}</td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, background: "#1c2236", borderRadius: 4, height: 5, overflow: "hidden" }}>
                    <div style={{ background: p.progress === 100 ? "#22c97d" : "#4f6ef7",
                      height: "100%", width: `${p.progress}%`, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace" }}>{p.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TasksView() {
  const [tasks, setTasks] = useState(TASKS_DATA)
  const pending = tasks.filter(t => !t.done)
  const done    = tasks.filter(t =>  t.done)

  function toggle(idx) {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t))
  }

  function TaskItem({ task, idx }) {
    return (
      <div onClick={() => toggle(idx)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
          borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", marginBottom: 6,
          background: "#111520", cursor: "pointer" }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
          border: task.done ? "none" : "1.5px solid rgba(255,255,255,.15)",
          background: task.done ? "#22c97d" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {task.done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: task.done ? "#5a6478" : "#8892a4",
            textDecoration: task.done ? "line-through" : "none" }}>{task.text}</div>
          <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", marginTop: 3 }}>{task.client}</div>
        </div>
        <Badge label={task.priority} />
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <SectionLabel>Pendentes ({pending.length})</SectionLabel>
        {tasks.map((t, i) => !t.done && <TaskItem key={i} task={t} idx={i} />)}
      </div>
      <div>
        <SectionLabel>Concluídas ({done.length})</SectionLabel>
        {tasks.map((t, i) => t.done && <TaskItem key={i} task={t} idx={i} />)}
      </div>
    </div>
  )
}

function FinanceView() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Receita (mês)"  value="R$28,4k" delta="+6.2%"          iconColor="green" />
        <StatCard label="Despesas (mês)" value="R$11,2k" delta="+1.8%" deltaType="down" iconColor="amber" />
        <StatCard label="Lucro líquido"  value="R$17,2k" delta="+9.1%"          iconColor="green" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Pagamentos recentes">
          {[
            { label: "Alpha S.A.",   status: "Pago",     value: "+R$12.400", color: "#22c97d" },
            { label: "Tech Ltda",    status: "Pendente", value: "R$8.000",   color: "#f59e0b" },
            { label: "Grupo Beta",   status: "Pago",     value: "+R$5.200",  color: "#22c97d" },
            { label: "Startup XYZ",  status: "Atrasado", value: "R$3.400",   color: "#ef4444" },
            { label: "Inovação Co.", status: "Pago",     value: "+R$9.750",  color: "#22c97d" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge label={p.status} />
                <span style={{ fontSize: 12, color: "#8892a4" }}>{p.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: p.color }}>{p.value}</span>
            </div>
          ))}
        </Card>
        <Card title="Resumo anual">
          {[
            { label: "Receita bruta",       value: "R$184.320", color: "#22c97d" },
            { label: "Deduções",            value: "-R$9.216",  color: "#ef4444" },
            { label: "Receita líquida",     value: "R$175.104", color: "#e8eaf0" },
            { label: "Desp. operacionais",  value: "-R$62.400", color: "#ef4444" },
            { label: "EBITDA",              value: "R$112.704", color: "#22c97d", bold: true },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
              <span style={{ fontSize: r.bold ? 13 : 11, color: r.bold ? "#e8eaf0" : "#8892a4", fontWeight: r.bold ? 600 : 400 }}>{r.label}</span>
              <span style={{ fontSize: r.bold ? 15 : 13, fontWeight: r.bold ? 700 : 600, fontFamily: "monospace", color: r.color }}>{r.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function ReportsView() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Leads gerados"  value="134"   delta="+22% vs mês" />
        <StatCard label="Deals fechados" value="41"    delta="+8% vs mês" />
        <StatCard label="CAC médio"      value="R$890" delta="-3%" deltaType="down" />
        <StatCard label="LTV médio"      value="R$4,2k" delta="+11%" />
      </div>
      <Card title="Performance por vendedor">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Vendedor", "Deals", "Receita", "Conversão", "Meta"].map(h => (
                <th key={h} style={{ padding: "6px 0", textAlign: h === "Vendedor" ? "left" : "right",
                  fontSize: 9, color: "#5a6478", fontFamily: "monospace", textTransform: "uppercase",
                  borderBottom: "1px solid rgba(255,255,255,.05)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Carlos M.",  ini: "CM", deals: 18, rev: "R$62.400", conv: "41%", prog: 78, color: "#4f6ef7" },
              { name: "Mariana A.", ini: "MA", deals: 14, rev: "R$48.750", conv: "36%", prog: 61, color: "#a78bfa" },
              { name: "Rafael P.",  ini: "RP", deals: 9,  rev: "R$31.200", conv: "28%", prog: 42, color: "#f59e0b" },
            ].map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                <td style={{ padding: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: s.color + "20",
                      color: s.color, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 600 }}>{s.ini}</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right", fontSize: 12, color: "#8892a4", fontFamily: "monospace" }}>{s.deals}</td>
                <td style={{ textAlign: "right", fontSize: 12, color: "#22c97d", fontFamily: "monospace" }}>{s.rev}</td>
                <td style={{ textAlign: "right", fontSize: 12, color: "#8892a4", fontFamily: "monospace" }}>{s.conv}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    <div style={{ width: 60, background: "#1c2236", borderRadius: 4, height: 5, overflow: "hidden" }}>
                      <div style={{ background: s.color, height: "100%", width: `${s.prog}%`, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace" }}>{s.prog}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function NotificationsView() {
  const notifs = [
    { icon: "✓",  color: "#22c97d", unread: true,  title: "Deal fechado com sucesso",  desc: "Alpha S.A. — R$12.400 confirmados por Carlos M.",      time: "há 23 min" },
    { icon: "⏰", color: "#f59e0b", unread: true,  title: "Pagamento em atraso",       desc: "Startup XYZ com fatura de R$3.400 vencida há 5 dias",   time: "há 2h" },
    { icon: "+",  color: "#4f6ef7", unread: true,  title: "Novo lead adicionado",      desc: "Beatriz Lemos via formulário web",                       time: "há 3h" },
    { icon: "📅", color: "#a78bfa", unread: true,  title: "Reunião em 30 minutos",     desc: "Demo com Tech Solutions Ltda às 15:00",                 time: "há 4h" },
    { icon: "📊", color: "#4f6ef7", unread: false, title: "Relatório mensal gerado",   desc: "Relatório de maio/2026 disponível para download",        time: "há 1 dia" },
  ]
  return (
    <Card title="Central de notificações" style={{ padding: 0 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0" }}>Central de notificações</div>
        <button style={{ fontSize: 10, background: "none", border: "1px solid rgba(255,255,255,.08)",
          color: "#8892a4", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
          Marcar todas como lidas
        </button>
      </div>
      {notifs.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12,
          padding: "12px 16px",
          borderBottom: i < notifs.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
          background: n.unread ? "rgba(79,110,247,.03)" : "transparent", cursor: "pointer" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: n.color + "18",
              color: n.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {n.icon}
            </div>
            {n.unread && (
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8,
                borderRadius: "50%", background: "#4f6ef7", border: "2px solid #111520" }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{n.title}</div>
            <div style={{ fontSize: 11, color: "#5a6478", marginTop: 2, lineHeight: 1.4 }}>{n.desc}</div>
            <div style={{ fontSize: 9, color: "#5a6478", fontFamily: "monospace", marginTop: 4 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </Card>
  )
}

function SettingsView({ user, onLogout }) {
  const [toggles, setToggles] = useState({ emailNotif: true, dealAlerts: true, weeklyReport: false, twoFactor: false, webhook: true })

  function Toggle({ k }) {
    return (
      <div onClick={() => setToggles(p => ({ ...p, [k]: !p[k] }))}
        style={{ width: 36, height: 20, borderRadius: 20,
          background: toggles[k] ? "#4f6ef7" : "#1c2236",
          border: `1px solid ${toggles[k] ? "#4f6ef7" : "rgba(255,255,255,.1)"}`,
          position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: toggles[k] ? 16 : 2, width: 14, height: 14,
          borderRadius: "50%", background: toggles[k] ? "#fff" : "#5a6478", transition: "left .2s" }} />
      </div>
    )
  }
  function Section({ icon, title, children }) {
    return (
      <div style={{ background: "#111520", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)",
          fontSize: 11, fontWeight: 600, color: "#e8eaf0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#5a6478" }}>{icon}</span> {title}
        </div>
        {children}
      </div>
    )
  }
  function Row({ label, desc, right }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0" }}>{label}</div>
          {desc && <div style={{ fontSize: 10, color: "#5a6478", marginTop: 2 }}>{desc}</div>}
        </div>
        {right}
      </div>
    )
  }

  return (
    <div>
      <Section icon="🏢" title="Empresa">
        <Row label="Nome da empresa" right={<span style={{ fontSize: 12, color: "#5a6478", fontFamily: "monospace" }}>Decillion</span>} />
        <Row label="Plano"           right={<Badge label="Pro" />} />
        <Row label="Fuso horário"    right={<span style={{ fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>America/São_Paulo</span>} />
      </Section>
      <Section icon="👤" title="Minha conta">
        <Row label="Email" desc="Conta atual" right={<span style={{ fontSize: 11, color: "#5a6478", fontFamily: "monospace" }}>{user?.email}</span>} />
        <Row label="Sessão iniciada" desc={user?.loginAt ? new Date(user.loginAt).toLocaleString("pt-BR") : "—"} right={
          <button onClick={onLogout}
            style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", fontSize: 11,
              cursor: "pointer", fontFamily: "inherit" }}>
            Sair
          </button>
        } />
      </Section>
      <Section icon="🔔" title="Notificações">
        <Row label="Notificações por email" desc="Receber resumo diário"      right={<Toggle k="emailNotif"    />} />
        <Row label="Alertas de deals"       desc="Notificar ao fechar um deal" right={<Toggle k="dealAlerts"   />} />
        <Row label="Relatório semanal"      desc="Enviar toda segunda-feira"   right={<Toggle k="weeklyReport" />} />
      </Section>
      <Section icon="🔒" title="Segurança">
        <Row label="Autenticação em dois fatores" desc="Recomendado para administradores" right={<Toggle k="twoFactor" />} />
        <Row label="Sessões ativas" desc="1 dispositivo conectado"
          right={<button style={{ fontSize: 11, background: "none", border: "1px solid rgba(255,255,255,.08)",
            color: "#8892a4", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
            Gerenciar
          </button>} />
      </Section>
      <Section icon="🔌" title="API & Integrações">
        <Row label="API Key"     desc="Para integrações externas"      right={<span style={{ fontSize: 11, fontFamily: "monospace", color: "#5a6478" }}>dcl_sk_••••••••4f2a</span>} />
        <Row label="Webhook URL" desc="Receber eventos em tempo real"  right={<Toggle k="webhook" />} />
      </Section>
    </div>
  )
}

// ─── PAGE TRANSITION ──────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 8  },
  animate: { opacity: 1, y: 0,  transition: { duration: .2  } },
  exit:    { opacity: 0, y: -6, transition: { duration: .14 } },
}

// ═════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, loading: authLoading, error: authError, login, logout, setError } = useAuth()

  // ── Clients CRUD ──────────────────────────────────────────────────────────
  const { clients, addClient } = useClients()

  // ── Toast ─────────────────────────────────────────────────────────────────
  const { toasts, addToast, removeToast } = useToast()

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard")

  // ── Not logged in → Login screen ──────────────────────────────────────────
  if (!user) {
    return (
      <>
        <LoginPage
          onLogin={login}
          loading={authLoading}
          error={authError}
          clearError={() => setError("")}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  const meta = PAGE_META[activeTab] ?? { title: activeTab, sub: "" }

  // ── Logged in → full layout ────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0d14", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 220, minWidth: 220, background: "#111520",
        borderRight: "1px solid rgba(255,255,255,.06)", display: "flex",
        flexDirection: "column", padding: "20px 0", height: "100vh", overflowY: "auto" }}>

        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,.06)", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", letterSpacing: "-.3px" }}>Decillion</div>
          <div style={{ fontSize: 10, color: "#3a4255", marginTop: 2, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".8px" }}>Manager v2.0</div>
        </div>

        {/* Nav */}
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ padding: "0 12px", marginBottom: 4 }}>
            <div style={{ fontSize: 9, color: "#3a4255", textTransform: "uppercase", letterSpacing: 1,
              fontWeight: 600, padding: "8px 8px 6px", fontFamily: "monospace" }}>
              {section.label}
            </div>
            {section.items.map(({ id, label, icon, badge }) => {
              const active = activeTab === id
              const dynamicBadge = id === "clients" ? clients.length : badge
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12.5,
                    fontWeight: 400, border: "none", textAlign: "left", marginBottom: 1, fontFamily: "inherit",
                    background: active ? "#4f6ef7" : "transparent",
                    color:      active ? "#fff"    : "#8892a4",
                    transition: "all .15s" }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#161b2a"; e.currentTarget.style.color = "#e8eaf0" } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8892a4" } }}>
                  <Icon d={icon} size={14} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {dynamicBadge !== undefined && dynamicBadge !== null && (
                    <span style={{ background: active ? "rgba(255,255,255,.2)" : "#1c2236",
                      border: `1px solid ${active ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.08)"}`,
                      borderRadius: 20, padding: "1px 6px", fontSize: 9, fontFamily: "monospace",
                      color: active ? "rgba(255,255,255,.8)" : "#5a6478" }}>
                      {dynamicBadge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        {/* User footer */}
        <div style={{ marginTop: "auto", padding: "16px 12px 0", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            borderRadius: 8, background: "#161b2a", border: "1px solid rgba(255,255,255,.06)",
            marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f6ef7,#a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
              {initials(user.name ?? "Admin")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#e8eaf0", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name ?? "Admin"}</div>
              <div style={{ fontSize: 9, color: "#3a4255", fontFamily: "monospace",
                textTransform: "uppercase", letterSpacing: ".5px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          {/* Logout button */}
          <button onClick={logout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
              borderRadius: 8, background: "transparent", border: "none", cursor: "pointer",
              color: "#5a6478", fontSize: 12, fontFamily: "inherit", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.08)"; e.currentTarget.style.color = "#ef4444" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent";         e.currentTarget.style.color = "#5a6478" }}>
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={13} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", gap: 12, background: "#111520", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0" }}>{meta.title}</div>
            <div style={{ fontSize: 11, color: "#5a6478", marginTop: 1 }}>{meta.sub}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7,
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                border: "1px solid rgba(255,255,255,.08)", background: "#161b2a", color: "#8892a4" }}>
              Exportar
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 7,
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                border: "none", background: "#4f6ef7", color: "#fff" }}>
              + Novo cliente
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {activeTab === "dashboard"     && <DashboardView clients={clients} />}
              {activeTab === "pipeline"      && <PipelineView />}
              {activeTab === "clients"       && <ClientsView clients={clients} addClient={c => { addClient(c); addToast("Cliente adicionado!", "success") }} />}
              {activeTab === "projects"      && <ProjectsView />}
              {activeTab === "tasks"         && <TasksView />}
              {activeTab === "finance"       && <FinanceView />}
              {activeTab === "reports"       && <ReportsView />}
              {activeTab === "notifications" && <NotificationsView />}
              {activeTab === "settings"      && <SettingsView user={user} onLogout={logout} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── TOAST ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}