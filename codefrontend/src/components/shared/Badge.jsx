const BADGE_COLOR = {
  green:  { bg: 'rgba(34,201,125,.12)',  color: '#22c97d' },
  amber:  { bg: 'rgba(245,158,11,.12)',  color: '#f59e0b' },
  red:    { bg: 'rgba(239,68,68,.12)',   color: '#ef4444' },
  blue:   { bg: 'rgba(79,110,247,.12)',  color: '#4f6ef7' },
  purple: { bg: 'rgba(167,139,250,.12)', color: '#a78bfa' },
  gray:   { bg: 'rgba(90,100,120,.15)',  color: '#8892a4' },
}

export default function Badge({ colorKey, label }) {
  const s = BADGE_COLOR[colorKey] ?? BADGE_COLOR.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 5,
      fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
      textTransform: 'uppercase', letterSpacing: '.3px',
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {label}
    </span>
  )
}