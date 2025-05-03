import React from 'react'

interface SkipLinkProps {
  targetId: string
  className?: string
}

/**
 * Componente de skip link para acessibilidade por teclado
 * Permite que usuários de teclado pulem para o conteúdo principal
 *
 * @param targetId - ID do elemento para onde o link deve apontar
 * @param className - Classes CSS adicionais
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  className = '',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white
        focus:rounded focus:outline-none focus:shadow-lg
        ${className}
      `}
    >
      Pular para o conteúdo principal
    </a>
  )
}
