import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MembershipProvider } from './MembershipContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MembershipProvider>
      <App />
    </MembershipProvider>
  </StrictMode>,
)
