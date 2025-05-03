import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import * as analyticsService from '../services/analytics'

/**
 * Hook para facilitar o uso do serviço de analytics nos componentes
 */
const useAnalytics = () => {
  const location = useLocation()
  const prevPathRef = useRef<string | null>(null)

  // Rastrear mudanças de página automaticamente
  useEffect(() => {
    const currentPath = location.pathname

    // Evitar duplicação de eventos se o path não mudou
    if (prevPathRef.current === currentPath) return

    // Determinar nome da página baseado no path
    const pageName = getPageNameFromPath(currentPath)

    // Rastrear visualização de página
    analyticsService.trackPageView(pageName, currentPath)

    // Atualizar referência do path anterior
    prevPathRef.current = currentPath
  }, [location.pathname])

  /**
   * Extrai o nome da página a partir do path da URL
   */
  const getPageNameFromPath = (path: string): string => {
    // Remover barras iniciais e finais
    const cleanPath = path.replace(/^\/|\/$/g, '')

    // Se for a página inicial
    if (cleanPath === '') return 'Home'

    // Se for uma página de admin
    if (cleanPath.startsWith('admin')) {
      const adminPath = cleanPath.replace(/^admin\/?/, '')
      if (!adminPath) return 'Admin Dashboard'

      // Mapear caminhos específicos do admin
      if (adminPath.startsWith('proposals/')) return 'Admin Proposal Details'
      if (adminPath === 'usuarios') return 'Admin User Management'
      if (adminPath === 'relatorios') return 'Admin Reports'
      if (adminPath === 'notifications') return 'Admin Notifications'

      return `Admin ${adminPath}`
    }

    // Mapear outras páginas
    const pathMap: Record<string, string> = {
      login: 'Login',
      cadastro: 'Register',
      'recuperar-senha': 'Password Recovery',
      'termos-e-politicas': 'Terms and Policies',
      documentos: 'Document Upload',
      assinatura: 'Signature',
      sucesso: 'Success',
      perfil: 'Profile',
      'pre-analise': 'Pre-Analysis Form',
    }

    return (
      pathMap[cleanPath] ||
      cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1)
    )
  }

  // Retornar funções do serviço de analytics para uso nos componentes
  return {
    trackPageView: analyticsService.trackPageView,
    trackFormStart: analyticsService.trackFormStart,
    trackFormComplete: analyticsService.trackFormComplete,
    trackDocumentUpload: analyticsService.trackDocumentUpload,
    trackSignatureComplete: analyticsService.trackSignatureComplete,
    trackLogin: analyticsService.trackLogin,
    trackRegister: analyticsService.trackRegister,
    trackError: analyticsService.trackError,
    trackEvent: analyticsService.trackEvent,
  }
}

export default useAnalytics
