import Icon from '../components/shared/Icon'

export default function Topbar({ meta, dataLoading, onOpenPalette, onNewClient }) {
  return (
    <div style={{
      padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,.06)',
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#111520', flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0' }}>{meta.title}</div>
        <div style={{ fontSize: 11, color: '#5a6478', marginTop: 1 }}>{meta.sub}</div>
      </div>

      {dataLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#5a6478', fontFamily: 'monospace' }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            border: '1.5px solid rgba(79,110,247,.3)', borderTopColor: '#4f6ef7',
            animation: 'spin .6s linear infinite',
          }} />
          Carregando…
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onOpenPalette}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            border: '1px solid rgba(255,255,255,.08)', background: '#161b2a', color: '#8892a4',
          }}
        >
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={12} />
          Buscar
          <span style={{
            fontSize: 9, fontFamily: 'monospace', background: '#1c2236',
            border: '1px solid rgba(255,255,255,.07)', padding: '1px 4px', borderRadius: 3,
          }}>⌘K</span>
        </button>
        <button
          onClick={onNewClient}
          style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', border: 'none',
            background: '#4f6ef7', color: '#fff',
          }}
        >
          + Novo cliente
        </button>
      </div>
    </div>
  )
}