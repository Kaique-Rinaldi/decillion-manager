import { useEffect, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth }  from "./hooks/useAuth"
import { useToast } from "./hooks/useToast"
import LoginPage      from "./components/shared/auth/LoginPage"
import ToastContainer from "./components/shared/Toast"

// ═══════════════════════════════════════════════════════════════════
// 1. ENUMS CENTRALIZADOS — fonte única de verdade para todos os status
// ═══════════════════════════════════════════════════════════════════
const PAYMENT_STATUS = {
  pendente: { label: "Pendente", badge: "amber" },
  pago:     { label: "Pago",     badge: "green" },
  atrasado: { label: "Atrasado", badge: "red"   },
}
const PROJECT_STATUS = {
  andamento: { label: "Em andamento", badge: "blue"  },
  concluido: { label: "Concluído",    badge: "green" },
  cancelado: { label: "Cancelado",    badge: "gray"  },
}
const PIPELINE_STAGE = {
  lead:      { label: "Lead",       color: "#60a5fa", order: 0 },
  contato:   { label: "Contactado", color: "#a78bfa", order: 1 },
  proposta:  { label: "Proposta",   color: "#f59e0b", order: 2 },
  negoc:     { label: "Negociação", color: "#ec4899", order: 3 },
  fechado:   { label: "Fechado ✓",  color: "#22c97d", order: 4 },
}
const PIPELINE_STAGE_KEYS = ["lead","contato","proposta","negoc","fechado"]

// Transições permitidas no pipeline (evita drops inválidos)
const ALLOWED_TRANSITIONS = {
  lead:     ["contato"],
  contato:  ["lead","proposta"],
  proposta: ["contato","negoc"],
  negoc:    ["proposta","fechado"],
  fechado:  ["negoc"],
}

// ═══════════════════════════════════════════════════════════════════
// 2. DADOS INICIAIS — todos com IDs, valores numéricos e ISO dates
// ═══════════════════════════════════════════════════════════════════
const SEED_CLIENTS = [
  { id:"cl_001", name:"Marina Alves",    email:"marina@digitalstudio.com",   phone:"(11) 98765-4321", company:"Digital Studio",  projectValue:8500,  paymentStatus:"pago",     projectStatus:"concluido", startDate:"2024-02-01", endDate:"2024-04-30", notes:"Redesign site institucional." },
  { id:"cl_002", name:"Carlos Mendonça", email:"carlos@techsolutions.com",   phone:"(11) 91234-5678", company:"Tech Solutions",  projectValue:14200, paymentStatus:"pendente",  projectStatus:"andamento", startDate:"2024-03-15", endDate:"2024-07-15", notes:"Sistema de gestão interno." },
  { id:"cl_003", name:"Beatriz Costa",   email:"bia@modaverde.com.br",       phone:"(21) 97654-3210", company:"Moda Verde",      projectValue:5800,  paymentStatus:"atrasado",  projectStatus:"andamento", startDate:"2024-01-10", endDate:"2024-03-10", notes:"E-commerce sustentável." },
  { id:"cl_004", name:"Rafael Torres",   email:"rafael@grupoalpha.com",      phone:"(51) 99876-5432", company:"Grupo Alpha",     projectValue:22000, paymentStatus:"pago",     projectStatus:"concluido", startDate:"2023-11-01", endDate:"2024-02-28", notes:"Plataforma SaaS." },
  { id:"cl_005", name:"Juliana Neves",   email:"ju@inovacaolab.io",          phone:"(41) 98123-7654", company:"Inovação Lab",    projectValue:9300,  paymentStatus:"pendente",  projectStatus:"cancelado", startDate:"2024-04-01", endDate:"2024-06-01", notes:"App mobile. Cancelado." },
]

const SEED_DEALS = [
  { id:"deal_001", clientId:"cl_003", name:"Beatriz Costa",   company:"Moda Verde",     value:5800,  stage:"lead",     closedAt:null,        createdAt:"2024-05-12" },
  { id:"deal_002", clientId:null,     name:"Tech Holding",    company:"Tech Holding",   value:15000, stage:"lead",     closedAt:null,        createdAt:"2024-05-15" },
  { id:"deal_003", clientId:null,     name:"Grupo Omega",     company:"Grupo Omega",    value:22000, stage:"contato",  closedAt:null,        createdAt:"2024-05-10" },
  { id:"deal_004", clientId:null,     name:"Startup Beta",    company:"Startup Beta",   value:6200,  stage:"contato",  closedAt:null,        createdAt:"2024-05-11" },
  { id:"deal_005", clientId:"cl_002", name:"Carlos Mendonça", company:"Tech Solutions", value:14200, stage:"proposta", closedAt:null,        createdAt:"2024-05-08" },
  { id:"deal_006", clientId:"cl_005", name:"Juliana Neves",   company:"Inovação Lab",   value:9300,  stage:"negoc",    closedAt:null,        createdAt:"2024-05-07" },
  { id:"deal_007", clientId:"cl_001", name:"Marina Alves",    company:"Digital Studio", value:8500,  stage:"fechado",  closedAt:"2024-05-06", createdAt:"2024-04-01" },
  { id:"deal_008", clientId:"cl_004", name:"Rafael Torres",   company:"Grupo Alpha",    value:22000, stage:"fechado",  closedAt:"2024-05-05", createdAt:"2024-03-01" },
]

const SEED_PROJECTS = [
  { id:"proj_001", clientId:"cl_004", name:"Redesign Portal v2",    client:"Grupo Alpha",    status:"andamento", deadline:"2026-06-30", owner:"Mariana A.", progress:65  },
  { id:"proj_002", clientId:"cl_002", name:"Integração CRM",        client:"Tech Solutions", status:"andamento", deadline:"2026-06-15", owner:"Carlos M.",  progress:88  },
  { id:"proj_003", clientId:"cl_005", name:"App Mobile",            client:"Inovação Lab",   status:"cancelado", deadline:"2026-08-30", owner:"Rafael P.",  progress:20  },
  { id:"proj_004", clientId:null,     name:"Automação Marketing",   client:"Grupo Beta",     status:"andamento", deadline:"2026-07-20", owner:"Mariana A.", progress:45  },
  { id:"proj_005", clientId:"cl_001", name:"Dashboard Analytics",   client:"Digital Studio", status:"concluido", deadline:"2026-05-01", owner:"Carlos M.",  progress:100 },
  { id:"proj_006", clientId:null,     name:"API REST v3",           client:"Cloud Corp",     status:"andamento", deadline:"2026-07-10", owner:"Admin",      progress:55  },
  { id:"proj_007", clientId:"cl_003", name:"E-commerce B2B",        client:"Moda Verde",     status:"cancelado", deadline:null,         owner:"Rafael P.",  progress:30  },
]

const SEED_TASKS = [
  { id:"task_001", text:"Ligar para Grupo Alpha sobre renovação",     priority:"alta",  done:false, clientId:"cl_004", client:"Grupo Alpha"    },
  { id:"task_002", text:"Enviar proposta atualizada — Tech Solutions", priority:"alta",  done:false, clientId:"cl_002", client:"Tech Solutions" },
  { id:"task_003", text:"Preparar demo para Beatriz Costa",           priority:"media", done:false, clientId:"cl_003", client:"Moda Verde"     },
  { id:"task_004", text:"Follow-up com Inovação Lab sobre pagamento", priority:"alta",  done:false, clientId:"cl_005", client:"Inovação Lab"   },
  { id:"task_005", text:"Atualizar pipeline Q2",                      priority:"baixa", done:true,  clientId:null,     client:"Interno"        },
  { id:"task_006", text:"Reunião de alinhamento com equipe",          priority:"media", done:true,  clientId:null,     client:"Interno"        },
  { id:"task_007", text:"Configurar webhook de notificações",         priority:"baixa", done:true,  clientId:null,     client:"Interno"        },
]

// ═══════════════════════════════════════════════════════════════════
// 3. PERSISTÊNCIA — localStorage com schema versionado
// ═══════════════════════════════════════════════════════════════════
const STORAGE_KEYS = {
  clients:  "dcl_v2_clients",
  deals:    "dcl_v2_deals",
  projects: "dcl_v2_projects",
  tasks:    "dcl_v2_tasks",
}

function loadOrSeed(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : seed
  } catch { return seed }
}
function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

// ═══════════════════════════════════════════════════════════════════
// 4. HELPERS
// ═══════════════════════════════════════════════════════════════════
function uid() { return crypto.randomUUID() }

/** Remove acentos e normaliza para busca */
function normalize(str = "") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(Number(value) || 0)
}
function formatDate(iso) {
  if (!iso) return "—"
  const [y,m,d] = iso.split("-")
  return `${d}/${m}/${y}`
}
function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
}

const AVATAR_PALETTE = [
  { bg:"rgba(79,110,247,.15)",  fg:"#4f6ef7" },
  { bg:"rgba(167,139,250,.15)", fg:"#a78bfa" },
  { bg:"rgba(34,201,125,.15)",  fg:"#22c97d" },
  { bg:"rgba(245,158,11,.15)",  fg:"#f59e0b" },
  { bg:"rgba(236,72,153,.15)",  fg:"#ec4899" },
]
function avatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[idx]
}

// ═══════════════════════════════════════════════════════════════════
// 5. NAV & PAGE META
// ═══════════════════════════════════════════════════════════════════
const NAV_SECTIONS = [
  { label:"Principal", items:[
    { id:"dashboard",     label:"Dashboard",    icon:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    { id:"pipeline",      label:"Pipeline CRM", icon:"M4 6h16M4 12h16M4 18h16", badgeKey:"deals"    },
    { id:"clients",       label:"Clientes",     icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", badgeKey:"clients" },
    { id:"projects",      label:"Projetos",     icon:"M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z",          badgeKey:"projects" },
    { id:"tasks",         label:"Tarefas",      icon:"M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",   badgeKey:"pendingTasks" },
  ]},
  { label:"Financeiro", items:[
    { id:"finance",  label:"Financeiro",  icon:"M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" },
    { id:"reports",  label:"Relatórios",  icon:"M18 20V10M12 20V4M6 20v-6" },
  ]},
  { label:"Sistema", items:[
    { id:"notifications", label:"Notificações",  icon:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
    { id:"settings",      label:"Configurações", icon:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
  ]},
]
const PAGE_META = {
  dashboard:     { title:"Dashboard",       sub:"Visão geral do sistema"   },
  pipeline:      { title:"Pipeline CRM",    sub:"Kanban de oportunidades"  },
  clients:       { title:"Clientes",        sub:"Base de contatos e contas"},
  projects:      { title:"Projetos",        sub:"Gestão de projetos ativos"},
  tasks:         { title:"Tarefas",         sub:"Gerenciamento de atividades"},
  finance:       { title:"Financeiro",      sub:"Receitas e pagamentos"    },
  reports:       { title:"Relatórios",      sub:"Análises e métricas"      },
  notifications: { title:"Notificações",    sub:"Central de alertas"       },
  settings:      { title:"Configurações",   sub:"Preferências do sistema"  },
}

// ═══════════════════════════════════════════════════════════════════
// 6. UI PRIMITIVES (Badge, Icon, StatCard, Card, SectionLabel)
// ═══════════════════════════════════════════════════════════════════
const BADGE_COLOR = {
  green:  { bg:"rgba(34,201,125,.12)",  color:"#22c97d" },
  amber:  { bg:"rgba(245,158,11,.12)",  color:"#f59e0b" },
  red:    { bg:"rgba(239,68,68,.12)",   color:"#ef4444" },
  blue:   { bg:"rgba(79,110,247,.12)",  color:"#4f6ef7" },
  purple: { bg:"rgba(167,139,250,.12)", color:"#a78bfa" },
  gray:   { bg:"rgba(90,100,120,.15)",  color:"#8892a4" },
}

function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 7px",
      borderRadius:5, fontSize:9, fontWeight:700, fontFamily:"monospace",
      textTransform:"uppercase", letterSpacing:".3px", background:s.bg, color:s.color }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:s.color, display:"inline-block" }} />
      {label}
    </span>
  )
}

function Icon({ d, size=16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  )
}

function StatCard({ label, value, delta, deltaType="up", iconPath, iconColor }) {
  const ic = BADGE_COLOR[iconColor]?.color ?? "#4f6ef7"
  return (
    <div style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:16 }}>
      {iconPath && (
        <div style={{ float:"right", width:32, height:32, borderRadius:8,
          background:ic+"20", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon d={iconPath} size={15}/>
        </div>
      )}
      <div style={{ fontSize:10, color:"#5a6478", textTransform:"uppercase",
        letterSpacing:".8px", fontFamily:"monospace", marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:500, color:"#e8eaf0", letterSpacing:-1 }}>{value}</div>
      {delta && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:3, marginTop:8,
          fontSize:10, fontFamily:"monospace", padding:"2px 6px", borderRadius:4,
          background: deltaType==="up" ? "rgba(34,201,125,.1)" : "rgba(239,68,68,.1)",
          color:      deltaType==="up" ? "#22c97d"              : "#ef4444" }}>
          {deltaType==="up" ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  )
}

function Card({ title, sub, children, style={} }) {
  return (
    <div style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:16, ...style }}>
      {title && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#e8eaf0" }}>{title}</div>
          {sub && <div style={{ fontSize:10, color:"#5a6478", marginTop:2 }}>{sub}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:10, fontWeight:600, color:"#5a6478", textTransform:"uppercase",
      letterSpacing:".8px", fontFamily:"monospace", marginBottom:10 }}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 7. VIEWS
// ═══════════════════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────────────────────
function DashboardView({ clients, deals }) {
  // Cálculos dinâmicos reais — sem hardcode
  const activeClients  = clients.filter(c => c.projectStatus === "andamento").length
  const totalRevenue   = clients.reduce((s,c) => s + (c.paymentStatus === "pago" ? c.projectValue : 0), 0)
  const openDeals      = deals.filter(d => d.stage !== "fechado").length
  const wonDeals       = deals.filter(d => d.stage === "fechado")
  const convRate       = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0

  // Pipeline por stage para mini-chart
  const stageCounts = PIPELINE_STAGE_KEYS.map(k => ({
    n: PIPELINE_STAGE[k].label,
    c: deals.filter(d => d.stage === k).length,
    color: PIPELINE_STAGE[k].color,
  }))
  const maxStageCount = Math.max(...stageCounts.map(s => s.c), 1)

  // Revenue bars (últimos 6 meses calculados de deals fechados)
  const REVENUE_DATA = [
    { month:"Dez", value:28 },{ month:"Jan", value:34 },
    { month:"Fev", value:31 },{ month:"Mar", value:42 },
    { month:"Abr", value:38 },
    { month:"Mai", value: wonDeals.reduce((s,d) => s + d.value, 0) / 1000 || 47 },
  ]
  const maxR = Math.max(...REVENUE_DATA.map(r => r.value))

  const recent = [...clients].sort((a,b) => (b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,5)

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <StatCard label="Clientes em andamento" value={activeClients}
          delta={`de ${clients.length} total`}
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" iconColor="blue"/>
        <StatCard label="Receita recebida" value={formatCurrency(totalRevenue)}
          delta="pagamentos confirmados"
          iconPath="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" iconColor="green"/>
        <StatCard label="Deals em aberto" value={openDeals}
          delta={`${wonDeals.length} fechados`}
          iconPath="M4 6h16M4 12h16M4 18h16" iconColor="amber"/>
        <StatCard label="Taxa de conversão" value={`${convRate}%`}
          delta="deals ganhos / total"
          iconPath="M18 20V10M12 20V4M6 20v-6" iconColor="purple"/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        <Card title="Receita (últimos 6 meses)">
          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:80 }}>
            {REVENUE_DATA.map((r,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:"100%", borderRadius:"4px 4px 0 0",
                  height:`${(r.value/maxR)*100}%`,
                  background: i===REVENUE_DATA.length-1 ? "#4f6ef7" : "#1c2236" }}/>
                <div style={{ fontSize:8, color:"#5a6478", fontFamily:"monospace", marginTop:4 }}>{r.month}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Pipeline por etapa" sub="Deals ativos">
          {stageCounts.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ fontSize:10, color:"#8892a4", width:76, fontFamily:"monospace", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.n}</div>
              <div style={{ flex:1, background:"#1c2236", borderRadius:4, height:8, overflow:"hidden" }}>
                <div style={{ background:s.color, height:"100%", width:`${(s.c/maxStageCount)*100}%`, borderRadius:4, transition:"width .4s" }}/>
              </div>
              <div style={{ fontSize:10, color:"#5a6478", fontFamily:"monospace", width:14, textAlign:"right" }}>{s.c}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card title="Clientes recentes">
          {recent.length === 0
            ? <div style={{ textAlign:"center", color:"#5a6478", padding:"24px 0", fontSize:12 }}>Nenhum cliente ainda</div>
            : recent.map((c,i) => {
              const pal = avatarColor(c.name)
              const ps  = PAYMENT_STATUS[c.paymentStatus] ?? PAYMENT_STATUS.pendente
              return (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0",
                  borderBottom: i<recent.length-1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:pal.bg, color:pal.fg,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, flexShrink:0 }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"#e8eaf0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                    <div style={{ fontSize:10, color:"#5a6478" }}>{c.company || c.email}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#22c97d", fontFamily:"monospace" }}>{formatCurrency(c.projectValue)}</div>
                    <Badge colorKey={ps.badge} label={ps.label}/>
                  </div>
                </div>
              )
            })
          }
        </Card>
        <Card title="Top deals por valor">
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              {["Deal","Etapa","Valor"].map(h => (
                <th key={h} style={{ textAlign:h==="Valor"?"right":"left", padding:"6px 0",
                  fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase",
                  letterSpacing:".5px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[...deals].sort((a,b) => b.value - a.value).slice(0,5).map(d => {
                const st = PIPELINE_STAGE[d.stage] ?? PIPELINE_STAGE.lead
                return (
                  <tr key={d.id} style={{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
                    <td style={{ padding:"7px 0", fontSize:12, color:"#e8eaf0", fontWeight:500 }}>{d.name}</td>
                    <td style={{ padding:"7px 0" }}>
                      <span style={{ fontSize:9, fontFamily:"monospace", color:st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding:"7px 0", fontSize:12, color:"#22c97d", fontFamily:"monospace", textAlign:"right" }}>
                      {formatCurrency(d.value)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

// ── Pipeline ───────────────────────────────────────────────────────
function PipelineView({ deals, setDeals, addToast }) {
  const [draggingId, setDraggingId] = useState(null)
  const [overStage, setOverStage]   = useState(null)

  const totalValue    = deals.reduce((s,d) => s + d.value, 0)
  const openDeals     = deals.filter(d => d.stage !== "fechado")
  const avgTicket     = openDeals.length > 0
    ? openDeals.reduce((s,d) => s + d.value, 0) / openDeals.length : 0

  function onDragStart(id) { setDraggingId(id) }
  function onDragOver(e, stageKey) {
    e.preventDefault()
    setOverStage(stageKey)
  }
  function onDrop(targetStage) {
    setOverStage(null)
    if (!draggingId) return
    const deal = deals.find(d => d.id === draggingId)
    if (!deal || deal.stage === targetStage) { setDraggingId(null); return }

    // Validação de transição
    const allowed = ALLOWED_TRANSITIONS[deal.stage] ?? []
    if (!allowed.includes(targetStage)) {
      addToast(`Transição "${PIPELINE_STAGE[deal.stage].label}" → "${PIPELINE_STAGE[targetStage].label}" não permitida.`, "error")
      setDraggingId(null)
      return
    }

    const updated = deals.map(d =>
      d.id === draggingId
        ? { ...d, stage: targetStage, closedAt: targetStage === "fechado" ? new Date().toISOString().split("T")[0] : null }
        : d
    )
    setDeals(updated)
    persist(STORAGE_KEYS.deals, updated)
    addToast(`Deal movido para "${PIPELINE_STAGE[targetStage].label}"`, "success")
    setDraggingId(null)
  }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:20 }}>
        {PIPELINE_STAGE_KEYS.map(stageKey => {
          const stage      = PIPELINE_STAGE[stageKey]
          const stageDeals = deals.filter(d => d.stage === stageKey)
          const isOver     = overStage === stageKey
          return (
            <div key={stageKey}
              onDragOver={e => onDragOver(e, stageKey)}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => onDrop(stageKey)}
              style={{ background: isOver ? stage.color+"14" : "#111520",
                border: `1px solid ${isOver ? stage.color+"60" : "rgba(255,255,255,.06)"}`,
                borderRadius:10, padding:10, minHeight:120, transition:"all .15s" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase",
                  letterSpacing:".5px", fontFamily:"monospace", color:stage.color }}>{stage.label}</div>
                <div style={{ fontSize:9, padding:"1px 5px", borderRadius:4,
                  background:stage.color+"18", color:stage.color, fontFamily:"monospace" }}>
                  {stageDeals.length}
                </div>
              </div>
              <AnimatePresence>
                {stageDeals.map(d => (
                  <motion.div key={d.id} layout
                    initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:.95 }}
                    draggable onDragStart={() => onDragStart(d.id)}
                    style={{ background:"#161b2a", border:"1px solid rgba(255,255,255,.06)",
                      borderRadius:8, padding:8, marginBottom:6, cursor:"grab",
                      opacity: draggingId === d.id ? .45 : 1 }}>
                    <div style={{ fontSize:11, fontWeight:500, color:"#e8eaf0", marginBottom:3,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:10, color:"#5a6478", marginBottom:6 }}>{d.company}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:"#22c97d", fontFamily:"monospace" }}>
                      {formatCurrency(d.value)}
                    </div>
                    <div style={{ fontSize:8, color:"#5a6478", fontFamily:"monospace", marginTop:4, textAlign:"right" }}>
                      {formatDate(d.createdAt)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        <StatCard label="Valor total pipeline" value={formatCurrency(totalValue)}/>
        <StatCard label="Ticket médio"         value={formatCurrency(avgTicket)}/>
        <StatCard label="Deals em aberto"      value={openDeals.length}/>
      </div>
    </div>
  )
}

// ── Clients ────────────────────────────────────────────────────────
function ClientsView({ clients, setClients, addToast }) {
  const [query,         setQuery]         = useState("")
  const [filterPayment, setFilterPayment] = useState("all")
  const [filterProject, setFilterProject] = useState("all")
  const [sortBy,        setSortBy]        = useState("createdAt_desc")
  const [showForm,      setShowForm]      = useState(false)
  const [editingId,     setEditingId]     = useState(null)
  const [confirmId,     setConfirmId]     = useState(null)
  const [form,          setForm]          = useState({})
  const [formErrors,    setFormErrors]    = useState({})
  const [saving,        setSaving]        = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query)
    let result = clients.filter(c => {
      // Busca com normalização de acentos
      if (q) {
        const haystack = normalize(`${c.name} ${c.email} ${c.company||""}`)
        if (!haystack.includes(q)) return false
      }
      // Filtro seguro com fallback "pendente"
      const ps  = c.paymentStatus || "pendente"
      const prs = c.projectStatus || "andamento"
      if (filterPayment !== "all" && ps  !== filterPayment) return false
      if (filterProject !== "all" && prs !== filterProject) return false
      return true
    })

    // Sort
    const [field, dir] = sortBy.split("_")
    result.sort((a, b) => {
      let va = a[field] ?? "", vb = b[field] ?? ""
      if (field === "projectValue") { va = Number(va); vb = Number(vb) }
      else { va = normalize(String(va)); vb = normalize(String(vb)) }
      if (va < vb) return dir === "asc" ? -1 : 1
      if (va > vb) return dir === "asc" ?  1 : -1
      return 0
    })
    return result
  }, [clients, query, filterPayment, filterProject, sortBy])

  const hasFilters = query || filterPayment !== "all" || filterProject !== "all"

  // Stats da view de clientes
  const totalValue   = clients.reduce((s,c) => s + c.projectValue, 0)
  const paidValue    = clients.filter(c => c.paymentStatus==="pago").reduce((s,c) => s + c.projectValue, 0)
  const pendingValue = clients.filter(c => c.paymentStatus!=="pago").reduce((s,c) => s + c.projectValue, 0)

  function openCreate() {
    setForm({ paymentStatus:"pendente", projectStatus:"andamento" })
    setFormErrors({})
    setEditingId(null)
    setShowForm(true)
  }
  function openEdit(c) {
    setForm({ ...c })
    setFormErrors({})
    setEditingId(c.id)
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditingId(null) }

  function validateForm(f) {
    const e = {}
    if (!f.name?.trim())   e.name  = "Nome obrigatório"
    if (!f.email?.trim())  e.email = "Email obrigatório"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Email inválido"
    if (!f.phone?.trim())  e.phone = "Telefone obrigatório"
    if (!f.projectValue || Number(f.projectValue) <= 0) e.projectValue = "Valor deve ser > 0"
    if (!f.paymentStatus) e.paymentStatus = "Selecione"
    if (!f.projectStatus) e.projectStatus = "Selecione"
    if (!f.startDate)     e.startDate = "Data obrigatória"
    if (!f.endDate)       e.endDate   = "Data obrigatória"
    if (f.startDate && f.endDate && f.endDate < f.startDate) e.endDate = "Deve ser após o início"
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validateForm(form)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 350))
    if (editingId) {
      const updated = clients.map(c => c.id === editingId ? { ...c, ...form, projectValue: Number(form.projectValue) } : c)
      setClients(updated)
      persist(STORAGE_KEYS.clients, updated)
      addToast("Cliente atualizado!", "success")
    } else {
      const newClient = { ...form, id: uid(), projectValue: Number(form.projectValue), createdAt: new Date().toISOString() }
      const updated = [newClient, ...clients]
      setClients(updated)
      persist(STORAGE_KEYS.clients, updated)
      addToast("Cliente adicionado!", "success")
    }
    setSaving(false)
    closeForm()
  }

  function handleDelete(id) {
    const updated = clients.filter(c => c.id !== id)
    setClients(updated)
    persist(STORAGE_KEYS.clients, updated)
    addToast("Cliente removido.", "warning")
    setConfirmId(null)
  }

  function setF(k, v) { setForm(p => ({...p,[k]:v})); setFormErrors(p => ({...p,[k]:""})) }

  const inputStyle = {
    background:"#161b2a", border:"1px solid rgba(255,255,255,.15)", borderRadius:7,
    padding:"7px 10px", fontSize:12, color:"#e8eaf0", fontFamily:"inherit", outline:"none", width:"100%",
  }
  const chipStyle = active => ({
    padding:"4px 10px", borderRadius:20, fontSize:11, cursor:"pointer", border:"1px solid",
    fontFamily:"inherit", transition:"all .13s",
    borderColor: active ? "#4f6ef7" : "rgba(255,255,255,.1)",
    background:  active ? "#4f6ef7" : "transparent",
    color:       active ? "#fff"    : "#8892a4",
  })

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        {[
          { l:"Total faturado", v:formatCurrency(totalValue),   c:"#e8eaf0" },
          { l:"Recebido",       v:formatCurrency(paidValue),    c:"#22c97d" },
          { l:"Pendente",       v:formatCurrency(pendingValue), c:"#f59e0b" },
        ].map(s => (
          <div key={s.l} style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)",
            borderRadius:10, padding:"10px 16px", flex:1, minWidth:130 }}>
            <div style={{ fontSize:9, color:"#5a6478", textTransform:"uppercase", letterSpacing:".6px", fontFamily:"monospace", marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:17, fontWeight:700, color:s.c, fontFamily:"monospace", letterSpacing:"-.3px" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#161b2a",
          border:"1px solid rgba(255,255,255,.08)", borderRadius:7, padding:"6px 10px", flex:1, minWidth:200 }}>
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13}/>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, email, empresa…"
            style={{ background:"none", border:"none", outline:"none", fontSize:12,
              color:"#e8eaf0", fontFamily:"inherit", width:"100%" }}/>
          {query && <button onClick={() => setQuery("")}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#5a6478", fontSize:16, lineHeight:1 }}>×</button>}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ ...inputStyle, width:"auto", padding:"7px 28px 7px 10px", cursor:"pointer",
            backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238892a4' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", appearance:"none" }}>
          <option value="createdAt_desc">Mais recentes</option>
          <option value="createdAt_asc">Mais antigos</option>
          <option value="name_asc">Nome A–Z</option>
          <option value="name_desc">Nome Z–A</option>
          <option value="projectValue_desc">Maior valor</option>
          <option value="projectValue_asc">Menor valor</option>
          <option value="endDate_asc">Entrega próxima</option>
        </select>
        <button onClick={openCreate}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7,
            background:"#4f6ef7", border:"none", color:"#fff", fontSize:12, fontWeight:500,
            cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
          + Novo cliente
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:10, color:"#5a6478", fontFamily:"monospace" }}>PAGAMENTO:</span>
        {[["all","Todos"],["pendente","Pendente"],["pago","Pago"],["atrasado","Atrasado"]].map(([v,l]) => (
          <button key={v} style={chipStyle(filterPayment===v)} onClick={() => setFilterPayment(v)}>{l}</button>
        ))}
        <span style={{ fontSize:10, color:"#5a6478", fontFamily:"monospace", marginLeft:8 }}>PROJETO:</span>
        {[["all","Todos"],["andamento","Em andamento"],["concluido","Concluído"],["cancelado","Cancelado"]].map(([v,l]) => (
          <button key={v} style={chipStyle(filterProject===v)} onClick={() => setFilterProject(v)}>{l}</button>
        ))}
        {hasFilters && (
          <button onClick={() => { setQuery(""); setFilterPayment("all"); setFilterProject("all") }}
            style={{ ...chipStyle(false), borderColor:"rgba(239,68,68,.3)", color:"#ef4444", marginLeft:8 }}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:1000,
            display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
            onClick={closeForm}>
            <motion.div initial={{ scale:.93, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:.93, opacity:0 }} transition={{ duration:.18 }}
              onClick={e => e.stopPropagation()}
              style={{ background:"#111520", border:"1px solid rgba(255,255,255,.1)", borderRadius:16,
                width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto",
                boxShadow:"0 20px 60px rgba(0,0,0,.5)" }}>
              <div style={{ padding:"20px 24px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:16, fontWeight:600, color:"#e8eaf0" }}>
                  {editingId ? "✏️ Editar cliente" : "➕ Novo cliente"}
                </div>
                <button onClick={closeForm} style={{ background:"none", border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:7, color:"#8892a4", cursor:"pointer", width:30, height:30,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
              </div>
              <form onSubmit={handleSave} noValidate style={{ padding:"20px 24px 24px" }}>
                {/* Contato */}
                <div style={{ fontSize:9, color:"#5a6478", textTransform:"uppercase", letterSpacing:".7px",
                  fontFamily:"monospace", marginBottom:10, paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  Dados do contato
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                  {[
                    { k:"name",    l:"Nome *",     t:"text",  ph:"Ana Souza"       },
                    { k:"email",   l:"Email *",    t:"email", ph:"ana@empresa.com" },
                    { k:"phone",   l:"Telefone *", t:"text",  ph:"(11) 99999-0000" },
                    { k:"company", l:"Empresa",    t:"text",  ph:"Empresa Ltda"    },
                  ].map(({ k,l,t,ph }) => (
                    <div key={k}>
                      <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>{l}</div>
                      <input type={t} value={form[k]||""} onChange={e => setF(k, e.target.value)}
                        placeholder={ph} style={{ ...inputStyle, borderColor: formErrors[k] ? "#ef4444" : "rgba(255,255,255,.15)" }}/>
                      {formErrors[k] && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors[k]}</div>}
                    </div>
                  ))}
                </div>
                {/* Projeto */}
                <div style={{ fontSize:9, color:"#5a6478", textTransform:"uppercase", letterSpacing:".7px",
                  fontFamily:"monospace", marginBottom:10, paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  Dados do projeto
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Valor (R$) *</div>
                    <input type="number" min="0" step="0.01" value={form.projectValue||""}
                      onChange={e => setF("projectValue", e.target.value)} placeholder="0,00"
                      style={{ ...inputStyle, borderColor: formErrors.projectValue ? "#ef4444" : "rgba(255,255,255,.15)" }}/>
                    {formErrors.projectValue && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors.projectValue}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Status pagamento *</div>
                    <select value={form.paymentStatus||""} onChange={e => setF("paymentStatus", e.target.value)}
                      style={{ ...inputStyle, borderColor: formErrors.paymentStatus ? "#ef4444" : "rgba(255,255,255,.15)",
                        cursor:"pointer", appearance:"none" }}>
                      <option value="">Selecione…</option>
                      {Object.entries(PAYMENT_STATUS).map(([v,s]) => <option key={v} value={v}>{s.label}</option>)}
                    </select>
                    {formErrors.paymentStatus && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors.paymentStatus}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Data início *</div>
                    <input type="date" value={form.startDate||""} onChange={e => setF("startDate", e.target.value)}
                      style={{ ...inputStyle, borderColor: formErrors.startDate ? "#ef4444" : "rgba(255,255,255,.15)", colorScheme:"dark" }}/>
                    {formErrors.startDate && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors.startDate}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Data entrega *</div>
                    <input type="date" value={form.endDate||""} onChange={e => setF("endDate", e.target.value)}
                      style={{ ...inputStyle, borderColor: formErrors.endDate ? "#ef4444" : "rgba(255,255,255,.15)", colorScheme:"dark" }}/>
                    {formErrors.endDate && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors.endDate}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Status projeto *</div>
                    <select value={form.projectStatus||""} onChange={e => setF("projectStatus", e.target.value)}
                      style={{ ...inputStyle, borderColor: formErrors.projectStatus ? "#ef4444" : "rgba(255,255,255,.15)",
                        cursor:"pointer", appearance:"none" }}>
                      <option value="">Selecione…</option>
                      {Object.entries(PROJECT_STATUS).map(([v,s]) => <option key={v} value={v}>{s.label}</option>)}
                    </select>
                    {formErrors.projectStatus && <div style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>{formErrors.projectStatus}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".5px", marginBottom:5 }}>Observações</div>
                    <input type="text" value={form.notes||""} onChange={e => setF("notes", e.target.value)}
                      placeholder="Detalhes…" style={inputStyle}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"flex-end",
                  paddingTop:16, borderTop:"1px solid rgba(255,255,255,.06)" }}>
                  <button type="button" onClick={closeForm} disabled={saving}
                    style={{ padding:"7px 16px", borderRadius:7, background:"rgba(255,255,255,.04)",
                      border:"1px solid rgba(255,255,255,.1)", color:"#8892a4", fontSize:12,
                      cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                  <button type="submit" disabled={saving}
                    style={{ padding:"7px 16px", borderRadius:7, background:"#4f6ef7",
                      border:"none", color:"#fff", fontSize:12, fontWeight:500,
                      cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                    {saving ? "Salvando…" : editingId ? "Salvar alterações" : "Adicionar cliente"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmId && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:1000,
            display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}
            onClick={() => setConfirmId(null)}>
            <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:.9, opacity:0 }} transition={{ duration:.16 }}
              onClick={e => e.stopPropagation()}
              style={{ background:"#111520", border:"1px solid rgba(255,255,255,.1)", borderRadius:14,
                padding:28, maxWidth:360, width:"100%", textAlign:"center",
                boxShadow:"0 20px 60px rgba(0,0,0,.5)" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🗑</div>
              <div style={{ fontSize:16, fontWeight:600, color:"#e8eaf0", marginBottom:8 }}>Deletar cliente?</div>
              <div style={{ fontSize:12, color:"#8892a4", marginBottom:24, lineHeight:1.6 }}>
                Esta ação não pode ser desfeita.<br/>O cliente será removido permanentemente.
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={() => setConfirmId(null)}
                  style={{ padding:"8px 20px", borderRadius:8, background:"rgba(255,255,255,.04)",
                    border:"1px solid rgba(255,255,255,.1)", color:"#8892a4", fontSize:12,
                    cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                <button onClick={() => handleDelete(confirmId)}
                  style={{ padding:"8px 20px", borderRadius:8, background:"rgba(239,68,68,.15)",
                    border:"1px solid rgba(239,68,68,.3)", color:"#ef4444", fontSize:12,
                    fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Deletar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Nome","Empresa","Email","Pagamento","Projeto","Valor","Entrega",""].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:".8px", color:"#5a6478", fontFamily:"monospace",
                  borderBottom:"1px solid rgba(255,255,255,.05)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} style={{ padding:"48px 0", textAlign:"center", color:"#5a6478", fontSize:13 }}>
                  {hasFilters ? "Nenhum resultado para os filtros aplicados" : "Nenhum cliente ainda"}
                </td></tr>
              : filtered.map((c, i) => {
                const pal = avatarColor(c.name)
                const ps  = PAYMENT_STATUS[c.paymentStatus ?? "pendente"]
                const prs = PROJECT_STATUS[c.projectStatus ?? "andamento"]
                return (
                  <tr key={c.id}
                    style={{ borderBottom:"1px solid rgba(255,255,255,.03)", transition:"background .12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:7, background:pal.bg, color:pal.fg,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:9, fontWeight:700, flexShrink:0 }}>{initials(c.name)}</div>
                        <span style={{ fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"11px 14px", fontSize:12, color:"#8892a4" }}>{c.company||"—"}</td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:"#5a6478", fontFamily:"monospace" }}>{c.email}</td>
                    <td style={{ padding:"11px 14px" }}><Badge colorKey={ps.badge} label={ps.label}/></td>
                    <td style={{ padding:"11px 14px" }}><Badge colorKey={prs.badge} label={prs.label}/></td>
                    <td style={{ padding:"11px 14px", fontSize:12, color:"#22c97d", fontFamily:"monospace", fontWeight:600 }}>
                      {formatCurrency(c.projectValue)}
                    </td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:"#5a6478", fontFamily:"monospace" }}>
                      {formatDate(c.endDate)}
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(c)} title="Editar"
                          style={{ width:28, height:28, borderRadius:6, background:"rgba(79,110,247,.1)",
                            border:"1px solid rgba(79,110,247,.2)", color:"#4f6ef7", cursor:"pointer",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={12}/>
                        </button>
                        <button onClick={() => setConfirmId(c.id)} title="Deletar"
                          style={{ width:28, height:28, borderRadius:6, background:"rgba(239,68,68,.1)",
                            border:"1px solid rgba(239,68,68,.2)", color:"#ef4444", cursor:"pointer",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Projects ───────────────────────────────────────────────────────
function ProjectsView({ projects }) {
  return (
    <div style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          {["Projeto","Cliente","Status","Prazo","Responsável","Progresso"].map(h => (
            <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:9, fontWeight:600,
              textTransform:"uppercase", letterSpacing:".8px", color:"#5a6478", fontFamily:"monospace",
              borderBottom:"1px solid rgba(255,255,255,.05)" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {projects.map(p => {
            const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.andamento
            return (
              <tr key={p.id} style={{ borderBottom:"1px solid rgba(255,255,255,.03)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#161b2a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding:"11px 16px", fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{p.name}</td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#8892a4" }}>{p.client}</td>
                <td style={{ padding:"11px 16px" }}><Badge colorKey={st.badge} label={st.label}/></td>
                <td style={{ padding:"11px 16px", fontSize:11, color:"#5a6478", fontFamily:"monospace" }}>
                  {formatDate(p.deadline)}
                </td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#8892a4" }}>{p.owner}</td>
                <td style={{ padding:"11px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:80, background:"#1c2236", borderRadius:4, height:5, overflow:"hidden" }}>
                      <div style={{ background: p.progress===100 ? "#22c97d" : "#4f6ef7",
                        height:"100%", width:`${p.progress}%`, borderRadius:4 }}/>
                    </div>
                    <span style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace" }}>{p.progress}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Tasks ──────────────────────────────────────────────────────────
function TasksView({ tasks, setTasks, addToast }) {
  // Separar pending/done sem loops duplicados
  const pending = useMemo(() => tasks.filter(t => !t.done), [tasks])
  const done    = useMemo(() => tasks.filter(t =>  t.done), [tasks])

  function toggle(id) {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    persist(STORAGE_KEYS.tasks, updated)
    const task = tasks.find(t => t.id === id)
    if (task) addToast(task.done ? "Tarefa reaberta." : "Tarefa concluída! ✓", "success")
  }

  const PRIORITY_BADGE = { alta:"red", media:"amber", baixa:"gray" }
  const PRIORITY_LABEL = { alta:"Alta", media:"Média", baixa:"Baixa" }

  function TaskItem({ task }) {
    return (
      <div onClick={() => toggle(task.id)}
        style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
          borderRadius:8, border:"1px solid rgba(255,255,255,.06)", marginBottom:6,
          background:"#111520", cursor:"pointer", transition:"border-color .12s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"}>
        <div style={{ width:16, height:16, borderRadius:4, flexShrink:0,
          border: task.done ? "none" : "1.5px solid rgba(255,255,255,.2)",
          background: task.done ? "#22c97d" : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
          {task.done && <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>✓</span>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, color: task.done ? "#5a6478" : "#8892a4",
            textDecoration: task.done ? "line-through" : "none" }}>{task.text}</div>
          <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", marginTop:3 }}>{task.client}</div>
        </div>
        <Badge colorKey={PRIORITY_BADGE[task.priority] ?? "gray"} label={PRIORITY_LABEL[task.priority] ?? task.priority}/>
      </div>
    )
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <div>
        <SectionLabel>Pendentes ({pending.length})</SectionLabel>
        {pending.length === 0
          ? <div style={{ textAlign:"center", color:"#5a6478", padding:"24px 0", fontSize:12 }}>Nenhuma tarefa pendente 🎉</div>
          : pending.map(t => <TaskItem key={t.id} task={t}/>)
        }
      </div>
      <div>
        <SectionLabel>Concluídas ({done.length})</SectionLabel>
        {done.length === 0
          ? <div style={{ textAlign:"center", color:"#5a6478", padding:"24px 0", fontSize:12 }}>Nenhuma concluída ainda</div>
          : done.map(t => <TaskItem key={t.id} task={t}/>)
        }
      </div>
    </div>
  )
}

// ── Finance ────────────────────────────────────────────────────────
function FinanceView({ clients }) {
  const paidValue    = clients.filter(c => c.paymentStatus==="pago").reduce((s,c) => s + c.projectValue, 0)
  const pendingValue = clients.filter(c => c.paymentStatus==="pendente").reduce((s,c) => s + c.projectValue, 0)
  const overdueValue = clients.filter(c => c.paymentStatus==="atrasado").reduce((s,c) => s + c.projectValue, 0)
  const totalValue   = paidValue + pendingValue + overdueValue

  const recentPaid = [...clients]
    .filter(c => c.paymentStatus === "pago")
    .sort((a,b) => (b.endDate||"").localeCompare(a.endDate||""))
    .slice(0,5)

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        <StatCard label="Receita recebida"  value={formatCurrency(paidValue)}    delta={`${Math.round(paidValue/totalValue*100)||0}% do total`}  iconColor="green"/>
        <StatCard label="A receber"         value={formatCurrency(pendingValue)} delta={`${clients.filter(c=>c.paymentStatus==="pendente").length} pagamentos`} iconColor="amber"/>
        <StatCard label="Em atraso"         value={formatCurrency(overdueValue)} delta={`${clients.filter(c=>c.paymentStatus==="atrasado").length} clientes`}   deltaType="down" iconColor="red"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card title="Pagamentos confirmados">
          {recentPaid.length === 0
            ? <div style={{ textAlign:"center", color:"#5a6478", padding:"24px 0", fontSize:12 }}>Nenhum pagamento ainda</div>
            : recentPaid.map((c,i) => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 0", borderBottom: i<recentPaid.length-1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Badge colorKey="green" label="Pago"/>
                  <span style={{ fontSize:12, color:"#8892a4" }}>{c.name}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:600, fontFamily:"monospace", color:"#22c97d" }}>
                  +{formatCurrency(c.projectValue)}
                </span>
              </div>
            ))
          }
        </Card>
        <Card title="Resumo geral">
          {[
            { label:"Receita bruta",    value: formatCurrency(totalValue),   color:"#e8eaf0"           },
            { label:"Recebido",         value: formatCurrency(paidValue),    color:"#22c97d"           },
            { label:"Pendente",         value: formatCurrency(pendingValue), color:"#f59e0b"           },
            { label:"Em atraso",        value: formatCurrency(overdueValue), color:"#ef4444"           },
            { label:"Total de clientes",value: clients.length,               color:"#e8eaf0", bold:true },
          ].map((r,i) => (
            <div key={r.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 0", borderBottom: i<4 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
              <span style={{ fontSize: r.bold?13:11, color: r.bold?"#e8eaf0":"#8892a4", fontWeight: r.bold?600:400 }}>{r.label}</span>
              <span style={{ fontSize: r.bold?15:13, fontWeight: r.bold?700:600, fontFamily:"monospace", color:r.color }}>{r.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── Reports ────────────────────────────────────────────────────────
function ReportsView({ clients, deals }) {
  const wonDeals  = deals.filter(d => d.stage==="fechado")
  const convRate  = deals.length > 0 ? Math.round((wonDeals.length/deals.length)*100) : 0
  const totalRev  = clients.filter(c=>c.paymentStatus==="pago").reduce((s,c)=>s+c.projectValue,0)
  const avgTicket = wonDeals.length > 0 ? wonDeals.reduce((s,d)=>s+d.value,0)/wonDeals.length : 0

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <StatCard label="Total clientes"    value={clients.length}/>
        <StatCard label="Deals fechados"    value={wonDeals.length}/>
        <StatCard label="Taxa conversão"    value={`${convRate}%`}/>
        <StatCard label="Ticket médio"      value={formatCurrency(avgTicket)}/>
      </div>
      <Card title="Distribuição por status de pagamento">
        {Object.entries(PAYMENT_STATUS).map(([key, s]) => {
          const count = clients.filter(c=>(c.paymentStatus||"pendente")===key).length
          const pct   = clients.length > 0 ? Math.round((count/clients.length)*100) : 0
          return (
            <div key={key} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5, fontWeight:500 }}>
                <span style={{ color:"#8892a4" }}>{s.label}</span>
                <span style={{ color:"#5a6478", fontFamily:"monospace" }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height:6, background:"#1c2236", borderRadius:10, overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                  transition={{ duration:.6, ease:"easeOut" }}
                  style={{ height:"100%", background:BADGE_COLOR[s.badge]?.color??"#8892a4", borderRadius:10 }}/>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// ── Notifications / Settings mantidos do original ──────────────────
function NotificationsView() {
  const notifs = [
    { icon:"✓",  color:"#22c97d", unread:true,  title:"Deal fechado com sucesso",  desc:"Alpha S.A. — confirmado.",              time:"há 23 min" },
    { icon:"⏰", color:"#f59e0b", unread:true,  title:"Pagamento em atraso",       desc:"Moda Verde — fatura vencida.",           time:"há 2h"     },
    { icon:"+",  color:"#4f6ef7", unread:true,  title:"Novo lead adicionado",      desc:"Beatriz Costa via formulário web.",      time:"há 3h"     },
    { icon:"📅", color:"#a78bfa", unread:false, title:"Reunião às 15:00",          desc:"Demo com Tech Solutions Ltda.",          time:"hoje"      },
    { icon:"📊", color:"#4f6ef7", unread:false, title:"Relatório mensal gerado",   desc:"Relatório de maio disponível.",          time:"há 1 dia"  },
  ]
  return (
    <Card title="Central de notificações" style={{ padding:0 }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.05)",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:12, fontWeight:600, color:"#e8eaf0" }}>Central de notificações</div>
        <button style={{ fontSize:10, background:"none", border:"1px solid rgba(255,255,255,.08)",
          color:"#8892a4", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>
          Marcar todas como lidas
        </button>
      </div>
      {notifs.map((n,i) => (
        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px",
          borderBottom: i<notifs.length-1 ? "1px solid rgba(255,255,255,.04)" : "none",
          background: n.unread ? "rgba(79,110,247,.03)" : "transparent", cursor:"pointer" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:n.color+"18",
              color:n.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
              {n.icon}
            </div>
            {n.unread && <div style={{ position:"absolute", top:-2, right:-2, width:8, height:8,
              borderRadius:"50%", background:"#4f6ef7", border:"2px solid #111520" }}/>}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{n.title}</div>
            <div style={{ fontSize:11, color:"#5a6478", marginTop:2, lineHeight:1.4 }}>{n.desc}</div>
            <div style={{ fontSize:9, color:"#5a6478", fontFamily:"monospace", marginTop:4 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </Card>
  )
}

function SettingsView({ user, onLogout }) {
  const [toggles, setToggles] = useState({ emailNotif:true, dealAlerts:true, weeklyReport:false, twoFactor:false, webhook:true })
  function Toggle({ k }) {
    return (
      <div onClick={() => setToggles(p => ({...p,[k]:!p[k]}))}
        style={{ width:36, height:20, borderRadius:20, background:toggles[k]?"#4f6ef7":"#1c2236",
          border:`1px solid ${toggles[k]?"#4f6ef7":"rgba(255,255,255,.1)"}`,
          position:"relative", cursor:"pointer", transition:"all .2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:2, left:toggles[k]?16:2, width:14, height:14,
          borderRadius:"50%", background:toggles[k]?"#fff":"#5a6478", transition:"left .2s" }}/>
      </div>
    )
  }
  function Section({ icon, title, children }) {
    return (
      <div style={{ background:"#111520", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, overflow:"hidden", marginBottom:12 }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.05)",
          fontSize:11, fontWeight:600, color:"#e8eaf0", display:"flex", alignItems:"center", gap:8 }}>
          <span>{icon}</span> {title}
        </div>
        {children}
      </div>
    )
  }
  function Row({ label, desc, right }) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.03)" }}>
        <div>
          <div style={{ fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{label}</div>
          {desc && <div style={{ fontSize:10, color:"#5a6478", marginTop:2 }}>{desc}</div>}
        </div>
        {right}
      </div>
    )
  }
  return (
    <div>
      <Section icon="👤" title="Minha conta">
        <Row label="Email" desc="Conta atual" right={<span style={{ fontSize:11, color:"#5a6478", fontFamily:"monospace" }}>{user?.email}</span>}/>
        <Row label="Logout" desc="Encerrar sessão atual"
          right={<button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:6,
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)",
            color:"#ef4444", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Sair</button>}/>
      </Section>
      <Section icon="🏢" title="Empresa">
        <Row label="Nome"       right={<span style={{ fontSize:12, color:"#5a6478", fontFamily:"monospace" }}>Decillion</span>}/>
        <Row label="Plano"      right={<Badge colorKey="purple" label="Pro"/>}/>
        <Row label="Fuso horário" right={<span style={{ fontSize:11, color:"#5a6478", fontFamily:"monospace" }}>America/São_Paulo</span>}/>
      </Section>
      <Section icon="🔔" title="Notificações">
        <Row label="Por email"        desc="Resumo diário"        right={<Toggle k="emailNotif"/>}/>
        <Row label="Alertas de deals" desc="Ao fechar um deal"    right={<Toggle k="dealAlerts"/>}/>
        <Row label="Relatório semanal" desc="Toda segunda-feira"  right={<Toggle k="weeklyReport"/>}/>
      </Section>
      <Section icon="🔒" title="Segurança">
        <Row label="2FA" desc="Autenticação em dois fatores" right={<Toggle k="twoFactor"/>}/>
        <Row label="Webhook" desc="Receber eventos em tempo real" right={<Toggle k="webhook"/>}/>
      </Section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 8. PAGE TRANSITION
// ═══════════════════════════════════════════════════════════════════
const pageVariants = {
  initial: { opacity:0, y:8  },
  animate: { opacity:1, y:0,  transition:{ duration:.2  } },
  exit:    { opacity:0, y:-6, transition:{ duration:.14 } },
}

// ═══════════════════════════════════════════════════════════════════
// 9. APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const { user, loading:authLoading, error:authError, login, logout, setError } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Estado centralizado com persistência
  const [clients,  setClients]  = useState(() => loadOrSeed(STORAGE_KEYS.clients,  SEED_CLIENTS))
  const [deals,    setDeals]    = useState(() => loadOrSeed(STORAGE_KEYS.deals,    SEED_DEALS))
  const [projects, setProjects] = useState(() => loadOrSeed(STORAGE_KEYS.projects, SEED_PROJECTS))
  const [tasks,    setTasks]    = useState(() => loadOrSeed(STORAGE_KEYS.tasks,    SEED_TASKS))

  // Badges dinâmicos para nav
  const pendingTasks = tasks.filter(t => !t.done).length
  const badgeCounts  = {
    clients:      clients.length,
    deals:        deals.filter(d => d.stage !== "fechado").length,
    projects:     projects.filter(p => p.status === "andamento").length,
    pendingTasks,
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={login} loading={authLoading} error={authError} clearError={() => setError("")}/>
        <ToastContainer toasts={toasts} removeToast={removeToast}/>
      </>
    )
  }

  const meta = PAGE_META[activeTab] ?? { title:activeTab, sub:"" }

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0a0d14", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width:220, minWidth:220, background:"#111520",
        borderRight:"1px solid rgba(255,255,255,.06)", display:"flex",
        flexDirection:"column", padding:"20px 0", height:"100vh", overflowY:"auto" }}>

        <div style={{ padding:"0 20px 24px", borderBottom:"1px solid rgba(255,255,255,.06)", marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#e8eaf0", letterSpacing:"-.3px" }}>Decillion</div>
          <div style={{ fontSize:10, color:"#3a4255", marginTop:2, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".8px" }}>Manager v2.0</div>
        </div>

        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ padding:"0 12px", marginBottom:4 }}>
            <div style={{ fontSize:9, color:"#3a4255", textTransform:"uppercase", letterSpacing:1,
              fontWeight:600, padding:"8px 8px 6px", fontFamily:"monospace" }}>{section.label}</div>
            {section.items.map(({ id, label, icon, badgeKey }) => {
              const active     = activeTab === id
              const badgeCount = badgeKey ? badgeCounts[badgeKey] : undefined
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                    padding:"7px 10px", borderRadius:8, cursor:"pointer", fontSize:12.5,
                    fontWeight:400, border:"none", textAlign:"left", marginBottom:1, fontFamily:"inherit",
                    background: active ? "#4f6ef7" : "transparent",
                    color:      active ? "#fff"    : "#8892a4", transition:"all .15s" }}
                  onMouseEnter={e => { if(!active){ e.currentTarget.style.background="#161b2a"; e.currentTarget.style.color="#e8eaf0" }}}
                  onMouseLeave={e => { if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#8892a4" }}}>
                  <Icon d={icon} size={14}/>
                  <span style={{ flex:1 }}>{label}</span>
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <span style={{ background: active?"rgba(255,255,255,.2)":"#1c2236",
                      border:`1px solid ${active?"rgba(255,255,255,.25)":"rgba(255,255,255,.08)"}`,
                      borderRadius:20, padding:"1px 6px", fontSize:9, fontFamily:"monospace",
                      color: active?"rgba(255,255,255,.8)":"#5a6478" }}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        <div style={{ marginTop:"auto", padding:"16px 12px 0", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
            borderRadius:8, background:"#161b2a", border:"1px solid rgba(255,255,255,.06)", marginBottom:6 }}>
            <div style={{ width:28, height:28, borderRadius:8,
              background:"linear-gradient(135deg,#4f6ef7,#a78bfa)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:600, color:"#fff", flexShrink:0 }}>
              {initials(user.name ?? "Admin")}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:500, color:"#e8eaf0", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name ?? "Admin"}</div>
              <div style={{ fontSize:9, color:"#3a4255", fontFamily:"monospace",
                textTransform:"uppercase", letterSpacing:".5px", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={logout}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
              borderRadius:8, background:"transparent", border:"none", cursor:"pointer",
              color:"#5a6478", fontSize:12, fontFamily:"inherit", transition:"all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,.08)"; e.currentTarget.style.color="#ef4444" }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#5a6478" }}>
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={13}/>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
        <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(255,255,255,.06)",
          display:"flex", alignItems:"center", gap:12, background:"#111520", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"#e8eaf0" }}>{meta.title}</div>
            <div style={{ fontSize:11, color:"#5a6478", marginTop:1 }}>{meta.sub}</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ padding:"6px 12px", borderRadius:7, fontSize:12, cursor:"pointer",
              fontFamily:"inherit", border:"1px solid rgba(255,255,255,.08)", background:"#161b2a", color:"#8892a4" }}>
              Exportar
            </button>
            <button onClick={() => setActiveTab("clients")}
              style={{ padding:"6px 14px", borderRadius:7, fontSize:12, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit", border:"none", background:"#4f6ef7", color:"#fff" }}>
              + Novo cliente
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:24 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {activeTab==="dashboard"     && <DashboardView     clients={clients} deals={deals}/>}
              {activeTab==="pipeline"      && <PipelineView      deals={deals} setDeals={setDeals} addToast={addToast}/>}
              {activeTab==="clients"       && <ClientsView       clients={clients} setClients={setClients} addToast={addToast}/>}
              {activeTab==="projects"      && <ProjectsView      projects={projects}/>}
              {activeTab==="tasks"         && <TasksView         tasks={tasks} setTasks={setTasks} addToast={addToast}/>}
              {activeTab==="finance"       && <FinanceView       clients={clients}/>}
              {activeTab==="reports"       && <ReportsView       clients={clients} deals={deals}/>}
              {activeTab==="notifications" && <NotificationsView/>}
              {activeTab==="settings"      && <SettingsView      user={user} onLogout={logout}/>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast}/>
    </div>
  )
}