import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faEnvelope,
  faLock,
  faIdCard,
  faBell,
  faCalendarAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import userService, { User } from '../services/userService'
import { formatApiErrorMessage } from '../utils/errorHandler'
import LoadingSpinner from '../components/common/LoadingSpinner'

interface ProfileData extends User {
  cpf?: string
  phone?: string
  notificationPreferences?: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface EditableProfileData {
  name?: string
  email?: string
  cpf?: string
  phone?: string
  notificationPreferences?: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<EditableProfileData>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Carregar os dados do perfil
  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await userService.getCurrentUserProfile()

      // Adicionando dados fictícios para o MVP
      const enhancedData: ProfileData = {
        ...data,
        cpf: '000.000.000-00', // Exemplo para MVP
        phone: '(00) 00000-0000', // Exemplo para MVP
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
        },
      }

      setProfileData(enhancedData)
      setEditedData({}) // Limpar campos editados
    } catch (err: any) {
      setError(formatApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox' && name.startsWith('notification')) {
      const notificationType = name.split('.')[1]

      setEditedData((prev) => {
        const updatedPreferences = {
          ...prev.notificationPreferences,
          [notificationType]: checked,
        }

        return {
          ...prev,
          notificationPreferences:
            updatedPreferences as ProfileData['notificationPreferences'],
        }
      })
    } else {
      setEditedData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Enviar apenas os dados que foram alterados
      const dataToUpdate = {
        name: editedData.name,
        email: editedData.email,
        // cpf e phone não serão enviados para a API ainda, apenas para o MVP visual
      }

      await userService.updateCurrentUserProfile(dataToUpdate)
      setSuccess('Perfil atualizado com sucesso!')
      fetchProfileData() // Recarregar dados atualizados
      setIsEditing(false)
    } catch (err: any) {
      setError(formatApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedData({})
    setError(null)
    setSuccess(null)
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validar se as senhas coincidem
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }

    // Validar complexidade da senha
    if (passwordData.newPassword.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await userService.updateCurrentUserProfile({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      })

      setPasswordSuccess('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)
    } catch (err: any) {
      setPasswordError(formatApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    analista: 'Analista',
    cliente: 'Cliente',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Meu Perfil | Celebra Capital</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Meu Perfil
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Seção Principal do Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Informações Pessoais
              </h2>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2 md:mt-0"
                >
                  Editar Perfil
                </button>
              ) : (
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nome Completo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editedData.name || profileData?.name || ''}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editedData.email || profileData?.email || ''}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cpf"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      CPF
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faIdCard} />
                      </span>
                      <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={editedData.cpf || profileData?.cpf || ''}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Telefone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={editedData.phone || profileData?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nome Completo
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.name}
                  </p>
                </div>

                <div className="p-4 border-b md:border-b-0 border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    E-mail
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.email}
                  </p>
                </div>

                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    CPF
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.cpf || 'Não informado'}
                  </p>
                </div>

                <div className="p-4 border-b md:border-b-0 border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Telefone
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.phone || 'Não informado'}
                  </p>
                </div>

                <div className="p-4 md:border-r border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Função
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.role ? roleLabels[profileData.role] : ''}
                  </p>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Último Acesso
                  </h3>
                  <p className="text-lg font-medium dark:text-white">
                    {profileData?.lastLogin
                      ? new Date(profileData.lastLogin).toLocaleString('pt-BR')
                      : 'Primeiro acesso'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Alteração de Senha */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Segurança da Conta
              </h2>

              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2 md:mt-0"
                >
                  Alterar Senha
                </button>
              ) : (
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                      setPasswordError(null)
                      setPasswordSuccess(null)
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePassword}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="mr-2"
                />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {passwordSuccess}
              </div>
            )}

            {isChangingPassword ? (
              <form onSubmit={handleSavePassword}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Senha Atual
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nova Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        minLength={8}
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      A senha deve ter pelo menos 8 caracteres
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-gray-400 mr-3 text-xl"
                />
                <div>
                  <h3 className="text-md font-medium dark:text-white">Senha</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sua senha foi definida em{' '}
                    {profileData?.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'data desconhecida'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Preferências de Notificação */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Preferências de Notificação
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notification.email"
                    name="notification.email"
                    type="checkbox"
                    checked={
                      editedData.notificationPreferences?.email !== undefined
                        ? editedData.notificationPreferences.email
                        : profileData?.notificationPreferences?.email || false
                    }
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notification.email"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notificações por E-mail
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Receba atualizações sobre o status da sua proposta
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notification.push"
                    name="notification.push"
                    type="checkbox"
                    checked={
                      editedData.notificationPreferences?.push !== undefined
                        ? editedData.notificationPreferences.push
                        : profileData?.notificationPreferences?.push || false
                    }
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notification.push"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notificações Push
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Receba alertas da plataforma em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="notification.sms"
                    name="notification.sms"
                    type="checkbox"
                    checked={
                      editedData.notificationPreferences?.sms !== undefined
                        ? editedData.notificationPreferences.sms
                        : profileData?.notificationPreferences?.sms || false
                    }
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="notification.sms"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notificações por SMS
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Receba mensagens de texto com atualizações importantes
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
