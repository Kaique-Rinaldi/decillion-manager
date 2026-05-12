export default function TagPill({ label }) {
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 7px', borderRadius: 20,
      fontSize: 9, fontFamily: 'monospace',
      border: '1px solid rgba(255,255,255,.1)',
      color: '#8892a4', background: '#161b2a',
    }}>
      {label}
    </span>
  )
}