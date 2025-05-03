import React, { useEffect, useState } from 'react'

interface AccessibilityAnnouncerProps {
  /** Nível de assertividade para o anúncio. */
  assertive?: boolean
  /** Determina se os anúncios são politicamente corretos*/
  politeness?: 'assertive' | 'polite'
}

/**
 * Singleton para gerenciar mensagens de acessibilidade
 */
export class AnnouncerManager {
  private static instance: AnnouncerManager
  private listeners: ((
    message: string,
    politeness: 'assertive' | 'polite'
  ) => void)[] = []

  private constructor() {}

  public static getInstance(): AnnouncerManager {
    if (!AnnouncerManager.instance) {
      AnnouncerManager.instance = new AnnouncerManager()
    }
    return AnnouncerManager.instance
  }

  /**
   * Anuncia uma mensagem para leitores de tela
   * @param message Mensagem a ser anunciada
   * @param politeness Nível de assertividade (assertive para urgente, polite para informativo)
   */
  public announce(
    message: string,
    politeness: 'assertive' | 'polite' = 'polite'
  ): void {
    this.listeners.forEach((listener) => listener(message, politeness))
  }

  /**
   * Adiciona um ouvinte para anúncios
   * @param listener Função que será chamada quando houver um anúncio
   */
  public addListener(
    listener: (message: string, politeness: 'assertive' | 'polite') => void
  ): void {
    this.listeners.push(listener)
  }

  /**
   * Remove um ouvinte de anúncios
   * @param listener Função a ser removida
   */
  public removeListener(
    listener: (message: string, politeness: 'assertive' | 'polite') => void
  ): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }
}

/**
 * Hook para usar o anunciador em componentes
 */
export const useAnnouncer = () => {
  const announcer = AnnouncerManager.getInstance()

  return {
    /**
     * Anuncia uma mensagem para leitores de tela
     * @param message Mensagem a ser anunciada
     * @param politeness Nível de assertividade (assertive para urgente, polite para informativo)
     */
    announce: (
      message: string,
      politeness: 'assertive' | 'polite' = 'polite'
    ) => {
      announcer.announce(message, politeness)
    },
  }
}

/**
 * Componente para anunciar mudanças de estado para leitores de tela
 *
 * Este componente cria regiões ao vivo (live regions) que são detectadas por
 * leitores de tela. Quando o conteúdo dessas regiões muda, o leitor de tela
 * anuncia essas mudanças, permitindo que usuários com deficiência visual
 * saibam quando algo importante aconteceu na interface.
 */
const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
  assertive = false,
  politeness = 'polite',
}) => {
  const [assertiveMessage, setAssertiveMessage] = useState('')
  const [politeMessage, setPoliteMessage] = useState('')

  useEffect(() => {
    const announcer = AnnouncerManager.getInstance()

    const handleAnnouncement = (
      message: string,
      announcementPoliteness: 'assertive' | 'polite'
    ) => {
      if (announcementPoliteness === 'assertive') {
        setAssertiveMessage(message)
        // Limpar após um tempo para permitir anúncios repetidos da mesma mensagem
        setTimeout(() => setAssertiveMessage(''), 3000)
      } else {
        setPoliteMessage(message)
        setTimeout(() => setPoliteMessage(''), 3000)
      }
    }

    announcer.addListener(handleAnnouncement)

    return () => {
      announcer.removeListener(handleAnnouncement)
    }
  }, [])

  const assertiveStyles: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  }

  return (
    <>
      <div
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="additions text"
        style={assertiveStyles}
      >
        {assertiveMessage}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        style={assertiveStyles}
      >
        {politeMessage}
      </div>
    </>
  )
}

export default AccessibilityAnnouncer
