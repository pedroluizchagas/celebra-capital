import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { useState, useEffect } from 'react'

// Importar componentes de autenticação
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

// Importar páginas
import FormFlow from './pages/FormFlow'
import DocumentUpload from './pages/DocumentUpload'
import Signature from './pages/Signature'
import Success from './pages/Success'
import Login from './pages/Login'
import Register from './pages/Register'

// Importar componentes do dashboard administrativo
import AdminDashboard from './pages/admin/Dashboard'
import ProposalList from './pages/admin/ProposalList'
import ProposalDetails from './pages/admin/ProposalDetails'
import Reports from './pages/admin/Reports'

// Adicionar a importação para o NotificationProvider e a página de notificações
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationsPage from './pages/Notifications'

// Importar o ErrorProvider
import { ErrorProvider } from './contexts/ErrorContext'
import ErrorDisplay from './components/ErrorDisplay'

// Componente de fallback para o ErrorBoundary do Sentry
const FallbackComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Algo deu errado
        </h2>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e
          estamos trabalhando na solução.
        </p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
          onClick={() => (window.location.href = '/')}
        >
          Voltar para a página inicial
        </button>
      </div>
    </div>
  </div>
)

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Verificar preferência do usuário para dark mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <ErrorProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <ErrorDisplay />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/upload-documents"
                  element={
                    <PrivateRoute>
                      <DocumentUpload />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/form"
                  element={
                    <PrivateRoute>
                      <FormFlow />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/signature"
                  element={
                    <PrivateRoute>
                      <Signature />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/success"
                  element={
                    <PrivateRoute>
                      <Success />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <NotificationsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute adminOnly>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/proposals"
                  element={
                    <PrivateRoute adminOnly>
                      <ProposalList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/proposals/:id"
                  element={
                    <PrivateRoute adminOnly>
                      <ProposalDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <PrivateRoute adminOnly>
                      <Reports />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ErrorProvider>
    </Sentry.ErrorBoundary>
  )
}

export default App
