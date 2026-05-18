import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { AppRouter } from './app/AppRouter'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('ReturnShield root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
