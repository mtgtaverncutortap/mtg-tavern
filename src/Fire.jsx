// Decorative fire pieces. All purely visual, so hidden from screen readers.

export function Flame({ className = '', delay = 0 }) {
  return (
    <svg
      className={`flame ${className}`}
      viewBox="0 0 100 130"
      aria-hidden="true"
      style={{ '--d': `${delay}s` }}
    >
      <path
        className="flame-outer"
        d="M50 0 C58 28 92 46 92 84 C92 112 74 128 50 128 C26 128 8 112 8 84 C8 58 40 44 50 0 Z"
      />
      <path
        className="flame-mid"
        d="M50 30 C57 52 78 62 78 90 C78 110 66 124 50 124 C34 124 22 110 22 90 C22 70 40 60 50 30 Z"
      />
      <path
        className="flame-core"
        d="M50 68 C55 82 65 90 65 104 C65 116 58 124 50 124 C42 124 35 116 35 104 C35 90 45 82 50 68 Z"
      />
    </svg>
  )
}

export function Torch({ delay = 0 }) {
  return (
    <div className="torch" aria-hidden="true">
      <Flame delay={delay} />
      <div className="torch-cup" />
      <div className="torch-stick" />
    </div>
  )
}

const EMBER_COUNT = 26

export function Embers() {
  return (
    <div className="embers" aria-hidden="true">
      {Array.from({ length: EMBER_COUNT }, (_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${(i * 37) % 100}%`,
            '--size': `${2 + (i % 4)}px`,
            '--dur': `${5 + ((i * 7) % 6)}s`,
            '--delay': `${-((i * 13) % 10)}s`,
            '--drift': `${((i % 5) - 2) * 18}px`,
          }}
        />
      ))}
    </div>
  )
}

const HEARTH_FLAMES = 24

export function Hearth() {
  return (
    <div className="hearth" aria-hidden="true">
      {Array.from({ length: HEARTH_FLAMES }, (_, i) => (
        <Flame key={i} delay={-(i * 0.37)} />
      ))}
    </div>
  )
}
