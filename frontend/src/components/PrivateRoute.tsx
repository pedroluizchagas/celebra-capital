import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const verifyAuth = async () => {
      const result = await checkAuth()
      setIsAllowed(result)
      setIsChecking(false)
    }

    if (!isLoading) {
      if (isAuthenticated) {
        setIsAllowed(true)
        setIsChecking(false)
      } else {
        verifyAuth()
      }
    }
  }, [isLoading, isAuthenticated, checkAuth])

  if (isLoading || isChecking) {
    // Exibir um loader enquanto verifica a autenticação
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebra-blue"></div>
      </div>
    )
  }

  if (!isAllowed) {
    // Redirecionar para login se não estiver autenticado
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se estiver autenticado, renderizar o conteúdo da rota usando Outlet
  return <Outlet />
}

export default PrivateRoute
