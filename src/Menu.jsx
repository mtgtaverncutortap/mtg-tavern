import { menu } from './menu.config.js'

export default function Menu() {
  return (
    <section id="menu" className="section menu-section">
      <h2>Menu</h2>
      <div className="menu-grid">
        {menu.map((category) => (
          <article className="card menu-card" key={category.title}>
            <h3>{category.title}</h3>
            <ul className="menu-items">
              {category.items.map((item) => (
                <li key={item.name}>
                  <div className="menu-line">
                    <span className="menu-name">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.name}
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        item.name
                      )}
                    </span>
                    {item.price && (
                      <>
                        <span className="menu-leader" aria-hidden="true" />
                        <span className="menu-price">{item.price}</span>
                      </>
                    )}
                  </div>
                  {item.description && <p className="menu-desc">{item.description}</p>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
