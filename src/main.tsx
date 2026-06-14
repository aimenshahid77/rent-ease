import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply persisted theme before first render to avoid flash
const stored = localStorage.getItem('rentease-theme');
try {
  const parsed = stored ? JSON.parse(stored) : null;
  if (parsed?.state?.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
