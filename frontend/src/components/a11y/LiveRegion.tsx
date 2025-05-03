import React, { useEffect } from 'react'
import VisuallyHidden from './VisuallyHidden'

type AriaLive = 'off' | 'polite' | 'assertive'

interface LiveRegionProps {
  /**
   * Mensagem a ser anunciada
   */
  message: string

  /**
   * Política de anúncio:
   * - assertive: interrompe o que o leitor de tela está fazendo para anunciar (para alertas importantes)
   * - polite: aguarda até que o leitor de tela termine o que está fazendo (para atualizações menos urgentes)
   * - off: não anuncia mudanças
   */
  ariaLive?: AriaLive

  /**
   * Determina se as atualizações relevantes serão anunciadas
   */
  ariaRelevant?: 'additions' | 'removals' | 'text' | 'all'

  /**
   * Define se a região deve ser visível ou oculta visualmente
   */
  visible?: boolean

  /**
   * Atraso (em ms) antes de anunciar a mensagem
   * Pode ajudar com problemas de timing em alguns leitores de tela
   */
  delay?: number

  /**
   * Classe CSS adicional
   */
  className?: string

  /**
   * Role ARIA para especificar o papel do elemento
   */
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer' | 'none'
}

/**
 * LiveRegion - Anuncia conteúdo dinâmico para usuários de leitores de tela
 *
 * Este componente é essencial para tornar atualizações dinâmicas da interface acessíveis.
 * Qualquer conteúdo que muda sem recarga de página (como alertas, mensagens de erro,
 * resultados de pesquisas, etc.) deve ser anunciado usando uma região ao vivo.
 *
 * Exemplos de uso:
 * ```tsx
 * // Para informações gerais não urgentes
 * <LiveRegion message="Página carregada com 10 resultados" />
 *
 * // Para alertas importantes que precisam de atenção imediata
 * <LiveRegion message="Erro de conexão. Tentando reconectar..." ariaLive="assertive" role="alert" />
 * ```
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  ariaLive = 'polite',
  ariaRelevant = 'additions',
  visible = false,
  delay = 0,
  className = '',
  role = 'status',
}) => {
  // Estado para gerenciar a mensagem com atraso, se necessário
  const [displayedMessage, setDisplayedMessage] = React.useState<string>(
    delay ? '' : message
  )

  // Atualiza a mensagem exibida quando a propriedade message muda
  useEffect(() => {
    if (!delay) {
      setDisplayedMessage(message)
      return
    }

    // Aplicar atraso se especificado
    const timer = setTimeout(() => {
      setDisplayedMessage(message)
    }, delay)

    return () => clearTimeout(timer)
  }, [message, delay])

  // Se for visível, renderiza com estilos visuais
  if (visible) {
    return (
      <div
        className={`live-region ${className}`}
        aria-live={ariaLive}
        aria-relevant={ariaRelevant}
        role={role}
      >
        {displayedMessage}
      </div>
    )
  }

  // Se for invisível, renderiza dentro do componente VisuallyHidden
  return (
    <VisuallyHidden>
      <div
        className={`live-region ${className}`}
        aria-live={ariaLive}
        aria-relevant={ariaRelevant}
        role={role}
      >
        {displayedMessage}
      </div>
    </VisuallyHidden>
  )
}

export default LiveRegion
