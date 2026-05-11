// ─── SEED DATA (used only when localStorage is empty) ────────────────────────
export const SEED_CLIENTS = [
  {
    id: 'client_001',
    name: 'Marina Alves',
    email: 'marina@digitalstudio.com.br',
    phone: '(11) 98765-4321',
    company: 'Digital Studio',
    projectValue: 8500,
    paymentStatus: 'pago',
    projectStatus: 'concluido',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    notes: 'Redesign completo do site institucional. Cliente satisfeito.',
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'client_002',
    name: 'Carlos Mendonça',
    email: 'carlos@techsolutions.com',
    phone: '(11) 91234-5678',
    company: 'Tech Solutions Ltda',
    projectValue: 14200,
    paymentStatus: 'pendente',
    projectStatus: 'andamento',
    startDate: '2024-03-15',
    endDate: '2024-07-15',
    notes: 'Sistema de gestão interno. Em desenvolvimento.',
    createdAt: '2024-03-15T09:00:00.000Z',
  },
  {
    id: 'client_003',
    name: 'Beatriz Costa',
    email: 'bia@modaverde.com.br',
    phone: '(21) 97654-3210',
    company: 'Moda Verde',
    projectValue: 5800,
    paymentStatus: 'atrasado',
    projectStatus: 'andamento',
    startDate: '2024-01-10',
    endDate: '2024-03-10',
    notes: 'E-commerce de moda sustentável. Entrega atrasada.',
    createdAt: '2024-01-10T14:00:00.000Z',
  },
  {
    id: 'client_004',
    name: 'Rafael Torres',
    email: 'rafael@grupoalphabr.com',
    phone: '(51) 99876-5432',
    company: 'Grupo Alpha',
    projectValue: 22000,
    paymentStatus: 'pago',
    projectStatus: 'concluido',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    notes: 'Plataforma SaaS de gestão. Entregue no prazo.',
    createdAt: '2023-11-01T08:00:00.000Z',
  },
  {
    id: 'client_005',
    name: 'Juliana Neves',
    email: 'ju@inovacaolab.io',
    phone: '(41) 98123-7654',
    company: 'Inovação Lab',
    projectValue: 9300,
    paymentStatus: 'pendente',
    projectStatus: 'cancelado',
    startDate: '2024-04-01',
    endDate: '2024-06-01',
    notes: 'App mobile de delivery. Projeto cancelado pelo cliente.',
    createdAt: '2024-04-01T11:00:00.000Z',
  },
]

// ─── ADMIN CREDENTIALS (mock) ─────────────────────────────────────────────
export const ADMIN_CREDENTIALS = {
  email: 'admin@decillion.com',
  password: 'admin123',
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  pendente: { label: 'Pendente', badge: 'badge-amber' },
  pago:     { label: 'Pago',     badge: 'badge-green' },
  atrasado: { label: 'Atrasado', badge: 'badge-red'   },
}

export const PROJECT_STATUS = {
  andamento: { label: 'Em andamento', badge: 'badge-blue'   },
  concluido: { label: 'Concluído',    badge: 'badge-green'  },
  cancelado: { label: 'Cancelado',    badge: 'badge-gray'   },
}