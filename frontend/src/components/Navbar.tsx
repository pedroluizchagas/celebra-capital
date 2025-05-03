import React, { useState, useCallback, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationIcon from './NotificationIcon'

interface NavbarProps {
  toggleDarkMode: () => void
  darkMode: boolean
}

const Navbar: React.FC<NavbarProps> = memo(({ toggleDarkMode, darkMode }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }, [logout, navigate])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-celebra-blue">
              Celebra Capital
            </Link>
          </div>

          {/* Menu para Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-1 text-sm border rounded-md"
            >
              {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Ícone de Notificações */}
                <NotificationIcon />

                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-celebra-blue dark:hover:text-celebra-blue">
                    <span>{user?.name?.split(' ')[0] || 'Usuário'}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Perfil
                    </Link>
                    <Link
                      to="/proposals"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Minhas Propostas
                    </Link>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Notificações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-celebra-blue dark:hover:text-celebra-blue"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-celebra-blue text-white rounded-md hover:bg-opacity-90"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Menu para Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <div className="flex flex-col space-y-4">
              <button
                onClick={toggleDarkMode}
                className="px-3 py-1 text-sm border rounded-md self-start"
              >
                {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </button>

              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {user?.name || 'Usuário'}
                  </span>
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <Link
                    to="/proposals"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Minhas Propostas
                  </Link>
                  <Link
                    to="/notifications"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notificações
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 dark:text-gray-300"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-celebra-blue text-white rounded-md hover:bg-opacity-90 self-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
})

export default Navbar
