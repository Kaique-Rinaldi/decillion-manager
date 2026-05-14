import { useEffect, useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth }       from "./hooks/useAuth"
import { useToast }      from "./hooks/useToast"
import { useDataLoader } from "./hooks/useDataLoader"
import LoginPage         from "./components/shared/LoginPage"
import ToastContainer    from "./components/shared/Toast"
import FinancePage       from "./components/finance/FinancePage"
import KanbanPage        from "./components/pages/KanbanPage"
import TasksPage         from "./components/pages/TasksPage"

import { fetchClients, createClient, updateClient, deleteClient } from "./services/clientsService"
import { fetchDeals, createDeal, updateDeal, deleteDeal }          from "./services/dealsService"
import { updateTask }                                              from "./services/tasksService"
import { createNotification, fetchNotifications, markAllAsRead, markOneAsRead } from "./services/notificationService"

// ═══════════════════════════════════════════════════════════════════
// 1. ENUMS
// ═══════════════════════════════════════════════════════════════════
const PAYMENT_STATUS = {
  pendente: { label:"Pendente", badge:"amber" },
  pago:     { label:"Pago",     badge:"green" },
  atrasado: { label:"Atrasado", badge:"red"   },
}
const PROJECT_STATUS = {
  andamento: { label:"Em andamento", badge:"blue"  },
  concluido: { label:"Concluído",    badge:"green" },
  cancelado: { label:"Cancelado",    badge:"gray"  },
}
const PIPELINE_STAGE = {
  lead:     { label:"Lead",       color:"#60a5fa", order:0 },
  contato:  { label:"Contactado", color:"#a78bfa", order:1 },
  proposta: { label:"Proposta",   color:"#f59e0b", order:2 },
  negoc:    { label:"Negociação", color:"#ec4899", order:3 },
  fechado:  { label:"Fechado ✓",  color:"#22c97d", order:4 },
}
const PIPELINE_STAGE_KEYS  = ["lead","contato","proposta","negoc","fechado"]
const PROGRESS_BY_STATUS   = { andamento:45, concluido:100, cancelado:0 }
const ALLOWED_TRANSITIONS  = {
  lead:["contato"], contato:["lead","proposta"], proposta:["contato","negoc"],
  negoc:["proposta","fechado"], fechado:["negoc"],
}

// ═══════════════════════════════════════════════════════════════════
// 2. HELPERS
// ═══════════════════════════════════════════════════════════════════
function normalize(str="") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()
}
function buildHaystack(c) {
  return normalize([c.id,c.name,c.email,c.company,c.phone,c.projectName,c.projectOwner,
    c.projectStatus,c.paymentStatus,c.projectValue,c.notes,...(c.tags??[])].filter(Boolean).join(" "))
}
function useDebounce(value, delay=250) {
  const [d, setD] = useState(value)
  useEffect(() => { const t=setTimeout(()=>setD(value),delay); return ()=>clearTimeout(t) }, [value,delay])
  return d
}
function Highlight({ text="", term="" }) {
  if (!term) return <>{text}</>
  const idx = normalize(text).indexOf(normalize(term))
  if (idx===-1) return <>{text}</>
  return <>{text.slice(0,idx)}<mark style={{background:"rgba(79,110,247,.35)",color:"#e8eaf0",borderRadius:2,padding:"0 1px"}}>{text.slice(idx,idx+term.length)}</mark>{text.slice(idx+term.length)}</>
}
function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0)
}
function formatDate(iso) {
  if (!iso) return "—"
  const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`
}
function relativeTime(iso) {
  if (!iso) return ""
  const diff=Date.now()-new Date(iso).getTime(), days=Math.floor(diff/86400000)
  if (days===0) return "hoje"
  if (days===1) return "ontem"
  if (days<30)  return `há ${days} dias`
  if (days<365) return `há ${Math.floor(days/30)} meses`
  return `há ${Math.floor(days/365)} anos`
}
function initials(name="") { return name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() }
const AVATAR_PALETTE=[
  {bg:"rgba(79,110,247,.15)",fg:"#4f6ef7"},{bg:"rgba(167,139,250,.15)",fg:"#a78bfa"},
  {bg:"rgba(34,201,125,.15)",fg:"#22c97d"},{bg:"rgba(245,158,11,.15)",fg:"#f59e0b"},
  {bg:"rgba(236,72,153,.15)",fg:"#ec4899"},
]
function avatarColor(name="") {
  if (!name||typeof name!=="string") return AVATAR_PALETTE[0]
  return AVATAR_PALETTE[name.charCodeAt(0)%AVATAR_PALETTE.length]
}
function progressBarColor(s) {
  if (s==="concluido") return "#22c97d"
  if (s==="cancelado") return "#ef4444"
  return "#4f6ef7"
}
const ACTIVITY_ICON={
  created:{icon:"＋",color:"#4f6ef7"},payment:{icon:"$",color:"#22c97d"},
  status:{icon:"◎",color:"#a78bfa"},note:{icon:"✎",color:"#f59e0b"},comment:{icon:"✉",color:"#60a5fa"},
}

// ═══════════════════════════════════════════════════════════════════
// 3. NAV & PAGE META
// ═══════════════════════════════════════════════════════════════════
const NAV_SECTIONS=[
  { label:"Principal", items:[
    { id:"dashboard", label:"Dashboard",    icon:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    { id:"pipeline",  label:"Pipeline CRM", icon:"M4 6h16M4 12h16M4 18h16", badgeKey:"deals" },
    { id:"clients",   label:"Clientes",     icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", badgeKey:"clients" },
    { id:"kanban",    label:"Kanban",       icon:"M3 3h5v18H3zM9 3h6v18H9zM16 3h5v18h-5z", badgeKey:"projects" },
    { id:"tasks",     label:"Tarefas",      icon:"M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", badgeKey:"pendingTasks" },
  ]},
  { label:"Financeiro", items:[
    { id:"finance",  label:"Financeiro", icon:"M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" },
    { id:"reports",  label:"Relatórios", icon:"M18 20V10M12 20V4M6 20v-6" },
  ]},
  { label:"Sistema", items:[
    { id:"notifications", label:"Notificações",  icon:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0", badgeKey:"unreadNotifs" },
    { id:"settings",      label:"Configurações", icon:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
  ]},
]
const PAGE_META={
  dashboard:{title:"Dashboard",sub:"Visão geral do sistema"},
  pipeline:{title:"Pipeline CRM",sub:"Kanban de oportunidades"},
  clients:{title:"Clientes",sub:"Base de contatos e contas"},
  kanban:{title:"Kanban",sub:"Quadro de projetos"},
  tasks:{title:"Tarefas",sub:"Gerenciamento de atividades"},
  finance:{title:"Financeiro",sub:"Receitas e pagamentos"},
  reports:{title:"Relatórios",sub:"Análises e métricas"},
  notifications:{title:"Notificações",sub:"Central de alertas"},
  settings:{title:"Configurações",sub:"Preferências do sistema"},
}

// ═══════════════════════════════════════════════════════════════════
// 4. UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════
const BADGE_COLOR={
  green:{bg:"rgba(34,201,125,.12)",color:"#22c97d"},amber:{bg:"rgba(245,158,11,.12)",color:"#f59e0b"},
  red:{bg:"rgba(239,68,68,.12)",color:"#ef4444"},blue:{bg:"rgba(79,110,247,.12)",color:"#4f6ef7"},
  purple:{bg:"rgba(167,139,250,.12)",color:"#a78bfa"},gray:{bg:"rgba(90,100,120,.15)",color:"#8892a4"},
}
function Badge({colorKey,label}) {
  const s=BADGE_COLOR[colorKey]??BADGE_COLOR.gray
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".3px",background:s.bg,color:s.color}}><span style={{width:4,height:4,borderRadius:"50%",background:s.color,display:"inline-block"}}/>{label}</span>
}
function TagPill({label}) {
  return <span style={{display:"inline-flex",padding:"2px 7px",borderRadius:20,fontSize:9,fontFamily:"monospace",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",background:"#161b2a"}}>{label}</span>
}
function Icon({d,size=16}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
}
function StatCard({label,value,delta,deltaType="up",iconPath,iconColor}) {
  const ic=BADGE_COLOR[iconColor]?.color??"#4f6ef7"
  return (
    <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:16}}>
      {iconPath&&<div style={{float:"right",width:32,height:32,borderRadius:8,background:ic+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={iconPath} size={15}/></div>}
      <div style={{fontSize:10,color:"#5a6478",textTransform:"uppercase",letterSpacing:".8px",fontFamily:"monospace",marginBottom:10}}>{label}</div>
      <div style={{fontSize:26,fontWeight:500,color:"#e8eaf0",letterSpacing:-1}}>{value}</div>
      {delta&&<div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:8,fontSize:10,fontFamily:"monospace",padding:"2px 6px",borderRadius:4,background:deltaType==="up"?"rgba(34,201,125,.1)":"rgba(239,68,68,.1)",color:deltaType==="up"?"#22c97d":"#ef4444"}}>{deltaType==="up"?"↑":"↓"} {delta}</div>}
    </div>
  )
}
function Card({title,sub,children,style={}}) {
  return (
    <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:16,...style}}>
      {title&&<div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:600,color:"#e8eaf0"}}>{title}</div>{sub&&<div style={{fontSize:10,color:"#5a6478",marginTop:2}}>{sub}</div>}</div>}
      {children}
    </div>
  )
}
function SortTh({label,field,sortBy,onSort,style={}}) {
  const [sf,sd]=sortBy.split("_"); const active=sf===field
  return <th onClick={()=>onSort(field)} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:active?"#4f6ef7":"#5a6478",fontFamily:"monospace",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",...style}}>{label}{active&&<span style={{marginLeft:4,fontSize:8}}>{sd==="asc"?"↑":"↓"}</span>}{!active&&<span style={{marginLeft:4,fontSize:8,opacity:.3}}>↕</span>}</th>
}
function Pagination({total,page,perPage,onPage,onPerPage}) {
  const totalPages=Math.ceil(total/perPage)
  if (totalPages<=1&&total<=10) return null
  const pages=[]; for(let i=1;i<=totalPages;i++){if(i===1||i===totalPages||(i>=page-1&&i<=page+1))pages.push(i);else if(pages[pages.length-1]!=="…")pages.push("…")}
  const btn=(active)=>({minWidth:28,height:28,borderRadius:6,border:"1px solid",borderColor:active?"#4f6ef7":"rgba(255,255,255,.08)",background:active?"#4f6ef7":"transparent",color:active?"#fff":"#8892a4",fontSize:11,fontFamily:"monospace",cursor:active?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"})
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,color:"#5a6478",fontFamily:"monospace"}}>Por página:</span>{[10,25,50].map(n=><button key={n} onClick={()=>{onPerPage(n);onPage(1)}} style={{...btn(perPage===n)}}>{n}</button>)}</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><button onClick={()=>onPage(page-1)} disabled={page===1} style={{...btn(false),opacity:page===1?.3:1}}>‹</button>{pages.map((p,i)=>p==="…"?<span key={i} style={{color:"#5a6478",fontSize:11,padding:"0 2px"}}>…</span>:<button key={p} onClick={()=>onPage(p)} style={{...btn(page===p)}}>{p}</button>)}<button onClick={()=>onPage(page+1)} disabled={page===totalPages} style={{...btn(false),opacity:page===totalPages?.3:1}}>›</button></div>
      <span style={{fontSize:10,color:"#5a6478",fontFamily:"monospace"}}>{total} resultado{total!==1?"s":""}</span>
    </div>
  )
}
function TableSkeleton({rows=5}) {
  return <>{Array.from({length:rows}).map((_,i)=><tr key={i}>{Array.from({length:8}).map((_,j)=><td key={j} style={{padding:"11px 14px"}}><div style={{height:12,borderRadius:6,width:j===0?80:j===1?120:70,background:"linear-gradient(90deg,#1c2236 25%,#252d42 50%,#1c2236 75%)",backgroundSize:"400% 100%",animation:"shimmer 1.4s ease infinite"}}/></td>)}</tr>)}</>
}

// ═══════════════════════════════════════════════════════════════════
// 5. COMMAND PALETTE
// ═══════════════════════════════════════════════════════════════════
function CommandPalette({open,onClose,clients,setActiveTab,openClientModal}) {
  const [query,setQuery]=useState(""); const inputRef=useRef(null); const dq=useDebounce(query,120)
  useEffect(()=>{if(open){setQuery("");setTimeout(()=>inputRef.current?.focus(),50)}},[open])
  const CMDS=[
    {label:"Ir para Dashboard",icon:"⊞",action:()=>{setActiveTab("dashboard");onClose()}},
    {label:"Ir para Pipeline CRM",icon:"≡",action:()=>{setActiveTab("pipeline");onClose()}},
    {label:"Ir para Clientes",icon:"◉",action:()=>{setActiveTab("clients");onClose()}},
    {label:"Ir para Kanban",icon:"▣",action:()=>{setActiveTab("kanban");onClose()}},
    {label:"Ir para Tarefas",icon:"✓",action:()=>{setActiveTab("tasks");onClose()}},
    {label:"Ir para Financeiro",icon:"$",action:()=>{setActiveTab("finance");onClose()}},
    {label:"Ir para Relatórios",icon:"↗",action:()=>{setActiveTab("reports");onClose()}},
    {label:"Ir para Configurações",icon:"⚙",action:()=>{setActiveTab("settings");onClose()}},
  ]
  const results=useMemo(()=>{
    const q=normalize(dq)
    if(!q) return [{group:"Ações",items:CMDS.slice(0,6)}]
    const cmds=CMDS.filter(c=>normalize(c.label).includes(q))
    const found=clients.filter(c=>buildHaystack(c).includes(q)).slice(0,5).map(c=>({label:c.name,sub:c.company||c.email,icon:initials(c.name),isClient:true,action:()=>{openClientModal(c);onClose()}}))
    const groups=[]
    if(found.length) groups.push({group:"Clientes",items:found})
    if(cmds.length)  groups.push({group:"Ações",items:cmds})
    return groups
  },[dq,clients])
  if(!open) return null
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:120,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <motion.div initial={{scale:.96,opacity:0,y:-8}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.96,opacity:0}} transition={{duration:.15}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.12)",borderRadius:16,width:"100%",maxWidth:560,boxShadow:"0 24px 80px rgba(0,0,0,.6)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16}/>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar clientes, ações, páginas…" style={{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"#e8eaf0",fontFamily:"inherit"}}/>
          <span style={{fontSize:9,fontFamily:"monospace",color:"#5a6478",border:"1px solid rgba(255,255,255,.1)",padding:"2px 6px",borderRadius:4}}>ESC</span>
        </div>
        <div style={{maxHeight:380,overflowY:"auto"}}>
          {results.length===0?<div style={{padding:"32px 16px",textAlign:"center",color:"#5a6478",fontSize:13}}>Nenhum resultado</div>:results.map(group=>(
            <div key={group.group}>
              <div style={{padding:"10px 16px 4px",fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".6px"}}>{group.group}</div>
              {group.items.map((item,i)=>(
                <div key={i} onClick={item.action} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",cursor:"pointer",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background="#161b2a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:item.isClient?avatarColor(item.label).bg:"rgba(79,110,247,.1)",color:item.isClient?avatarColor(item.label).fg:"#4f6ef7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:item.isClient?9:13,fontWeight:700}}>{item.icon}</div>
                  <div><div style={{fontSize:13,color:"#e8eaf0"}}>{item.label}</div>{item.sub&&<div style={{fontSize:10,color:"#5a6478"}}>{item.sub}</div>}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{padding:"8px 16px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",gap:12}}>
          {[["↵","selecionar"],["↑↓","navegar"],["ESC","fechar"]].map(([k,l])=><span key={k} style={{fontSize:9,color:"#5a6478",fontFamily:"monospace"}}><span style={{background:"#1c2236",padding:"1px 5px",borderRadius:3,marginRight:4,border:"1px solid rgba(255,255,255,.07)"}}>{k}</span>{l}</span>)}
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 6. CLIENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
function ClientDetailModal({client,onClose,onEdit,onAddActivity}) {
  const [tab,setTab]=useState("overview")
  const [newNote,setNewNote]=useState(client.notes||"")
  const [editingNote,setEditingNote]=useState(false)
  const ps=PAYMENT_STATUS[client.paymentStatus]??PAYMENT_STATUS.pendente
  const prs=PROJECT_STATUS[client.projectStatus]??PROJECT_STATUS.andamento
  const pal=avatarColor(client.name)
  const TABS=["overview","timeline","pagamentos","notas"]
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:1500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}} onClick={onClose}>
      <motion.div initial={{scale:.94,opacity:0,y:12}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.94,opacity:0}} transition={{duration:.18}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,width:"100%",maxWidth:700,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 28px 80px rgba(0,0,0,.6)",overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <div style={{width:44,height:44,borderRadius:11,background:pal.bg,color:pal.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,flexShrink:0}}>{initials(client.name)}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:16,fontWeight:600,color:"#e8eaf0"}}>{client.name}</div><div style={{fontSize:11,color:"#5a6478",marginTop:1}}>{client.company} · {client.email}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Badge colorKey={ps.badge} label={ps.label}/><Badge colorKey={prs.badge} label={prs.label}/>
            <button onClick={()=>onEdit(client)} style={{marginLeft:8,padding:"5px 12px",borderRadius:7,fontSize:11,background:"rgba(79,110,247,.1)",border:"1px solid rgba(79,110,247,.2)",color:"#4f6ef7",cursor:"pointer",fontFamily:"inherit"}}>Editar</button>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
          </div>
        </div>
        <div style={{display:"flex",gap:0,padding:"0 24px",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"10px 14px",fontSize:12,border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize",color:tab===t?"#e8eaf0":"#5a6478",borderBottom:tab===t?"2px solid #4f6ef7":"2px solid transparent",transition:"all .13s"}}>{t}</button>)}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {tab==="overview"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[{l:"Valor do projeto",v:formatCurrency(client.projectValue),c:"#22c97d"},{l:"Telefone",v:client.phone||"—",c:"#e8eaf0"},{l:"Início",v:formatDate(client.startDate),c:"#e8eaf0"},{l:"Entrega",v:formatDate(client.endDate),c:"#e8eaf0"},{l:"Responsável",v:client.projectOwner||"—",c:"#e8eaf0"},{l:"ID",v:client.id,c:"#5a6478"}].map(f=>(
                  <div key={f.l} style={{background:"#161b2a",borderRadius:9,padding:"10px 14px",border:"1px solid rgba(255,255,255,.06)"}}>
                    <div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>{f.l}</div>
                    <div style={{fontSize:f.l==="ID"?10:13,fontWeight:500,color:f.c,fontFamily:f.l==="ID"?"monospace":"inherit"}}>{f.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#161b2a",borderRadius:9,padding:"12px 14px",border:"1px solid rgba(255,255,255,.06)",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:"#8892a4"}}>{client.projectName}</span><span style={{fontSize:11,fontFamily:"monospace",color:"#5a6478"}}>{client.projectProgress}%</span></div>
                <div style={{height:6,background:"#1c2236",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,width:`${client.projectProgress}%`,background:progressBarColor(client.projectStatus),transition:"width .4s"}}/></div>
              </div>
              {(client.tags||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{client.tags.map(t=><TagPill key={t} label={t}/>)}</div>}
            </div>
          )}
          {tab==="timeline"&&(
            <div>
              <button onClick={()=>onAddActivity(client.id)} style={{marginBottom:16,padding:"6px 14px",borderRadius:7,fontSize:11,background:"rgba(79,110,247,.1)",border:"1px solid rgba(79,110,247,.2)",color:"#4f6ef7",cursor:"pointer",fontFamily:"inherit"}}>+ Registrar atividade</button>
              {(client.activities||[]).length===0?<div style={{color:"#5a6478",fontSize:13,textAlign:"center",padding:"32px 0"}}>Nenhuma atividade</div>:[...(client.activities)].reverse().map((act,i,arr)=>{
                const meta=ACTIVITY_ICON[act.type]??ACTIVITY_ICON.note
                return <div key={act.id} style={{display:"flex",gap:12,paddingBottom:16,borderLeft:i<arr.length-1?"1px solid rgba(255,255,255,.07)":"none",marginLeft:14,paddingLeft:20,position:"relative"}}><div style={{position:"absolute",left:-10,top:0,width:20,height:20,borderRadius:"50%",background:meta.color+"22",color:meta.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,border:`1px solid ${meta.color}44`,flexShrink:0}}>{meta.icon}</div><div style={{flex:1}}><div style={{fontSize:12,color:"#e8eaf0"}}>{act.text}</div><div style={{fontSize:10,color:"#5a6478",marginTop:3,fontFamily:"monospace"}}>{act.user} · {relativeTime(act.date)} · {formatDate(act.date)}</div></div></div>
              })}
            </div>
          )}
          {tab==="pagamentos"&&(
            <div>
              <div style={{background:"#161b2a",borderRadius:9,padding:"16px",border:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".6px",marginBottom:6}}>Valor total</div><div style={{fontSize:24,fontWeight:600,color:"#22c97d",fontFamily:"monospace"}}>{formatCurrency(client.projectValue)}</div></div>
                <Badge colorKey={ps.badge} label={ps.label}/>
              </div>
              <div style={{background:"#161b2a",borderRadius:9,padding:"14px",border:"1px solid rgba(255,255,255,.06)"}}>
                {[{l:"Status",v:ps.label},{l:"Início do projeto",v:formatDate(client.startDate)},{l:"Entrega",v:formatDate(client.endDate)},{l:"Empresa",v:client.company||"—"}].map((r,i,a)=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<a.length-1?"1px solid rgba(255,255,255,.04)":"none"}}><span style={{fontSize:11,color:"#5a6478"}}>{r.l}</span><span style={{fontSize:11,color:"#e8eaf0",fontFamily:"monospace"}}>{r.v}</span></div>
                ))}
              </div>
            </div>
          )}
          {tab==="notas"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:11,color:"#5a6478"}}>Observações internas</span>
                <button onClick={()=>setEditingNote(!editingNote)} style={{padding:"4px 10px",borderRadius:6,fontSize:10,cursor:"pointer",fontFamily:"inherit",background:"rgba(79,110,247,.1)",border:"1px solid rgba(79,110,247,.2)",color:"#4f6ef7"}}>{editingNote?"Salvar":"Editar"}</button>
              </div>
              {editingNote?<textarea value={newNote} onChange={e=>setNewNote(e.target.value)} style={{width:"100%",minHeight:160,background:"#161b2a",border:"1px solid rgba(79,110,247,.3)",borderRadius:9,padding:"12px 14px",fontSize:13,color:"#e8eaf0",fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}/>:<div style={{background:"#161b2a",borderRadius:9,padding:"12px 14px",border:"1px solid rgba(255,255,255,.06)",minHeight:100,fontSize:13,color:newNote?"#8892a4":"#3a4255",lineHeight:1.6}}>{newNote||"Nenhuma observação. Clique em Editar para adicionar."}</div>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 7. VIEWS
// ═══════════════════════════════════════════════════════════════════
function DashboardView({clients,deals}) {
  const activeClients=clients.filter(c=>c.projectStatus==="andamento").length
  const totalRevenue=clients.reduce((s,c)=>s+(c.paymentStatus==="pago"?c.projectValue:0),0)
  const openDeals=deals.filter(d=>d.stage!=="fechado").length
  const wonDeals=deals.filter(d=>d.stage==="fechado")
  const convRate=deals.length>0?Math.round((wonDeals.length/deals.length)*100):0
  const stageCounts=PIPELINE_STAGE_KEYS.map(k=>({n:PIPELINE_STAGE[k].label,c:deals.filter(d=>d.stage===k).length,color:PIPELINE_STAGE[k].color}))
  const maxSC=Math.max(...stageCounts.map(s=>s.c),1)
  const REVENUE_DATA=[{month:"Dez",value:28},{month:"Jan",value:34},{month:"Fev",value:31},{month:"Mar",value:42},{month:"Abr",value:38},{month:"Mai",value:wonDeals.reduce((s,d)=>s+d.value,0)/1000||47}]
  const maxR=Math.max(...REVENUE_DATA.map(r=>r.value))
  const recent=[...clients].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,5)
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Clientes em andamento" value={activeClients} delta={`de ${clients.length} total`} iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" iconColor="blue"/>
        <StatCard label="Receita recebida" value={formatCurrency(totalRevenue)} delta="pagamentos confirmados" iconPath="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" iconColor="green"/>
        <StatCard label="Negociações em aberto" value={openDeals} delta={`${wonDeals.length} fechadas`} iconPath="M4 6h16M4 12h16M4 18h16" iconColor="amber"/>
        <StatCard label="Taxa de conversão" value={`${convRate}%`} delta="negociações ganhas / total" iconPath="M18 20V10M12 20V4M6 20v-6" iconColor="purple"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <Card title="Receita (últimos 6 meses)">
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:80}}>
            {REVENUE_DATA.map((r,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${(r.value/maxR)*100}%`,background:i===REVENUE_DATA.length-1?"#4f6ef7":"#1c2236"}}/><div style={{fontSize:8,color:"#5a6478",fontFamily:"monospace",marginTop:4}}>{r.month}</div></div>)}
          </div>
        </Card>
        <Card title="Pipeline por etapa" sub="Negociações ativas">
          {stageCounts.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:10,color:"#8892a4",width:76,fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n}</div><div style={{flex:1,background:"#1c2236",borderRadius:4,height:8,overflow:"hidden"}}><div style={{background:s.color,height:"100%",width:`${(s.c/maxSC)*100}%`,borderRadius:4,transition:"width .4s"}}/></div><div style={{fontSize:10,color:"#5a6478",fontFamily:"monospace",width:14,textAlign:"right"}}>{s.c}</div></div>)}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card title="Clientes recentes">
          {recent.length===0?<div style={{textAlign:"center",color:"#5a6478",padding:"24px 0",fontSize:12}}>Nenhum cliente ainda</div>:recent.map((c,i)=>{
            const pal=avatarColor(c.name); const ps=PAYMENT_STATUS[c.paymentStatus]??PAYMENT_STATUS.pendente
            return <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<recent.length-1?"1px solid rgba(255,255,255,.05)":"none"}}><div style={{width:28,height:28,borderRadius:7,background:pal.bg,color:pal.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{initials(c.name)}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:"#e8eaf0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:10,color:"#5a6478"}}>{c.company||c.email}</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:12,fontWeight:600,color:"#22c97d",fontFamily:"monospace"}}>{formatCurrency(c.projectValue)}</div><Badge colorKey={ps.badge} label={ps.label}/></div></div>
          })}
        </Card>
        <Card title="Top negociações por valor">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Negociação","Etapa","Valor"].map(h=><th key={h} style={{textAlign:h==="Valor"?"right":"left",padding:"6px 0",fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>{h}</th>)}</tr></thead>
            <tbody>{[...deals].sort((a,b)=>b.value-a.value).slice(0,5).map(d=>{const st=PIPELINE_STAGE[d.stage]??PIPELINE_STAGE.lead;return <tr key={d.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"7px 0",fontSize:12,color:"#e8eaf0",fontWeight:500}}>{d.name}</td><td style={{padding:"7px 0"}}><span style={{fontSize:9,fontFamily:"monospace",color:st.color}}>{st.label}</span></td><td style={{padding:"7px 0",fontSize:12,color:"#22c97d",fontFamily:"monospace",textAlign:"right"}}>{formatCurrency(d.value)}</td></tr>})}</tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

function PipelineView({deals,setDeals,addToast,user}) {
  const [draggingId,setDraggingId]=useState(null)
  const [overStage,setOverStage]=useState(null)
  const [showForm,setShowForm]=useState(false)
  const [saving,setSaving]=useState(false)
  const [confirmId,setConfirmId]=useState(null)
  const [form,setForm]=useState({name:"",company:"",value:"",stage:"lead"})
  const [formErrors,setFormErrors]=useState({})

  const totalValue=deals.reduce((s,d)=>s+d.value,0)
  const openDeals=deals.filter(d=>d.stage!=="fechado")
  const avgTicket=openDeals.length>0?openDeals.reduce((s,d)=>s+d.value,0)/openDeals.length:0

  async function onDrop(targetStage) {
    setOverStage(null); if(!draggingId) return
    const deal=deals.find(d=>d.id===draggingId)
    if(!deal||deal.stage===targetStage){setDraggingId(null);return}
    const allowed=ALLOWED_TRANSITIONS[deal.stage]??[]
    if(!allowed.includes(targetStage)){addToast(`Transição "${PIPELINE_STAGE[deal.stage].label}" → "${PIPELINE_STAGE[targetStage].label}" não permitida.`,"error");setDraggingId(null);return}
    const closedAt=targetStage==="fechado"?new Date().toISOString().split("T")[0]:null
    setDeals(prev=>prev.map(d=>d.id===draggingId?{...d,stage:targetStage,closedAt}:d))
    try{await updateDeal(draggingId,{stage:targetStage,closedAt});addToast(`Negociação movida para "${PIPELINE_STAGE[targetStage].label}"`,"success")}
    catch{setDeals(prev=>prev.map(d=>d.id===draggingId?{...d,stage:deal.stage,closedAt:deal.closedAt}:d));addToast("Erro ao mover negociação.","error")}
    setDraggingId(null)
  }

  function validateForm(f) {
    const e={}
    if(!f.name?.trim())    e.name="Nome obrigatório"
    if(!f.value||Number(f.value)<=0) e.value="Valor deve ser > 0"
    if(!f.stage)           e.stage="Selecione uma etapa"
    return e
  }

  async function handleCreate(e) {
    e.preventDefault()
    const errs=validateForm(form); if(Object.keys(errs).length){setFormErrors(errs);return}
    setSaving(true)
    try {
      const newDeal=await createDeal(user.id,{name:form.name.trim(),company:form.company.trim(),value:Number(form.value),stage:form.stage})
      setDeals(prev=>[newDeal,...prev])
      addToast("Negociação criada!","success")
      setShowForm(false)
      setForm({name:"",company:"",value:"",stage:"lead"})
      setFormErrors({})
    } catch(err){addToast(`Erro: ${err.message}`,"error")}
    finally{setSaving(false)}
  }

  async function handleDelete(id) {
    try{await deleteDeal(id);setDeals(prev=>prev.filter(d=>d.id!==id));addToast("Negociação removida.","warning")}
    catch(err){addToast(`Erro: ${err.message}`,"error")}
    setConfirmId(null)
  }

  const inputStyle={background:"#161b2a",border:"1px solid rgba(255,255,255,.15)",borderRadius:7,padding:"7px 10px",fontSize:12,color:"#e8eaf0",fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}

  return (
    <div>
      {/* Header com botão */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:12,color:"#5a6478",fontFamily:"monospace"}}>{openDeals.length} negociação{openDeals.length!==1?"s":""} em aberto</div>
        <button onClick={()=>setShowForm(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,background:"#4f6ef7",border:"none",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
          + Nova negociação
        </button>
      </div>

      {/* Modal de criação */}
      <AnimatePresence>
        {showForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}} onClick={()=>setShowForm(false)}>
            <motion.div initial={{scale:.93,opacity:0,y:10}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.93,opacity:0}} transition={{duration:.18}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
              <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:15,fontWeight:600,color:"#e8eaf0"}}>➕ Nova negociação</div>
                <button onClick={()=>setShowForm(false)} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"#8892a4",cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
              </div>
              <form onSubmit={handleCreate} noValidate style={{padding:"20px 24px 24px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Nome da negociação *</div>
                    <input type="text" value={form.name} onChange={e=>{setForm(p=>({...p,name:e.target.value}));setFormErrors(p=>({...p,name:""}))}} placeholder="Ex: Proposta Redesign" style={{...inputStyle,borderColor:formErrors.name?"#ef4444":"rgba(255,255,255,.15)"}}/>
                    {formErrors.name&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.name}</div>}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Empresa</div>
                    <input type="text" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} placeholder="Ex: Empresa S.A." style={inputStyle}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Valor (R$) *</div>
                    <input type="number" min="0" step="0.01" value={form.value} onChange={e=>{setForm(p=>({...p,value:e.target.value}));setFormErrors(p=>({...p,value:""}))}} placeholder="0,00" style={{...inputStyle,borderColor:formErrors.value?"#ef4444":"rgba(255,255,255,.15)"}}/>
                    {formErrors.value&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.value}</div>}
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Etapa *</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {PIPELINE_STAGE_KEYS.map(k=>{
                        const s=PIPELINE_STAGE[k]; const active=form.stage===k
                        return <button key={k} type="button" onClick={()=>{setForm(p=>({...p,stage:k}));setFormErrors(p=>({...p,stage:""}))}} style={{padding:"4px 10px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${active?s.color:s.color+"40"}`,background:active?s.color+"20":"transparent",color:active?s.color:s.color+"99",transition:"all .13s"}}>{s.label}</button>
                      })}
                    </div>
                    {formErrors.stage&&<div style={{fontSize:10,color:"#ef4444",marginTop:4}}>{formErrors.stage}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                  <button type="button" onClick={()=>setShowForm(false)} style={{padding:"7px 16px",borderRadius:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{padding:"7px 16px",borderRadius:7,background:"#4f6ef7",border:"none",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                    {saving&&<div style={{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .6s linear infinite"}}/>}
                    {saving?"Criando…":"Criar negociação"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmId&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={()=>setConfirmId(null)}>
            <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}} transition={{duration:.16}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:28,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
              <div style={{fontSize:32,marginBottom:12}}>🗑</div>
              <div style={{fontSize:15,fontWeight:600,color:"#e8eaf0",marginBottom:8}}>Remover negociação?</div>
              <div style={{fontSize:12,color:"#8892a4",marginBottom:24,lineHeight:1.6}}>Esta ação não pode ser desfeita.</div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button onClick={()=>setConfirmId(null)} style={{padding:"7px 18px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                <button onClick={()=>handleDelete(confirmId)} style={{padding:"7px 18px",borderRadius:8,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Remover</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:20}}>
        {PIPELINE_STAGE_KEYS.map(stageKey=>{
          const stage=PIPELINE_STAGE[stageKey]; const stageDeals=deals.filter(d=>d.stage===stageKey); const isOver=overStage===stageKey
          return (
            <div key={stageKey} onDragOver={e=>{e.preventDefault();setOverStage(stageKey)}} onDragLeave={()=>setOverStage(null)} onDrop={()=>onDrop(stageKey)} style={{background:isOver?stage.color+"14":"#111520",border:`1px solid ${isOver?stage.color+"60":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:10,minHeight:120,transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",fontFamily:"monospace",color:stage.color}}>{stage.label}</div>
                <div style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:stage.color+"18",color:stage.color,fontFamily:"monospace"}}>{stageDeals.length}</div>
              </div>
              <AnimatePresence>
                {stageDeals.map(d=>(
                  <motion.div key={d.id} layout initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:.95}}
                    draggable onDragStart={()=>setDraggingId(d.id)}
                    style={{background:"#161b2a",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:8,marginBottom:6,cursor:"grab",opacity:draggingId===d.id?.45:1,position:"relative"}}
                    onMouseEnter={e=>e.currentTarget.querySelector(".del-btn").style.opacity="1"}
                    onMouseLeave={e=>e.currentTarget.querySelector(".del-btn").style.opacity="0"}>
                    <button className="del-btn" onClick={e=>{e.stopPropagation();setConfirmId(d.id)}} style={{position:"absolute",top:5,right:5,width:18,height:18,borderRadius:4,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.25)",color:"#ef4444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,opacity:0,transition:"opacity .15s",padding:0}}>×</button>
                    <div style={{fontSize:11,fontWeight:500,color:"#e8eaf0",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:18}}>{d.name}</div>
                    <div style={{fontSize:10,color:"#5a6478",marginBottom:6}}>{d.company}</div>
                    <div style={{fontSize:11,fontWeight:600,color:"#22c97d",fontFamily:"monospace"}}>{formatCurrency(d.value)}</div>
                    <div style={{fontSize:8,color:"#5a6478",fontFamily:"monospace",marginTop:4,textAlign:"right"}}>{formatDate(d.createdAt)}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <StatCard label="Valor total pipeline" value={formatCurrency(totalValue)}/>
        <StatCard label="Ticket médio" value={formatCurrency(avgTicket)}/>
        <StatCard label="Negociações em aberto" value={openDeals.length}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ClientsView({clients,setClients,addToast,openClientModal,user,dataLoading,onNotify}) {
  const [rawQuery,setRawQuery]=useState(""); const [filterPayment,setFilterPayment]=useState("all"); const [filterProject,setFilterProject]=useState("all")
  const [filterOwner,setFilterOwner]=useState("all"); const [filterTag,setFilterTag]=useState("all"); const [valueMin,setValueMin]=useState(""); const [valueMax,setValueMax]=useState("")
  const [sortBy,setSortBy]=useState("createdAt_desc"); const [showForm,setShowForm]=useState(false); const [editingId,setEditingId]=useState(null)
  const [confirmId,setConfirmId]=useState(null); const [form,setForm]=useState({}); const [formErrors,setFormErrors]=useState({}); const [saving,setSaving]=useState(false)
  const [page,setPage]=useState(1); const [perPage,setPerPage]=useState(10); const [showAdvanced,setShowAdvanced]=useState(false)
  const query=useDebounce(rawQuery,250)
  useEffect(()=>{function handle(e){openEdit(e.detail)} window.addEventListener("crm:editClient",handle);return()=>window.removeEventListener("crm:editClient",handle)},[])
  const allOwners=useMemo(()=>[...new Set(clients.map(c=>c.projectOwner).filter(Boolean))],[clients])
  const allTags=useMemo(()=>[...new Set(clients.flatMap(c=>c.tags||[]))],[clients])
  function toggleSort(field){setSortBy(prev=>{const[pf,pd]=prev.split("_");if(pf===field)return`${field}_${pd==="asc"?"desc":"asc"}`;return`${field}_asc`});setPage(1)}
  const filtered=useMemo(()=>{
    const q=normalize(query),vMin=valueMin!==""?Number(valueMin):null,vMax=valueMax!==""?Number(valueMax):null
    let result=clients.filter(c=>{
      if(q&&!buildHaystack(c).includes(q))return false
      if(filterPayment!=="all"&&(c.paymentStatus||"pendente")!==filterPayment)return false
      if(filterProject!=="all"&&(c.projectStatus||"andamento")!==filterProject)return false
      if(filterOwner!=="all"&&c.projectOwner!==filterOwner)return false
      if(filterTag!=="all"&&!(c.tags||[]).includes(filterTag))return false
      if(vMin!==null&&c.projectValue<vMin)return false
      if(vMax!==null&&c.projectValue>vMax)return false
      return true
    })
    const[field,dir]=sortBy.split("_")
    result.sort((a,b)=>{let va=a[field]??"",vb=b[field]??"";if(field==="projectValue"){va=Number(va);vb=Number(vb)}else{va=normalize(String(va));vb=normalize(String(vb))};if(va<vb)return dir==="asc"?-1:1;if(va>vb)return dir==="asc"?1:-1;return 0})
    return result
  },[clients,query,filterPayment,filterProject,filterOwner,filterTag,valueMin,valueMax,sortBy])
  const paginated=useMemo(()=>{const start=(page-1)*perPage;return filtered.slice(start,start+perPage)},[filtered,page,perPage])
  const hasFilters=rawQuery||filterPayment!=="all"||filterProject!=="all"||filterOwner!=="all"||filterTag!=="all"||valueMin!==""||valueMax!==""
  const totalValue=useMemo(()=>clients.reduce((s,c)=>s+c.projectValue,0),[clients])
  const paidValue=useMemo(()=>clients.filter(c=>c.paymentStatus==="pago").reduce((s,c)=>s+c.projectValue,0),[clients])
  const pendingValue=useMemo(()=>clients.filter(c=>c.paymentStatus!=="pago").reduce((s,c)=>s+c.projectValue,0),[clients])
  function openCreate(){setForm({paymentStatus:"pendente",projectStatus:"andamento",projectProgress:PROGRESS_BY_STATUS["andamento"]});setFormErrors({});setEditingId(null);setShowForm(true)}
  function openEdit(c){setForm({...c});setFormErrors({});setEditingId(c.id);setShowForm(true)}
  function closeForm(){setShowForm(false);setEditingId(null)}
  function validateForm(f){
    const e={}
    if(!f.name?.trim())e.name="Nome obrigatório"
    if(!f.email?.trim())e.email="Email obrigatório";else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))e.email="Email inválido"
    if(!f.phone?.trim())e.phone="Telefone obrigatório"
    if(!f.projectValue||Number(f.projectValue)<=0)e.projectValue="Valor deve ser > 0"
    if(!f.paymentStatus)e.paymentStatus="Selecione"
    if(!f.projectStatus)e.projectStatus="Selecione"
    if(!f.startDate)e.startDate="Data obrigatória"
    if(!f.endDate)e.endDate="Data obrigatória"
    if(f.startDate&&f.endDate&&f.endDate<f.startDate)e.endDate="Deve ser após o início"
    if(!f.projectName?.trim())e.projectName="Nome do projeto obrigatório"
    if(!f.projectOwner?.trim())e.projectOwner="Responsável obrigatório"
    return e
  }
  async function handleSave(e) {
    e.preventDefault(); const errs=validateForm(form); if(Object.keys(errs).length){setFormErrors(errs);return}
    setSaving(true)
    try {
      const progress=Math.min(100,Math.max(0,Number(form.projectProgress)||0))
      const clientData={...form,projectValue:Number(form.projectValue),projectProgress:progress}
      if(editingId){
        const updated=await updateClient(editingId,clientData)
        setClients(prev=>prev.map(c=>c.id===editingId?updated:c))
        addToast("Cliente atualizado!","success")
        onNotify({title:"Cliente atualizado",message:`${clientData.name} foi atualizado`,type:"info"})
      } else {
        const newActivity=[{id:`a${Date.now()}`,type:"created",text:"Cliente criado",date:new Date().toISOString().split("T")[0],user:user.email}]
        const newClient=await createClient(user.id,{...clientData,kanbanCol:"backlog",tags:[],activities:newActivity})
        setClients(prev=>[newClient,...prev])
        addToast("Cliente adicionado!","success")
        onNotify({title:"Novo cliente criado",message:`${clientData.name} foi adicionado ao CRM`,type:"success"})
      }
      closeForm()
    } catch(err){
      if(err.clientCreated){setClients(prev=>[err.clientCreated,...prev]);addToast("Cliente salvo! (registro financeiro pendente)","warning");closeForm()}
      else addToast(`Erro: ${err.message}`,"error")
    } finally{setSaving(false)}
  }
  async function handleDelete(id) {
    const client=clients.find(c=>c.id===id)
    try{await deleteClient(id);setClients(prev=>prev.filter(c=>c.id!==id));addToast("Cliente removido.","warning");onNotify({title:"Cliente removido",message:`${client?.name||"Cliente"} foi removido`,type:"warning"})}
    catch(err){addToast(`Erro ao deletar: ${err.message}`,"error")}
    setConfirmId(null)
  }
  function setF(k,v){setForm(p=>{const next={...p,[k]:v};if(k==="projectStatus"&&v in PROGRESS_BY_STATUS)next.projectProgress=PROGRESS_BY_STATUS[v];return next});setFormErrors(p=>({...p,[k]:""}))}
  const inputStyle={background:"#161b2a",border:"1px solid rgba(255,255,255,.15)",borderRadius:7,padding:"7px 10px",fontSize:12,color:"#e8eaf0",fontFamily:"inherit",outline:"none",width:"100%"}
  const chipStyle=active=>({padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:"1px solid",fontFamily:"inherit",transition:"all .13s",borderColor:active?"#4f6ef7":"rgba(255,255,255,.1)",background:active?"#4f6ef7":"transparent",color:active?"#fff":"#8892a4"})
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        {[{l:"Total faturado",v:formatCurrency(totalValue),c:"#e8eaf0"},{l:"Recebido",v:formatCurrency(paidValue),c:"#22c97d"},{l:"Pendente",v:formatCurrency(pendingValue),c:"#f59e0b"}].map(s=>(
          <div key={s.l} style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 16px",flex:1,minWidth:130}}>
            <div style={{fontSize:9,color:"#5a6478",textTransform:"uppercase",letterSpacing:".6px",fontFamily:"monospace",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:17,fontWeight:700,color:s.c,fontFamily:"monospace",letterSpacing:"-.3px"}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#161b2a",border:"1px solid rgba(255,255,255,.08)",borderRadius:7,padding:"6px 10px",flex:1,minWidth:200}}>
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13}/>
          <input value={rawQuery} onChange={e=>{setRawQuery(e.target.value);setPage(1)}} placeholder="Buscar por nome, email, empresa, ID, telefone, valor, tag…" style={{background:"none",border:"none",outline:"none",fontSize:12,color:"#e8eaf0",fontFamily:"inherit",width:"100%"}}/>
          {rawQuery&&<button onClick={()=>setRawQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:"#5a6478",fontSize:16,lineHeight:1}}>×</button>}
        </div>
        <button onClick={()=>setShowAdvanced(v=>!v)} style={{padding:"7px 12px",borderRadius:7,fontSize:11,cursor:"pointer",fontFamily:"inherit",border:"1px solid rgba(255,255,255,.1)",background:showAdvanced?"rgba(79,110,247,.15)":"transparent",color:showAdvanced?"#4f6ef7":"#8892a4"}}>Filtros {showAdvanced?"▲":"▼"}</button>
        <button onClick={openCreate} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,background:"#4f6ef7",border:"none",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>+ Novo cliente</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:showAdvanced?8:14,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#5a6478",fontFamily:"monospace"}}>PAGAMENTO:</span>
        {[["all","Todos"],["pendente","Pendente"],["pago","Pago"],["atrasado","Atrasado"]].map(([v,l])=><button key={v} style={chipStyle(filterPayment===v)} onClick={()=>{setFilterPayment(v);setPage(1)}}>{l}</button>)}
        <span style={{fontSize:10,color:"#5a6478",fontFamily:"monospace",marginLeft:8}}>PROJETO:</span>
        {[["all","Todos"],["andamento","Em andamento"],["concluido","Concluído"],["cancelado","Cancelado"]].map(([v,l])=><button key={v} style={chipStyle(filterProject===v)} onClick={()=>{setFilterProject(v);setPage(1)}}>{l}</button>)}
        {hasFilters&&<button onClick={()=>{setRawQuery("");setFilterPayment("all");setFilterProject("all");setFilterOwner("all");setFilterTag("all");setValueMin("");setValueMax("");setPage(1)}} style={{...chipStyle(false),borderColor:"rgba(239,68,68,.3)",color:"#ef4444",marginLeft:8}}>✕ Limpar filtros</button>}
      </div>
      <AnimatePresence>
        {showAdvanced&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.18}} style={{overflow:"hidden",marginBottom:14}}>
          <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Responsável</div><select value={filterOwner} onChange={e=>{setFilterOwner(e.target.value);setPage(1)}} style={{...inputStyle,cursor:"pointer"}}><option value="all">Todos</option>{allOwners.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Tag</div><select value={filterTag} onChange={e=>{setFilterTag(e.target.value);setPage(1)}} style={{...inputStyle,cursor:"pointer"}}><option value="all">Todas</option>{allTags.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Valor mínimo (R$)</div><input type="number" min="0" value={valueMin} onChange={e=>{setValueMin(e.target.value);setPage(1)}} placeholder="0" style={inputStyle}/></div>
            <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Valor máximo (R$)</div><input type="number" min="0" value={valueMax} onChange={e=>{setValueMax(e.target.value);setPage(1)}} placeholder="∞" style={inputStyle}/></div>
          </div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}} onClick={closeForm}>
          <motion.div initial={{scale:.93,opacity:0,y:10}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.93,opacity:0}} transition={{duration:.18}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
            <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:16,fontWeight:600,color:"#e8eaf0"}}>{editingId?"✏️ Editar cliente":"➕ Novo cliente"}</div>
              <button onClick={closeForm} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"#8892a4",cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>×</button>
            </div>
            <form onSubmit={handleSave} noValidate style={{padding:"20px 24px 24px"}}>
              {editingId&&<div style={{marginBottom:14,padding:"8px 12px",background:"#161b2a",borderRadius:7,border:"1px solid rgba(255,255,255,.07)"}}><span style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px"}}>ID: </span><span style={{fontSize:11,color:"#5a6478",fontFamily:"monospace"}}>{editingId}</span></div>}
              <div style={{fontSize:9,color:"#5a6478",textTransform:"uppercase",letterSpacing:".7px",fontFamily:"monospace",marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,.06)"}}>Dados do contato</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[{k:"name",l:"Nome *",t:"text",ph:"Ana Souza"},{k:"email",l:"Email *",t:"email",ph:"ana@empresa.com"},{k:"phone",l:"Telefone *",t:"text",ph:"(11) 99999-0000"},{k:"company",l:"Empresa",t:"text",ph:"Empresa Ltda"}].map(({k,l,t,ph})=>(
                  <div key={k}><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>{l}</div><input type={t} value={form[k]||""} onChange={e=>setF(k,e.target.value)} placeholder={ph} style={{...inputStyle,borderColor:formErrors[k]?"#ef4444":"rgba(255,255,255,.15)"}}/>{formErrors[k]&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors[k]}</div>}</div>
                ))}
              </div>
              <div style={{fontSize:9,color:"#5a6478",textTransform:"uppercase",letterSpacing:".7px",fontFamily:"monospace",marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,.06)"}}>Dados do projeto</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Nome do projeto *</div><input type="text" value={form.projectName||""} onChange={e=>setF("projectName",e.target.value)} placeholder="Ex: Redesign Site" style={{...inputStyle,borderColor:formErrors.projectName?"#ef4444":"rgba(255,255,255,.15)"}}/>{formErrors.projectName&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.projectName}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Responsável *</div><input type="text" value={form.projectOwner||""} onChange={e=>setF("projectOwner",e.target.value)} placeholder="Ex: Mariana A." style={{...inputStyle,borderColor:formErrors.projectOwner?"#ef4444":"rgba(255,255,255,.15)"}}/>{formErrors.projectOwner&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.projectOwner}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Valor (R$) *</div><input type="number" min="0" step="0.01" value={form.projectValue||""} onChange={e=>setF("projectValue",e.target.value)} placeholder="0,00" style={{...inputStyle,borderColor:formErrors.projectValue?"#ef4444":"rgba(255,255,255,.15)"}}/>{formErrors.projectValue&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.projectValue}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Status pagamento *</div><select value={form.paymentStatus||""} onChange={e=>setF("paymentStatus",e.target.value)} style={{...inputStyle,borderColor:formErrors.paymentStatus?"#ef4444":"rgba(255,255,255,.15)",cursor:"pointer",appearance:"none"}}><option value="">Selecione…</option>{Object.entries(PAYMENT_STATUS).map(([v,s])=><option key={v} value={v}>{s.label}</option>)}</select>{formErrors.paymentStatus&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.paymentStatus}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Status projeto *</div><select value={form.projectStatus||""} onChange={e=>setF("projectStatus",e.target.value)} style={{...inputStyle,borderColor:formErrors.projectStatus?"#ef4444":"rgba(255,255,255,.15)",cursor:"pointer",appearance:"none"}}><option value="">Selecione…</option>{Object.entries(PROJECT_STATUS).map(([v,s])=><option key={v} value={v}>{s.label}</option>)}</select>{formErrors.projectStatus&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.projectStatus}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Progresso (%) <span style={{color:"#3a4255"}}>— manual</span></div><input type="number" min="0" max="100" value={form.projectProgress??""} onChange={e=>setF("projectProgress",e.target.value)} placeholder="0–100" style={inputStyle}/>{form.projectProgress!==undefined&&<div style={{marginTop:6,height:4,background:"#1c2236",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,width:`${Math.min(100,Math.max(0,Number(form.projectProgress)||0))}%`,background:progressBarColor(form.projectStatus)}}/></div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Data início *</div><input type="date" value={form.startDate||""} onChange={e=>setF("startDate",e.target.value)} style={{...inputStyle,borderColor:formErrors.startDate?"#ef4444":"rgba(255,255,255,.15)",colorScheme:"dark"}}/>{formErrors.startDate&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.startDate}</div>}</div>
                <div><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Data entrega *</div><input type="date" value={form.endDate||""} onChange={e=>setF("endDate",e.target.value)} style={{...inputStyle,borderColor:formErrors.endDate?"#ef4444":"rgba(255,255,255,.15)",colorScheme:"dark"}}/>{formErrors.endDate&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{formErrors.endDate}</div>}</div>
                <div style={{gridColumn:"1/-1"}}><div style={{fontSize:9,color:"#5a6478",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",marginBottom:5}}>Observações</div><input type="text" value={form.notes||""} onChange={e=>setF("notes",e.target.value)} placeholder="Detalhes…" style={inputStyle}/></div>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                <button type="button" onClick={closeForm} disabled={saving} style={{padding:"7px 16px",borderRadius:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                <button type="submit" disabled={saving} style={{padding:"7px 16px",borderRadius:7,background:"#4f6ef7",border:"none",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>{saving&&<div style={{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .6s linear infinite"}}/>}{saving?"Salvando…":editingId?"Salvar alterações":"Adicionar cliente"}</button>
              </div>
            </form>
          </motion.div>
        </div>}
      </AnimatePresence>
      <AnimatePresence>
        {confirmId&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={()=>setConfirmId(null)}>
          <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}} transition={{duration:.16}} onClick={e=>e.stopPropagation()} style={{background:"#111520",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:28,maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
            <div style={{fontSize:36,marginBottom:12}}>🗑</div>
            <div style={{fontSize:16,fontWeight:600,color:"#e8eaf0",marginBottom:8}}>Deletar cliente?</div>
            <div style={{fontSize:12,color:"#8892a4",marginBottom:24,lineHeight:1.6}}>Esta ação não pode ser desfeita.<br/>O cliente será removido permanentemente.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirmId(null)} style={{padding:"8px 20px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
              <button onClick={()=>handleDelete(confirmId)} style={{padding:"8px 20px",borderRadius:8,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Deletar</button>
            </div>
          </motion.div>
        </div>}
      </AnimatePresence>
      <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:"#5a6478",fontFamily:"monospace",borderBottom:"1px solid rgba(255,255,255,.05)"}}>ID</th>
            <SortTh label="Nome" field="name" sortBy={sortBy} onSort={toggleSort}/>
            <SortTh label="Empresa" field="company" sortBy={sortBy} onSort={toggleSort}/>
            <th style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:"#5a6478",fontFamily:"monospace",borderBottom:"1px solid rgba(255,255,255,.05)"}}>Email</th>
            <th style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:"#5a6478",fontFamily:"monospace",borderBottom:"1px solid rgba(255,255,255,.05)"}}>Pagamento</th>
            <th style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".8px",color:"#5a6478",fontFamily:"monospace",borderBottom:"1px solid rgba(255,255,255,.05)"}}>Projeto</th>
            <SortTh label="Valor" field="projectValue" sortBy={sortBy} onSort={toggleSort}/>
            <SortTh label="Entrega" field="endDate" sortBy={sortBy} onSort={toggleSort}/>
            <th style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.05)"}}/>
          </tr></thead>
          <tbody>
            {dataLoading?<TableSkeleton rows={5}/>:paginated.length===0?<tr><td colSpan={9} style={{padding:"48px 0",textAlign:"center",color:"#5a6478",fontSize:13}}>{hasFilters?"Nenhum resultado para os filtros aplicados":"Nenhum cliente ainda"}</td></tr>:paginated.map(c=>{
              const pal=avatarColor(c.name); const ps=PAYMENT_STATUS[c.paymentStatus??"pendente"]; const prs=PROJECT_STATUS[c.projectStatus??"andamento"]
              return <tr key={c.id} style={{borderBottom:"1px solid rgba(255,255,255,.03)",transition:"background .12s",cursor:"pointer"}} onClick={()=>openClientModal(c)} onMouseEnter={e=>e.currentTarget.style.background="#161b2a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:9,fontFamily:"monospace",color:"#5a6478"}}>{c.id.slice(0,8)}…</span></td>
                <td style={{padding:"11px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:7,background:pal.bg,color:pal.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{initials(c.name)}</div><div><div style={{fontSize:12,fontWeight:500,color:"#e8eaf0"}}><Highlight text={c.name} term={rawQuery}/></div>{(c.tags||[]).length>0&&<div style={{display:"flex",gap:3,marginTop:2,flexWrap:"wrap"}}>{c.tags.map(t=><TagPill key={t} label={t}/>)}</div>}</div></div></td>
                <td style={{padding:"11px 14px",fontSize:12,color:"#8892a4"}}><Highlight text={c.company||"—"} term={rawQuery}/></td>
                <td style={{padding:"11px 14px",fontSize:11,color:"#5a6478",fontFamily:"monospace"}}><Highlight text={c.email||""} term={rawQuery}/></td>
                <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}><Badge colorKey={ps.badge} label={ps.label}/></td>
                <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}><Badge colorKey={prs.badge} label={prs.label}/></td>
                <td style={{padding:"11px 14px",fontSize:12,color:"#22c97d",fontFamily:"monospace",fontWeight:600}}>{formatCurrency(c.projectValue)}</td>
                <td style={{padding:"11px 14px",fontSize:11,color:"#5a6478",fontFamily:"monospace"}}>{formatDate(c.endDate)}</td>
                <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:6}}>
                  <button onClick={()=>openEdit(c)} title="Editar" style={{width:28,height:28,borderRadius:6,background:"rgba(79,110,247,.1)",border:"1px solid rgba(79,110,247,.2)",color:"#4f6ef7",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={12}/></button>
                  <button onClick={()=>setConfirmId(c.id)} title="Deletar" style={{width:28,height:28,borderRadius:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={12}/></button>
                </div></td>
              </tr>
            })}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={perPage} onPage={p=>{setPage(p);window.scrollTo(0,0)}} onPerPage={setPerPage}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{to{background-position:-400% 0}}`}</style>
    </div>
  )
}

function ReportsView({clients,deals}) {
  const wonDeals=useMemo(()=>deals.filter(d=>d.stage==="fechado"),[deals])
  const convRate=deals.length>0?Math.round((wonDeals.length/deals.length)*100):0
  const avgTicket=wonDeals.length>0?wonDeals.reduce((s,d)=>s+d.value,0)/wonDeals.length:0
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Total clientes" value={clients.length}/><StatCard label="Negociações fechadas" value={wonDeals.length}/><StatCard label="Taxa conversão" value={`${convRate}%`}/><StatCard label="Ticket médio" value={formatCurrency(avgTicket)}/>
      </div>
      <Card title="Distribuição por status de pagamento">
        {Object.entries(PAYMENT_STATUS).map(([key,s])=>{
          const count=clients.filter(c=>(c.paymentStatus||"pendente")===key).length
          const pct=clients.length>0?Math.round((count/clients.length)*100):0
          return <div key={key} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5,fontWeight:500}}><span style={{color:"#8892a4"}}>{s.label}</span><span style={{color:"#5a6478",fontFamily:"monospace"}}>{count} ({pct}%)</span></div><div style={{height:6,background:"#1c2236",borderRadius:10,overflow:"hidden"}}><motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.6,ease:"easeOut"}} style={{height:"100%",background:BADGE_COLOR[s.badge]?.color??"#8892a4",borderRadius:10}}/></div></div>
        })}
      </Card>
    </div>
  )
}

// ── NOTIFICAÇÕES REAIS ─────────────────────────────────────────────
const NOTIF_META={
  success:{icon:"✓",color:"#22c97d"},warning:{icon:"⚠",color:"#f59e0b"},
  error:{icon:"✕",color:"#ef4444"},info:{icon:"ℹ",color:"#4f6ef7"},
  finance:{icon:"$",color:"#22c97d"},task:{icon:"✓",color:"#a78bfa"},
}

function NotificationsView({user}) {
  const [notifs,setNotifs]=useState([]); const [loading,setLoading]=useState(true); const [marking,setMarking]=useState(false)
  useEffect(()=>{if(user?.id)load()},[user?.id])
  async function load(){setLoading(true);try{setNotifs(await fetchNotifications(user.id))}catch(e){console.error(e)}finally{setLoading(false)}}
  async function handleMarkAll(){
    setMarking(true)
    try{await markAllAsRead(user.id);setNotifs(prev=>prev.map(n=>({...n,is_read:true})))}
    finally{setMarking(false)}
  }
  async function handleMarkOne(id){
    await markOneAsRead(id); setNotifs(prev=>prev.map(n=>n.id===id?{...n,is_read:true}:n))
  }
  const unread=notifs.filter(n=>!n.is_read).length
  return (
    <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#e8eaf0"}}>Central de notificações</div>
          {unread>0&&<span style={{background:"rgba(79,110,247,.15)",color:"#4f6ef7",fontSize:9,fontFamily:"monospace",fontWeight:700,padding:"2px 7px",borderRadius:20,border:"1px solid rgba(79,110,247,.25)"}}>{unread} não lida{unread!==1?"s":""}</span>}
        </div>
        {unread>0&&<button onClick={handleMarkAll} disabled={marking} style={{fontSize:11,background:"rgba(79,110,247,.08)",border:"1px solid rgba(79,110,247,.2)",color:"#4f6ef7",padding:"5px 12px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",opacity:marking?.6:1}}>{marking?"Marcando…":"Marcar todas como lidas"}</button>}
      </div>
      {loading?(
        <div style={{padding:"48px 0",textAlign:"center"}}><div style={{width:20,height:20,borderRadius:"50%",border:"2px solid rgba(79,110,247,.3)",borderTopColor:"#4f6ef7",animation:"spin .6s linear infinite",margin:"0 auto"}}/></div>
      ):notifs.length===0?(
        <div style={{padding:"48px 16px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>🔔</div><div style={{fontSize:13,color:"#5a6478"}}>Nenhuma notificação ainda</div><div style={{fontSize:11,color:"#3a4255",marginTop:4}}>As ações do sistema aparecerão aqui</div></div>
      ):notifs.map((n,i)=>{
        const meta=NOTIF_META[n.type]??NOTIF_META.info
        return <div key={n.id} onClick={()=>!n.is_read&&handleMarkOne(n.id)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 16px",borderBottom:i<notifs.length-1?"1px solid rgba(255,255,255,.04)":"none",background:n.is_read?"transparent":"rgba(79,110,247,.03)",cursor:n.is_read?"default":"pointer",transition:"background .15s"}} onMouseEnter={e=>{if(!n.is_read)e.currentTarget.style.background="rgba(79,110,247,.06)"}} onMouseLeave={e=>{if(!n.is_read)e.currentTarget.style.background="rgba(79,110,247,.03)"}}>
          <div style={{position:"relative",flexShrink:0}}><div style={{width:32,height:32,borderRadius:8,background:meta.color+"18",color:meta.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{meta.icon}</div>{!n.is_read&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:"#4f6ef7",border:"2px solid #111520"}}/>}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:n.is_read?400:500,color:n.is_read?"#8892a4":"#e8eaf0"}}>{n.title}</div>{n.message&&<div style={{fontSize:11,color:"#5a6478",marginTop:2,lineHeight:1.4}}>{n.message}</div>}<div style={{fontSize:9,color:"#3a4255",fontFamily:"monospace",marginTop:4}}>{relativeTime(n.created_at)}</div></div>
          {!n.is_read&&<div style={{fontSize:9,color:"#4f6ef7",fontFamily:"monospace",flexShrink:0,marginTop:2}}>clique p/ ler</div>}
        </div>
      })}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── CONFIGURAÇÕES ──────────────────────────────────────────────────
function SettingsView({user,onLogout}) {
  const [toggles,setToggles]=useState({emailNotif:true,dealAlerts:true,weeklyReport:false,twoFactor:false,webhook:true})
  const [companyName,setCompanyName]=useState(user?.user_metadata?.company_name||"")
  const [timezone,setTimezone]=useState("America/Sao_Paulo")
  const [editingCompany,setEditingCompany]=useState(false)
  const displayName=user?.user_metadata?.full_name||user?.email?.split("@")[0]||"Usuário"

  function Toggle({k}) {
    return <div onClick={()=>setToggles(p=>({...p,[k]:!p[k]}))} style={{width:36,height:20,borderRadius:20,background:toggles[k]?"#4f6ef7":"#1c2236",border:`1px solid ${toggles[k]?"#4f6ef7":"rgba(255,255,255,.1)"}`,position:"relative",cursor:"pointer",transition:"all .2s",flexShrink:0}}><div style={{position:"absolute",top:2,left:toggles[k]?16:2,width:14,height:14,borderRadius:"50%",background:toggles[k]?"#fff":"#5a6478",transition:"left .2s"}}/></div>
  }
  function Section({icon,title,children}) {
    return <div style={{background:"#111520",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,overflow:"hidden",marginBottom:12}}><div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:11,fontWeight:600,color:"#e8eaf0",display:"flex",alignItems:"center",gap:8}}><span>{icon}</span> {title}</div>{children}</div>
  }
  function Row({label,desc,right}) {
    return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.03)"}}><div><div style={{fontSize:12,fontWeight:500,color:"#e8eaf0"}}>{label}</div>{desc&&<div style={{fontSize:10,color:"#5a6478",marginTop:2}}>{desc}</div>}</div>{right}</div>
  }

  return (
    <div>
      <Section icon="👤" title="Minha conta">
        <Row label="Nome" desc="Nome de exibição" right={<span style={{fontSize:12,color:"#e8eaf0",fontFamily:"monospace"}}>{displayName}</span>}/>
        <Row label="Email" desc="Conta autenticada" right={<span style={{fontSize:11,color:"#5a6478",fontFamily:"monospace"}}>{user?.email}</span>}/>
        <Row label="ID do usuário" desc="Identificador único" right={<span style={{fontSize:9,color:"#5a6478",fontFamily:"monospace"}}>{user?.id?.slice(0,20)}…</span>}/>
        <Row label="Logout" desc="Encerrar sessão atual" right={<button onClick={onLogout} style={{padding:"5px 12px",borderRadius:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Sair</button>}/>
      </Section>

      <Section icon="🏢" title="Empresa">
        <Row label="Nome da empresa" desc="Usado no sistema"
          right={editingCompany
            ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={companyName} onChange={e=>setCompanyName(e.target.value)} style={{background:"#161b2a",border:"1px solid rgba(79,110,247,.3)",borderRadius:6,padding:"4px 8px",fontSize:12,color:"#e8eaf0",fontFamily:"inherit",outline:"none",width:140}}/>
                <button onClick={()=>setEditingCompany(false)} style={{padding:"4px 10px",borderRadius:6,background:"#4f6ef7",border:"none",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Salvar</button>
              </div>
            : <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#e8eaf0",fontFamily:"monospace"}}>{companyName||"—"}</span>
                <button onClick={()=>setEditingCompany(true)} style={{padding:"3px 8px",borderRadius:5,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#8892a4",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Editar</button>
              </div>
          }
        />
        <Row label="Fuso horário" desc="Horário do sistema"
          right={<select value={timezone} onChange={e=>setTimezone(e.target.value)} style={{background:"#161b2a",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"4px 8px",fontSize:11,color:"#e8eaf0",fontFamily:"monospace",outline:"none",cursor:"pointer"}}>
            <option value="America/Sao_Paulo">America/São_Paulo</option>
            <option value="America/Manaus">America/Manaus</option>
            <option value="America/Belem">America/Belém</option>
            <option value="America/Fortaleza">America/Fortaleza</option>
          </select>}
        />
        <Row label="Plano" right={<Badge colorKey="purple" label="Pro"/>}/>
      </Section>

      <Section icon="🔔" title="Notificações">
        <Row label="Por email" desc="Resumo diário" right={<Toggle k="emailNotif"/>}/>
        <Row label="Alertas de negociações" desc="Ao fechar uma negociação" right={<Toggle k="dealAlerts"/>}/>
        <Row label="Relatório semanal" desc="Toda segunda-feira" right={<Toggle k="weeklyReport"/>}/>
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
const pageVariants={
  initial:{opacity:0,y:8},
  animate:{opacity:1,y:0,transition:{duration:.2}},
  exit:{opacity:0,y:-6,transition:{duration:.14}},
}

// ═══════════════════════════════════════════════════════════════════
// 9. APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const {user,loading:authLoading,error:authError,login,register,logout,setError}=useAuth()
  const {toasts,addToast,removeToast}=useToast()
  const [activeTab,setActiveTab]=useState("dashboard")
  const [paletteOpen,setPaletteOpen]=useState(false)
  const [detailClient,setDetailClient]=useState(null)
  const [dataLoading,setDataLoading]=useState(false)
  const [clients,setClients]=useState([])
  const [deals,setDeals]=useState([])
  const [tasks,setTasks]=useState([])
  const [unreadCount,setUnreadCount]=useState(0)

  useDataLoader(user,setClients,setDeals,setTasks)

  // Carrega contagem de não lidas para badge na sidebar
  useEffect(()=>{
    if(!user?.id) return
    fetchNotifications(user.id).then(data=>setUnreadCount(data.filter(n=>!n.is_read).length)).catch(()=>{})
  },[user?.id])

  // Cria notificação real no Supabase
  async function notify({title,message,type="info"}) {
    if(!user?.id) return
    await createNotification({userId:user.id,title,message,type})
    setUnreadCount(p=>p+1)
  }

  useEffect(()=>{
    function handleKey(e){
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setPaletteOpen(v=>!v);return}
      if(e.key==="Escape"){setPaletteOpen(false);setDetailClient(null);return}
      if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return
      if(e.key==="1")setActiveTab("dashboard")
      if(e.key==="2")setActiveTab("pipeline")
      if(e.key==="3")setActiveTab("clients")
      if(e.key==="4")setActiveTab("kanban")
      if(e.key==="5")setActiveTab("tasks")
    }
    window.addEventListener("keydown",handleKey)
    return ()=>window.removeEventListener("keydown",handleKey)
  },[])

  async function addActivity(clientId) {
    const text=window.prompt("Descreva a atividade:"); if(!text) return
    const newAct={id:`a${Date.now()}`,type:"note",text,date:new Date().toISOString().split("T")[0],user:user.email}
    const client=clients.find(c=>c.id===clientId); if(!client) return
    const updatedActivities=[...(client.activities||[]),newAct]
    setClients(prev=>prev.map(c=>c.id===clientId?{...c,activities:updatedActivities}:c))
    setDetailClient(prev=>prev?.id===clientId?{...prev,activities:updatedActivities}:prev)
    try{await updateClient(clientId,{activities:updatedActivities});addToast("Atividade registrada.","success")}
    catch{addToast("Erro ao registrar atividade.","error")}
  }

  function openClientModal(c){setDetailClient(c)}
  function openEditFromModal(c){setDetailClient(null);setActiveTab("clients");setTimeout(()=>window.dispatchEvent(new CustomEvent("crm:editClient",{detail:c})),100)}

  const badgeCounts=useMemo(()=>({
    clients:clients.length,
    deals:deals.filter(d=>d.stage!=="fechado").length,
    projects:clients.filter(c=>c.projectStatus==="andamento").length,
    pendingTasks:tasks.filter(t=>!t.done).length,
    unreadNotifs:unreadCount,
  }),[clients,deals,tasks,unreadCount])

  if(authLoading) return (
    <div style={{minHeight:"100vh",background:"#0a0d14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#4f6ef7,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff"}}>D</div>
      <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid rgba(79,110,247,.3)",borderTopColor:"#4f6ef7",animation:"spin .6s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if(!user) return <><LoginPage onLogin={login} onRegister={register} loading={authLoading} error={authError} clearError={()=>setError("")}/><ToastContainer toasts={toasts} removeToast={removeToast}/></>

  const meta=PAGE_META[activeTab]??{title:activeTab,sub:""}
  const displayName=user.user_metadata?.full_name||user.email?.split("@")[0]||"Admin"

  return (
    <div style={{display:"flex",height:"100vh",background:"#0a0d14",overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>
      <AnimatePresence>{paletteOpen&&<CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} clients={clients} setActiveTab={setActiveTab} openClientModal={openClientModal}/>}</AnimatePresence>
      <AnimatePresence>{detailClient&&<ClientDetailModal client={detailClient} onClose={()=>setDetailClient(null)} onEdit={openEditFromModal} onAddActivity={addActivity}/>}</AnimatePresence>

      {/* SIDEBAR */}
      <aside style={{width:220,minWidth:220,background:"#111520",borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",flexDirection:"column",padding:"20px 0",height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:600,color:"#e8eaf0",letterSpacing:"-.3px"}}>Decillion</div>
          <div style={{fontSize:10,color:"#3a4255",marginTop:2,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".8px"}}>Manager v3.0</div>
        </div>
        <div style={{padding:"0 12px",marginBottom:8}}>
          <button onClick={()=>setPaletteOpen(true)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"#161b2a",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer",color:"#5a6478",fontSize:11,fontFamily:"inherit"}}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={12}/>
            <span style={{flex:1,textAlign:"left"}}>Buscar…</span>
            <span style={{fontSize:9,fontFamily:"monospace",background:"#1c2236",border:"1px solid rgba(255,255,255,.07)",padding:"1px 5px",borderRadius:3}}>⌘K</span>
          </button>
        </div>
        {NAV_SECTIONS.map(section=>(
          <div key={section.label} style={{padding:"0 12px",marginBottom:4}}>
            <div style={{fontSize:9,color:"#3a4255",textTransform:"uppercase",letterSpacing:1,fontWeight:600,padding:"8px 8px 6px",fontFamily:"monospace"}}>{section.label}</div>
            {section.items.map(({id,label,icon,badgeKey})=>{
              const active=activeTab===id; const badgeCount=badgeKey?badgeCounts[badgeKey]:undefined
              return <button key={id} onClick={()=>setActiveTab(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,cursor:"pointer",fontSize:12.5,fontWeight:400,border:"none",textAlign:"left",marginBottom:1,fontFamily:"inherit",background:active?"#4f6ef7":"transparent",color:active?"#fff":"#8892a4",transition:"all .15s"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#161b2a";e.currentTarget.style.color="#e8eaf0"}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#8892a4"}}}>
                <Icon d={icon} size={14}/><span style={{flex:1}}>{label}</span>
                {badgeCount!==undefined&&badgeCount>0&&<span style={{background:active?"rgba(255,255,255,.2)":"#1c2236",border:`1px solid ${active?"rgba(255,255,255,.25)":"rgba(255,255,255,.08)"}`,borderRadius:20,padding:"1px 6px",fontSize:9,fontFamily:"monospace",color:active?"rgba(255,255,255,.8)":"#5a6478"}}>{badgeCount}</span>}
              </button>
            })}
          </div>
        ))}
        <div style={{padding:"0 12px",marginTop:8}}>
          <div style={{fontSize:9,color:"#3a4255",fontFamily:"monospace",lineHeight:1.8,padding:"8px 10px",background:"#0d1018",borderRadius:8,border:"1px solid rgba(255,255,255,.04)"}}>
            {[["1","Dashboard"],["2","Pipeline"],["3","Clientes"],["4","Kanban"],["5","Tarefas"]].map(([k,l])=><div key={k} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#5a6478"}}>{l}</span><span style={{background:"#161b2a",padding:"0 4px",borderRadius:3}}>{k}</span></div>)}
          </div>
        </div>
        <div style={{marginTop:"auto",padding:"16px 12px 0",borderTop:"1px solid rgba(255,255,255,.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:"#161b2a",border:"1px solid rgba(255,255,255,.06)",marginBottom:6}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#4f6ef7,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:"#fff",flexShrink:0}}>{initials(displayName)}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:"#e8eaf0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div><div style={{fontSize:9,color:"#3a4255",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div></div>
          </div>
          <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:"transparent",border:"none",cursor:"pointer",color:"#5a6478",fontSize:12,fontFamily:"inherit",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,.08)";e.currentTarget.style.color="#ef4444"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#5a6478"}}>
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={13}/>Sair da conta
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
        <div style={{padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12,background:"#111520",flexShrink:0}}>
          <div><div style={{fontSize:14,fontWeight:600,color:"#e8eaf0"}}>{meta.title}</div><div style={{fontSize:11,color:"#5a6478",marginTop:1}}>{meta.sub}</div></div>
          {dataLoading&&<div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#5a6478",fontFamily:"monospace"}}><div style={{width:10,height:10,borderRadius:"50%",border:"1.5px solid rgba(79,110,247,.3)",borderTopColor:"#4f6ef7",animation:"spin .6s linear infinite"}}/>Carregando…</div>}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setPaletteOpen(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"inherit",border:"1px solid rgba(255,255,255,.08)",background:"#161b2a",color:"#8892a4"}}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={12}/>Buscar
              <span style={{fontSize:9,fontFamily:"monospace",background:"#1c2236",border:"1px solid rgba(255,255,255,.07)",padding:"1px 4px",borderRadius:3}}>⌘K</span>
            </button>
            <button onClick={()=>setActiveTab("clients")} style={{padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:"none",background:"#4f6ef7",color:"#fff"}}>+ Novo cliente</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {activeTab==="dashboard"     && <DashboardView clients={clients} deals={deals}/>}
              {activeTab==="pipeline"      && <PipelineView deals={deals} setDeals={setDeals} addToast={addToast} user={user}/>}
              {activeTab==="clients"       && <ClientsView clients={clients} setClients={setClients} addToast={addToast} openClientModal={openClientModal} user={user} dataLoading={dataLoading} onNotify={notify}/>}
              {activeTab==="kanban"        && <KanbanPage addToast={addToast}/>}
              {activeTab==="tasks"         && <TasksPage user={user} addToast={addToast}/>}
              {activeTab==="finance"       && <FinancePage clients={clients}/>}
              {activeTab==="reports"       && <ReportsView clients={clients} deals={deals}/>}
              {activeTab==="notifications" && <NotificationsView user={user}/>}
              {activeTab==="settings"      && <SettingsView user={user} onLogout={logout}/>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
