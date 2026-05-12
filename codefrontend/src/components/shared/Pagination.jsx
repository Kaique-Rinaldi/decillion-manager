export default function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1 && total <= 10) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  const btnStyle = (active) => ({
    minWidth: 28, height: 28, borderRadius: 6, border: '1px solid',
    borderColor: active ? '#4f6ef7' : 'rgba(255,255,255,.08)',
    background:  active ? '#4f6ef7' : 'transparent',
    color:       active ? '#fff'    : '#8892a4',
    fontSize: 11, cursor: active ? 'default' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'monospace', transition: 'all .12s',
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.05)',
    }}>
      <div style={{ fontSize: 10, color: '#5a6478', fontFamily: 'monospace' }}>
        {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={{ ...btnStyle(false), opacity: page === 1 ? .3 : 1 }}
        >←</button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#5a6478', fontSize: 11 }}>…</span>
            : <button key={p} onClick={() => onPage(p)} style={btnStyle(p === page)}>{p}</button>
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          style={{ ...btnStyle(false), opacity: page === totalPages ? .3 : 1 }}
        >→</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#5a6478', fontFamily: 'monospace' }}>
        por pág:
        {[10, 25, 50].map(n => (
          <button
            key={n}
            onClick={() => { onPerPage(n); onPage(1) }}
            style={{
              ...btnStyle(perPage === n),
              minWidth: 28, height: 22, fontSize: 10,
            }}
          >{n}</button>
        ))}
      </div>
    </div>
  )
}