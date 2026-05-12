// ─── TEXT ─────────────────────────────────────────────────────────────────────
export function normalize(str = '') {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function initials(name = '') {
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// ─── FORMATTING ───────────────────────────────────────────────────────────────
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
}

export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30)  return `há ${days} dias`
  if (days < 365) return `há ${Math.floor(days / 30)} meses`
  return `há ${Math.floor(days / 365)} anos`
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: 'rgba(79,110,247,.15)',  fg: '#4f6ef7' },
  { bg: 'rgba(167,139,250,.15)', fg: '#a78bfa' },
  { bg: 'rgba(34,201,125,.15)',  fg: '#22c97d' },
  { bg: 'rgba(245,158,11,.15)',  fg: '#f59e0b' },
  { bg: 'rgba(236,72,153,.15)',  fg: '#ec4899' },
]

export function avatarColor(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[idx]
}

export function progressBarColor(status) {
  if (status === 'concluido') return '#22c97d'
  if (status === 'cancelado') return '#ef4444'
  return '#4f6ef7'
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
export function buildHaystack(c) {
  return normalize([
    c.id, c.name, c.email, c.company, c.phone,
    c.projectName, c.projectOwner,
    c.projectStatus, c.paymentStatus,
    c.projectValue, c.notes,
    ...(c.tags ?? []),
  ].filter(Boolean).join(' '))
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
export function validateClientForm(form) {
  const errors = {}
  if (!form.name?.trim())        errors.name         = 'Nome obrigatório'
  if (!form.email?.trim())       errors.email        = 'Email obrigatório'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
  if (!form.phone?.trim())       errors.phone        = 'Telefone obrigatório'
  if (!form.projectValue || Number(form.projectValue) <= 0) errors.projectValue = 'Valor deve ser > 0'
  if (!form.paymentStatus)       errors.paymentStatus = 'Selecione'
  if (!form.projectStatus)       errors.projectStatus = 'Selecione'
  if (!form.startDate)           errors.startDate    = 'Data obrigatória'
  if (!form.endDate)             errors.endDate      = 'Data obrigatória'
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = 'Deve ser após o início'
  if (!form.projectName?.trim()) errors.projectName  = 'Nome do projeto obrigatório'
  if (!form.projectOwner?.trim()) errors.projectOwner = 'Responsável obrigatório'
  return { errors, isValid: Object.keys(errors).length === 0 }
}