import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { IdentityPrompt } from './Membership.jsx'
import { MembershipProvider } from './MembershipContext.jsx'
import { SignupsProvider } from './SignupsContext.jsx'

// Always start a fresh page load at the top, instead of the browser
// restoring wherever the visitor last scrolled to (or jumping to a URL
// fragment like #services) on refresh.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MembershipProvider>
      <SignupsProvider>
        <IdentityPrompt />
        <App />
      </SignupsProvider>
    </MembershipProvider>
  </StrictMode>,
)
