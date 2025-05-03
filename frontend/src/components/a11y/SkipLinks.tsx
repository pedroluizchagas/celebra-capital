import React from 'react'

interface SkipLink {
  id: string
  label: string
}

interface SkipLinksProps {
  links?: SkipLink[]
}

/**
 * Componente SkipLinks - fornece links para pular diretamente para seções importantes da página
 *
 * Este componente é vital para usuários de teclado e leitores de tela, permitindo
 * que pulem diretamente para o conteúdo principal sem navegar por menus repetitivos.
 * Os links são visualmente ocultos até receberem foco, tornando-se visíveis quando
 * o usuário pressiona Tab logo após carregar a página.
 */
const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { id: 'main-content', label: 'Pular para o conteúdo principal' },
    { id: 'main-nav', label: 'Pular para a navegação principal' },
  ],
}) => {
  return (
    <div className="skip-links" aria-label="Links de navegação rápida">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="skip-link bg-primary text-white p-3 absolute top-0 left-0 z-50 -translate-y-full focus:translate-y-0 transition-transform duration-200"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

export default SkipLinks
