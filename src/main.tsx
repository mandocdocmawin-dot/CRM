import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './index.css'
import App from './App'

try { document.documentElement.dataset.theme = localStorage.getItem('sulong-theme') === 'dark' ? 'dark' : 'light' } catch { document.documentElement.dataset.theme = 'light' }

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
