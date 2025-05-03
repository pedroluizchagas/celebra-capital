import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  memo,
  useCallback,
} from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './styles/globals.css'
import './styles/a11y.css'

// Importar componente de rota privada
import PrivateRoute from './components/PrivateRoute'
import RealtimeNotifications from './components/notifications/RealtimeNotifications'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import MainLayout from './layouts/MainLayout'

// Lazy loading para páginas
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const PreAnalyseForm = lazy(() => import('./pages/PreAnalyseForm'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Notifications = lazy(() => import('./pages/admin/Notifications'))
const ProposalDetails = lazy(() => import('./pages/admin/ProposalDetails'))
const TermsAndPolicies = lazy(() => import('./pages/TermsAndPolicies'))
const RecoverPassword = lazy(() => import('./pages/RecoverPassword'))
const AnalyticsDashboard = lazy(() => import('./pages/admin/Analytics'))
const PasswordResetRequest = lazy(() => import('./pages/PasswordResetRequest'))
const PasswordReset = lazy(() => import('./pages/PasswordReset'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'))
const UsersPage = lazy(() => import('./pages/admin/Users'))

// Componentes de acessibilidade
import SkipLinks from './components/a11y/SkipLinks'
import AccessibilityToggle from './components/a11y/AccessibilityToggle'
import AccessibilityAnnouncer from './components/a11y/AccessibilityAnnouncer'

// Componente de fallback para o ErrorBoundary do Sentry
const FallbackComponent = () => (
  <div className="error-boundary">
    <h1>Ocorreu um erro inesperado</h1>
    <p>
      Estamos trabalhando para resolver o problema. Por favor, tente novamente
      em alguns instantes.
    </p>
  </div>
)

// Componente para página de loading durante lazy loading
const LoadingPage = () => (
  <div className="loading-page">
    <div className="spinner"></div>
    <p>Carregando...</p>
  </div>
)

// Configuração do Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      // Configuração de roteamento do Sentry
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation
      ),
    }),
    new Sentry.Replay(),
  ],
  // Configurações de performance
  tracesSampleRate: 0.5,
  // Configurações de replay de sessão
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

/**
 * Componente principal da aplicação
 * Configura as rotas e adiciona componentes de acessibilidade globais
 */
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode === 'true'
  })

  // Efeito para alternar entre modo claro/escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  // Configuração inicial de acessibilidade
  useEffect(() => {
    // Adicionar IDs importantes para acessibilidade
    document.querySelector('main')?.setAttribute('id', 'main-content')
    document.querySelector('nav')?.setAttribute('id', 'main-nav')

    // Definir atributos de linguagem
    document.documentElement.lang = 'pt-BR'

    // Verificar configurações de acessibilidade salvas
    const highContrast = localStorage.getItem('a11y-high-contrast') === 'true'
    const fontSize = localStorage.getItem('a11y-font-size') || '100'

    // Aplicar configurações
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    }

    if (fontSize !== '100') {
      document.documentElement.classList.add(`font-size-${fontSize}`)
    }
  }, [])

  return (
    <div className="app-wrapper">
      {/* Skip links para navegação por teclado */}
      <SkipLinks />

      {/* Componente para anúncios acessíveis */}
      <AccessibilityAnnouncer />

      <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
        <BrowserRouter>
          {/* Componente de notificações em tempo real */}
          <RealtimeNotifications />

          {/* Painel de acessibilidade */}
          <AccessibilityToggle />

          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route
                path="/termos-e-politicas"
                element={<TermsAndPolicies />}
              />
              <Route path="/recuperar-senha" element={<RecoverPassword />} />
              <Route
                path="/solicitar-recuperacao"
                element={<PasswordResetRequest />}
              />
              <Route
                path="/redefinir-senha/:uid/:token"
                element={<PasswordReset />}
              />
              <Route
                path="/politica-de-privacidade"
                element={<PrivacyPolicy />}
              />
              <Route path="/termos-de-uso" element={<TermsOfUse />} />

              {/* Rotas privadas com layout principal */}
              <Route
                path="/"
                element={
                  <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
                }
              >
                <Route
                  index
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="pre-analise"
                  element={
                    <PrivateRoute>
                      <PreAnalyseForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="perfil"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* Rotas do admin com layout de admin */}
              <Route
                path="/admin"
                element={
                  <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} />
                }
              >
                <Route
                  index
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="usuarios"
                  element={
                    <PrivateRoute>
                      <UserManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="relatorios"
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <PrivateRoute>
                      <AnalyticsDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="proposals/:id"
                  element={
                    <PrivateRoute>
                      <ProposalDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PrivateRoute>
                      <UsersPage />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* Rota para página não encontrada */}
              <Route path="*" element={<div>Página não encontrada</div>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Sentry.ErrorBoundary>
    </div>
  )
}

export default App
