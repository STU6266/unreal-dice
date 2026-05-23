import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UpdatePrompt } from './components/pwa/UpdatePrompt.tsx'
import App from './App.tsx'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>,
)
