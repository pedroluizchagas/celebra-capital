import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from '../../hooks/useAnalytics'

/**
 * Componente para rastreamento automático de visualizações de página.
 * Deve ser incluído no componente raiz para capturar todas as transições.
 */
export const AnalyticsPageTracker: React.FC = () => {
  const location = useLocation()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    // Rastreia visualização de página quando a rota muda
    trackPageView()

    // Atualiza título da página com base na rota atual
    updatePageTitle(location.pathname)
  }, [location, trackPageView])

  /**
   * Atualiza o título da página com base na rota.
   */
  const updatePageTitle = (path: string) => {
    const baseTitle = 'Celebra Capital | '
    let pageTitle = 'Pré-Análise de Crédito'

    // Mapeia rotas para títulos específicos
    if (path.startsWith('/propostas')) {
      pageTitle = 'Propostas'
    } else if (path.startsWith('/documentos')) {
      pageTitle = 'Documentos'
    } else if (path.startsWith('/clientes')) {
      pageTitle = 'Clientes'
    } else if (path.startsWith('/relatorios')) {
      pageTitle = 'Relatórios'
    } else if (path.startsWith('/perfil')) {
      pageTitle = 'Meu Perfil'
    } else if (path.startsWith('/configuracoes')) {
      pageTitle = 'Configurações'
    } else if (path === '/') {
      pageTitle = 'Dashboard'
    }

    // Atualiza o título do documento
    document.title = baseTitle + pageTitle
  }

  // Componente não renderiza nada visualmente
  return null
}
