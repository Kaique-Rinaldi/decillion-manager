export default function Card({ title, sub, children, style = {} }) {
  return (
    <div style={{
      background: '#111520', border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 12, padding: 16, ...style,
    }}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e8eaf0' }}>{title}</div>
          {sub && <div style={{ fontSize: 10, color: '#5a6478', marginTop: 2 }}>{sub}</div>}
        </div>
      )}
      {children}
    </div>
  )
}