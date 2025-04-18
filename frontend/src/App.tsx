import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

            <main className="container mx-auto px-4 py-8">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <Routes>
                    {/* Rotas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<FormFlow />} />

                    {/* Rotas protegidas */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/form-flow" element={<FormFlow />} />
                      <Route
                        path="/document-upload"
                        element={<DocumentUpload />}
                      />
                      <Route path="/signature" element={<Signature />} />
                      <Route path="/success" element={<Success />} />

                      {/* Rotas administrativas */}
                      <Route path="/admin" element={<AdminDashboard />}>
                        <Route index element={<></>} />
                        <Route path="proposals" element={<ProposalList />} />
                        <Route
                          path="proposals/:id"
                          element={<ProposalDetails />}
                        />
                        <Route path="reports" element={<Reports />} />
                      </Route>

                      {/* Adicionar a rota de notificações no componente PrivateRoutes */}
                      <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                      />
                    </Route>
                  </Routes>
                </div>
              </div>
            </main>

            <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2023 Celebra Capital. Todos os direitos reservados.</p>
                <p className="mt-1">Correspondente Bancário autorizado</p>
              </div>
            </footer>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
