import { useEffect, useRef, useState } from 'react'

const urls = import.meta.glob('./assets/photos/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const photoUrl = (name) => urls[`./assets/photos/${name}.jpg`]

// Edit captions and alt text here. Width/height keep the grid from jumping while images load.
const photos = [
  {
    slug: 'magic-mug',
    width: 1200,
    height: 1600,
    caption: 'Tavern tankard',
    alt: 'Close-up of a wooden tankard with a leather Magic: The Gathering crest',
  },
  {
    slug: 'fireplace',
    width: 1600,
    height: 1200,
    caption: 'Warm up by the fire',
    alt: 'Glowing electric fireplace with card collection boxes stored in the drawer below',
  },
  {
    slug: 'lounge-corner',
    width: 1200,
    height: 1600,
    caption: 'The lounge corner',
    alt: 'Corner table with a cigar humidor, a candle, a cigar on a red cutter and a glowing lantern',
  },
  {
    slug: 'play-table',
    width: 1600,
    height: 1200,
    caption: 'Room to play',
    alt: 'Wooden table covered with Magic cards, playmats, dice, booster packs and a life-total tracker',
  },
  {
    slug: 'sealed-product',
    width: 1200,
    height: 1600,
    caption: 'Sealed product',
    alt: 'Sealed Magic: The Gathering products, including a Final Fantasy Commander deck and an Avatar beginner box',
  },
  {
    slug: 'packs-mug',
    width: 1200,
    height: 1600,
    caption: 'Packs by the tankard',
    alt: 'Wooden Magic: The Gathering tankard filled with booster packs',
  },
]

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null)
  const closeRef = useRef(null)
  const isOpen = openIndex !== null

  useEffect(() => {
    if (!isOpen) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') setOpenIndex(null)
      if (event.key === 'ArrowRight') setOpenIndex((i) => (i + 1) % photos.length)
      if (event.key === 'ArrowLeft')
        setOpenIndex((i) => (i - 1 + photos.length) % photos.length)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  const current = isOpen ? photos[openIndex] : null

  return (
    <section id="gallery" className="section gallery-section">
      <h2>Inside the tavern</h2>
      <div className="gallery">
        {photos.map((photo, index) => (
          <button
            type="button"
            className="gallery-item"
            key={photo.slug}
            onClick={() => setOpenIndex(index)}
            aria-label={`Enlarge photo: ${photo.caption}`}
          >
            <img
              src={photoUrl(`${photo.slug}-thumb`)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
            />
            <span className="gallery-caption">{photo.caption}</span>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            ref={closeRef}
            onClick={() => setOpenIndex(null)}
            aria-label="Close photo"
          >
            &times;
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(event) => {
              event.stopPropagation()
              setOpenIndex((openIndex - 1 + photos.length) % photos.length)
            }}
            aria-label="Previous photo"
          >
            &lsaquo;
          </button>
          <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img src={photoUrl(current.slug)} alt={current.alt} />
            <figcaption>{current.caption}</figcaption>
          </figure>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(event) => {
              event.stopPropagation()
              setOpenIndex((openIndex + 1) % photos.length)
            }}
            aria-label="Next photo"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </section>
  )
}
