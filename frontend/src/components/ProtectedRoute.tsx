import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole | UserRole[]
  requiredPermissions?: string | string[]
}

/**
 * Componente para proteger rotas que exigem autenticação
 * Verifica se o usuário está autenticado e possui as permissões necessárias
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  // Se ainda está carregando a autenticação, mostra um indicador de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verifica permissões por papel (role)
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/acesso-negado" replace />
  }

  // Verifica permissões específicas
  if (requiredPermissions) {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions]

    // Verifica se tem todas as permissões necessárias
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(permission)
    )

    if (!hasAllPermissions) {
      return <Navigate to="/acesso-negado" replace />
    }
  }

  // Se passou por todas as verificações, renderiza o conteúdo protegido
  return <>{children}</>
}

export default ProtectedRoute
