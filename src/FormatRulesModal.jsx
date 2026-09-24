import { useEffect, useRef } from 'react'

// A pop-up showing one format's rules. Rendered once, controlled by whichever
// row last asked to show a format (passed in as `format`, or null when closed).
export default function FormatRulesModal({ format, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!format) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [format, onClose])

  if (!format) return null

  return (
    <div
      className="rules-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${format.name} rules`}
      onClick={onClose}
    >
      <div className="rules-modal-card" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="rules-modal-close"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <p className="tier-label">Format rules</p>
        <h3 className="tier-name">{format.name}</h3>
        <p className="rules-modal-text">{format.rules}</p>
      </div>
    </div>
  )
}
