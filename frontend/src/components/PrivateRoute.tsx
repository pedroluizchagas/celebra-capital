import React, {
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  memo,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/adapters'

interface PrivateRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = memo(
  ({ children, adminOnly = false }) => {
    const { user, isAuthenticated, isLoading, checkAuth } = useAuth()
    const [isChecking, setIsChecking] = useState(true)
    const [isAllowed, setIsAllowed] = useState(false)
    const location = useLocation()

    const verifyAuth = useCallback(async () => {
      try {
        const result = await checkAuth()
        // Se for uma rota de admin, verificar se o usuário tem permissão
        if (result && adminOnly) {
          setIsAllowed(user?.user_type === 'admin')
        } else {
          setIsAllowed(result)
        }
      } catch (error) {
        setIsAllowed(false)
      } finally {
        setIsChecking(false)
      }
    }, [checkAuth, adminOnly, user?.user_type])

    useEffect(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          // Se for uma rota de admin, verificar se o usuário tem permissão
          if (adminOnly) {
            setIsAllowed(user?.user_type === 'admin')
          } else {
            setIsAllowed(true)
          }
          setIsChecking(false)
        } else {
          verifyAuth()
        }
      }
    }, [isLoading, isAuthenticated, adminOnly, user, verifyAuth])

    // Memoize do loader para evitar recriação em cada render
    const loader = useMemo(
      () => (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebra-blue"></div>
        </div>
      ),
      []
    )

    if (isLoading || isChecking) {
      // Exibir um loader enquanto verifica a autenticação
      return loader
    }

    // Memoize dos resultados de navegação para prevenir re-renderizações desnecessárias
    const navigationResults = useMemo(() => {
      if (!isAllowed) {
        // Redirecionar para login se não estiver autenticado
        // Ou para dashboard se estiver autenticado mas não tiver permissão de admin
        if (isAuthenticated && adminOnly) {
          return <Navigate to="/form" state={{ from: location }} replace />
        }
        return <Navigate to="/login" state={{ from: location }} replace />
      }
      // Se estiver autenticado e tiver permissão, renderizar o conteúdo
      return <>{children}</>
    }, [isAllowed, isAuthenticated, adminOnly, location, children])

    return navigationResults
  }
)

export default PrivateRoute
