// ─── STATUS CONFIGS ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  pendente: { label: 'Pendente', badge: 'amber' },
  pago:     { label: 'Pago',     badge: 'green' },
  atrasado: { label: 'Atrasado', badge: 'red'   },
}

export const PROJECT_STATUS = {
  andamento: { label: 'Em andamento', badge: 'blue'  },
  concluido: { label: 'Concluído',    badge: 'green' },
  cancelado: { label: 'Cancelado',    badge: 'gray'  },
}

export const PIPELINE_STAGE = {
  lead:     { label: 'Lead',       color: '#60a5fa', order: 0 },
  contato:  { label: 'Contactado', color: '#a78bfa', order: 1 },
  proposta: { label: 'Proposta',   color: '#f59e0b', order: 2 },
  negoc:    { label: 'Negociação', color: '#ec4899', order: 3 },
  fechado:  { label: 'Fechado ✓',  color: '#22c97d', order: 4 },
}
export const PIPELINE_STAGE_KEYS = ['lead','contato','proposta','negoc','fechado']

export const KANBAN_COLS = {
  backlog:   { label: 'Backlog',       color: '#8892a4' },
  andamento: { label: 'Em andamento',  color: '#4f6ef7' },
  review:    { label: 'Em revisão',    color: '#f59e0b' },
  concluido: { label: 'Concluído',     color: '#22c97d' },
}
export const KANBAN_COL_KEYS = ['backlog','andamento','review','concluido']

export const PROGRESS_BY_STATUS = { andamento: 45, concluido: 100, cancelado: 0 }

export const ACTIVITY_ICON = {
  created:  { icon: '＋', color: '#4f6ef7' },
  payment:  { icon: '$',  color: '#22c97d' },
  status:   { icon: '◎',  color: '#a78bfa' },
  note:     { icon: '✎',  color: '#f59e0b' },
  comment:  { icon: '✉',  color: '#60a5fa' },
}

export const NAV_SECTIONS = [
  { label: 'Principal', items: [
    { id: 'dashboard', label: 'Dashboard',    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { id: 'pipeline',  label: 'Pipeline CRM', icon: 'M4 6h16M4 12h16M4 18h16', badgeKey: 'deals' },
    { id: 'clients',   label: 'Clientes',     icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', badgeKey: 'clients' },
    { id: 'kanban',    label: 'Kanban',        icon: 'M3 3h5v18H3zM9 3h6v18H9zM16 3h5v18h-5z', badgeKey: 'projects' },
    { id: 'tasks',     label: 'Tarefas',       icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', badgeKey: 'pendingTasks' },
  ]},
  { label: 'Financeiro', items: [
    { id: 'finance',  label: 'Financeiro', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2' },
    { id: 'reports',  label: 'Relatórios', icon: 'M18 20V10M12 20V4M6 20v-6' },
  ]},
  { label: 'Sistema', items: [
    { id: 'notifications', label: 'Notificações',  icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
    { id: 'settings',      label: 'Configurações', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ]},
]

export const PAGE_META = {
  dashboard:     { title: 'Dashboard',      sub: 'Visão geral do sistema'      },
  pipeline:      { title: 'Pipeline CRM',   sub: 'Kanban de oportunidades'     },
  clients:       { title: 'Clientes',       sub: 'Base de contatos e contas'   },
  kanban:        { title: 'Kanban',         sub: 'Quadro de projetos'          },
  tasks:         { title: 'Tarefas',        sub: 'Gerenciamento de atividades' },
  finance:       { title: 'Financeiro',     sub: 'Receitas e pagamentos'       },
  reports:       { title: 'Relatórios',     sub: 'Análises e métricas'         },
  notifications: { title: 'Notificações',   sub: 'Central de alertas'          },
  settings:      { title: 'Configurações',  sub: 'Preferências do sistema'     },
}

