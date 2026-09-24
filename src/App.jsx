import './App.css'
import { Embers, Flame, Hearth, Torch } from './Fire.jsx'
import Events from './Events.jsx'
import Gallery from './Gallery.jsx'
import Menu from './Menu.jsx'
import snuggleLogo from './assets/snugglebunz-logo.webp'
import { AccountNav, MembersArea, MembershipSection } from './Membership.jsx'
import { discordInvite as discord } from './site.config.js'

// Edit this object to change the text on the page.
const business = {
  name: 'MTG Tavern',
  tagline: 'Magic the Gathering cafe!',
  intro:
    'An enhanced environment to play in while experiencing food, drinks, and lounge access.',
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
      text: 'Great food and drinks to enjoy while you play. Try our butterbeer.',
    },
    {
      title: 'Lounge Access',
      text: 'Settle into an enhanced environment built for playing and hanging out, with places to smoke close by.',
    },
  ],
  about:
    'MTG Tavern is a Magic the Gathering cafe: an enhanced environment to play in while experiencing food, drinks, and lounge access. Pick up packs and singles, join a tournament for prizes, and make yourself at home whether you are opening your first pack or chasing a win.',
  contact: {
    email: 'mtgtaverncutortap@gmail.com',
    phone: '(714) 296-4155',
    location: 'The Colony, Texas',
  },
}

function App() {
  const { name, tagline, intro, cta, services, about, contact } = business

  const discordButton = discord && (
    <a className="button button-discord" href={discord} target="_blank" rel="noopener noreferrer">
      Join our Discord
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )

  return (
    <>
      <header className="nav">
        <a className="nav-brand" href="#top">
          <Flame className="flame-icon" />
          {name}
        </a>
        <nav className="nav-links">
          <a href="#services">Services</a>
          <a href="#menu">Menu</a>
          <a href="#events">Events</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <AccountNav />
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
              <div className="hero-actions">
                <a className="button" href="#contact">
                  {cta}
                </a>
                {discordButton}
              </div>
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

        <Events />

        <Menu />

        <Gallery />

        <section id="about" className="section section-alt">
          <h2>About us</h2>
          <p className="about-text">{about}</p>
        </section>

        <section className="partner-section" aria-label="Snugglebunz">
          <a
            className="partner-button"
            href="https://www.originalsnugglebunz.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={snuggleLogo} alt="" width="88" height="88" />
            <span className="partner-text">
              <span className="partner-label">
                Visit Snugglebunz
                <span className="visually-hidden"> (opens in a new tab)</span>
              </span>
              <span className="partner-sub">originalsnugglebunz.com</span>
            </span>
          </a>
        </section>

        <MembersArea />
        <MembershipSection />

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
          {discordButton && <p className="contact-discord">{discordButton}</p>}
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
