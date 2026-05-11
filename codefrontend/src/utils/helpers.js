// ─── FORMATTERS ───────────────────────────────────────────────────────────────

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(Number(value) || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatPhone(phone) {
  return phone || '—'
}

export function initials(name) {
  if (!name) return '??'
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

export function isOverdue(endDate) {
  if (!endDate) return false
  return new Date(endDate) < new Date() 
}

export function daysLeft(endDate) {
  if (!endDate) return null
  const diff = new Date(endDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── AVATAR PALETTE ───────────────────────────────────────────────────────────

const PALETTES = [
  { bg: '#dbeafe', color: '#1e40af' },
  { bg: '#dcfce7', color: '#166534' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#ede9fe', color: '#5b21b6' },
  { bg: '#fee2e2', color: '#991b1b' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#ecfdf5', color: '#065f46' },
  { bg: '#fff7ed', color: '#9a3412' },
]

export function avatarPalette(name) {
  if (!name) return PALETTES[0]
  const idx = name.charCodeAt(0) % PALETTES.length
  return PALETTES[idx]
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

export function validateClientForm(data) {
  const errors = {}

  if (!data.name?.trim()) errors.name = 'Nome é obrigatório'
  if (!data.email?.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email inválido'
  }
  if (!data.phone?.trim()) errors.phone = 'Telefone é obrigatório'
  if (!data.projectValue || Number(data.projectValue) <= 0) {
    errors.projectValue = 'Valor deve ser maior que zero'
  }
  if (!data.paymentStatus) errors.paymentStatus = 'Selecione o status de pagamento'
  if (!data.projectStatus) errors.projectStatus = 'Selecione o status do projeto'
  if (!data.startDate) errors.startDate = 'Data de início é obrigatória'
  if (!data.endDate) errors.endDate = 'Data final é obrigatória'
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = 'Data final deve ser após o início'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}