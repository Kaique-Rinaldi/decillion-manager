export default function SortTh({ label, field, sortBy, onSort, style = {} }) {
  const [sortField, sortDir] = sortBy.split('_')
  const active = sortField === field
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '.8px',
        color: active ? '#4f6ef7' : '#5a6478',
        fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,.05)',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style,
      }}
    >
      {label}
      {active
        ? <span style={{ marginLeft: 4, fontSize: 8 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
        : <span style={{ marginLeft: 4, fontSize: 8, opacity: .3 }}>↕</span>
      }
    </th>
  )
}