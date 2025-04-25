import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import sentryService from './services/sentryService'

// Inicializar Sentry no ambiente correto
const NODE_ENV = import.meta.env?.MODE || 'development'
sentryService.initSentry(NODE_ENV)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
