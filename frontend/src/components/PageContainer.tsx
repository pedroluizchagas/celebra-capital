import React from 'react'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Componente para padronizar o layout de páginas
 *
 * Fornece margens e largura máxima consistentes para todas as páginas
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>{children}</div>
  )
}
