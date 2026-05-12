import { normalize } from '../utils/helpers'

export default function Highlight({ text = '', term = '' }) {
  if (!term) return <>{text}</>
  const normText = normalize(text)
  const normTerm = normalize(term)
  const idx = normText.indexOf(normTerm)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: 'rgba(79,110,247,.35)', color: '#e8eaf0',
        borderRadius: 2, padding: '0 1px',
      }}>
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  )
}