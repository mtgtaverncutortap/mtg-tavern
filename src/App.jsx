import './App.css'
import { Embers, Flame, Hearth, Torch } from './Fire.jsx'

// Edit this object to change the text on the page.
const business = {
  name: 'MTG Tavern',
  tagline: 'Magic cards, tournaments, and a proper tavern to enjoy them in.',
  intro:
    'A novelty Magic: The Gathering card shop with great food, butterbeer on the menu, and room to bring your own beer. Crack a pack, trade for a single, or sit down for a tournament with prizes on the line.',
  cta: 'Visit the tavern',
  services: [
    {
      title: 'Packs & Singles',
      text: 'Grab a booster pack for the thrill of the draw, or pick up the exact singles your deck needs.',
    },
    {
      title: 'Tournaments',
      text: 'Sit down and play for prizes. Bring your best deck and test it against other players.',
    },
    {
      title: 'Food & Drink',
      text: 'Great food made for eating between turns. Try our butterbeer, or bring your own beer.',
    },
    {
      title: 'Places to Smoke',
      text: 'Step away for a smoke without straying far from the game.',
    },
  ],
  about:
    'MTG Tavern is a novelty Magic: The Gathering card shop built like a tavern: a place to buy cards, play games, eat well and hang out. Whether you are opening your first pack or chasing a tournament win, pull up a seat.',
  contact: {
    email: 'mtgtaverncutortap@gmail.com',
    phone: '(714) 296-4155',
    location: 'The Colony, Texas',
  },
}

function App() {
  const { name, tagline, intro, cta, services, about, contact } = business

  return (
    <>
      <header className="nav">
        <a className="nav-brand" href="#top">
          <Flame className="flame-icon" />
          {name}
        </a>
        <nav className="nav-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <Embers />
          <div className="hero-inner">
            <Torch />
            <div className="hero-content">
              <p className="hero-kicker">Welcome, traveler</p>
              <h1>{tagline}</h1>
              <p className="hero-intro">{intro}</p>
              <a className="button" href="#contact">
                {cta}
              </a>
            </div>
            <Torch delay={-0.6} />
          </div>
        </section>

        <section id="services" className="section">
          <h2>What we do</h2>
          <div className="cards">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="section section-alt">
          <h2>About us</h2>
          <p className="about-text">{about}</p>
        </section>

        <section id="contact" className="section">
          <h2>Contact</h2>
          <ul className="contact-list">
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>
                {contact.phone}
              </a>
            </li>
            <li>{contact.location}</li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <Hearth />
        <p>
          &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </p>
      </footer>
    </>
  )
}

export default App
