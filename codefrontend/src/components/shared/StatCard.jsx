import Icon from './Icon'

const BADGE_COLOR = {
  green:  { color: '#22c97d' },
  amber:  { color: '#f59e0b' },
  red:    { color: '#ef4444' },
  blue:   { color: '#4f6ef7' },
  purple: { color: '#a78bfa' },
  gray:   { color: '#8892a4' },
}

export default function StatCard({ label, value, delta, deltaType = 'up', iconPath, iconColor }) {
  const ic = BADGE_COLOR[iconColor]?.color ?? '#4f6ef7'
  return (
    <div style={{
      background: '#111520', border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 12, padding: 16,
    }}>
      {iconPath && (
        <div style={{
          float: 'right', width: 32, height: 32, borderRadius: 8,
          background: ic + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ic,
        }}>
          <Icon d={iconPath} size={15} />
        </div>
      )}
      <div style={{
        fontSize: 10, color: '#5a6478', textTransform: 'uppercase',
        letterSpacing: '.8px', fontFamily: 'monospace', marginBottom: 10,
      }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: '#e8eaf0', letterSpacing: -1 }}>{value}</div>
      {delta && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8,
          fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4,
          background: deltaType === 'up' ? 'rgba(34,201,125,.1)' : 'rgba(239,68,68,.1)',
          color:      deltaType === 'up' ? '#22c97d'             : '#ef4444',
        }}>
          {deltaType === 'up' ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  )
}