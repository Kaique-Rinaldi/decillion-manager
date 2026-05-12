export default function TableSkeleton({ rows = 5, cols = 9 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} style={{ padding: '12px 14px' }}>
              <div style={{
                height: 12, borderRadius: 6,
                width: c === 0 ? 60 : c === 1 ? 120 : c === 8 ? 60 : 90,
                background: 'linear-gradient(90deg, #161b2a 25%, #1c2236 50%, #161b2a 75%)',
                backgroundSize: '400% 100%',
                animation: 'shimmer 1.4s ease infinite',
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}