import React from 'react'
import { SkipLink } from './SkipLink'
import VisuallyHidden from './VisuallyHidden'
import InlineFeedback from './InlineFeedback'

/**
 * Página de documentação sobre acessibilidade
 *
 * Inclui exemplos práticos dos componentes e orientações de uso
 */
const A11yDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Guia de Acessibilidade</h1>

      <section id="intro" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introdução</h2>
        <p className="mb-3">
          Este guia fornece orientações sobre como implementar acessibilidade em
          nossa aplicação. A acessibilidade (abreviada como a11y) é a prática de
          tornar aplicações utilizáveis por pessoas com diferentes habilidades e
          necessidades.
        </p>
        <p className="mb-3">
          Seguimos as diretrizes WCAG 2.1 (Web Content Accessibility Guidelines)
          com foco nos níveis A e AA de conformidade.
        </p>
      </section>

      <section id="components" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Componentes de Acessibilidade
        </h2>

        <article
          id="skip-links"
          className="mb-8 p-6 border border-gray-200 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">Skip Links</h3>
          <p className="mb-3">
            Links de pulo (Skip Links) permitem que usuários de teclado e
            leitores de tela naveguem rapidamente para o conteúdo principal,
            evitando a repetição de elementos de navegação.
          </p>
          <div className="mb-3 bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Exemplo:</h4>
            <SkipLink targetId="main-content" className="mb-2" />
            <div className="mt-2 bg-blue-50 p-3 rounded text-sm">
              <strong>Nota:</strong> Pressione Tab para visualizar o link de
              pulo.
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded text-sm">
            <strong>Como usar:</strong> Adicione no topo de cada página, antes
            da navegação.
            <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
              {`<SkipLink targetId="main-content" />`}
            </pre>
          </div>
        </article>

        <article
          id="visually-hidden"
          className="mb-8 p-6 border border-gray-200 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">
            Conteúdo Visualmente Oculto
          </h3>
          <p className="mb-3">
            O componente VisuallyHidden oculta conteúdo visualmente, mas
            mantém-no acessível para leitores de tela, útil para fornecer
            contexto adicional.
          </p>
          <div className="mb-3 bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Exemplo:</h4>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              <span aria-hidden="true">+</span>
              <VisuallyHidden>Adicionar item à lista</VisuallyHidden>
            </button>
          </div>
          <div className="bg-amber-50 p-3 rounded text-sm">
            <strong>Como usar:</strong> Envolva texto que deve ser acessível
            apenas para leitores de tela.
            <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
              {`<button>
  <span aria-hidden="true">+</span>
  <VisuallyHidden>Adicionar item à lista</VisuallyHidden>
</button>`}
            </pre>
          </div>
        </article>

        <article
          id="inline-feedback"
          className="mb-8 p-6 border border-gray-200 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">Feedback Inline</h3>
          <p className="mb-3">
            O componente InlineFeedback exibe mensagens de erro, sucesso ou
            informações de forma acessível para todos os usuários.
          </p>
          <div className="mb-3 bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Exemplos:</h4>
            <div className="space-y-2">
              <InlineFeedback
                id="info-example"
                message="Esta é uma mensagem informativa."
                type="info"
              />
              <InlineFeedback
                id="success-example"
                message="Operação realizada com sucesso!"
                type="success"
              />
              <InlineFeedback
                id="error-example"
                message="Ocorreu um erro. Tente novamente."
                type="error"
              />
              <InlineFeedback
                id="warning-example"
                message="Atenção: esta ação não pode ser desfeita."
                type="warning"
              />
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded text-sm">
            <strong>Como usar:</strong> Associe com campos de formulário via
            aria-describedby.
            <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
              {`<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <InlineFeedback
    id="email-error"
    message={error}
    type="error"
  />
)}`}
            </pre>
          </div>
        </article>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Boas Práticas</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">Use estrutura semântica HTML</h3>
            <p>
              Prefira elementos HTML semânticos (nav, main, section, article) em
              vez de divs genéricas.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">
              Mantenha hierarquia de cabeçalhos
            </h3>
            <p>
              Siga uma hierarquia lógica de cabeçalhos (h1-h6) sem pular níveis.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">Forneça textos alternativos</h3>
            <p>
              Adicione atributos alt em imagens. Use textos vazios (alt="") para
              imagens decorativas.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">Garanta navegação por teclado</h3>
            <p>
              Todos os elementos interativos devem ser acessíveis via teclado
              com indicador de foco visível.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">Teste com leitores de tela</h3>
            <p>
              Teste regularmente usando leitores de tela como NVDA (Windows),
              VoiceOver (Mac) ou JAWS.
            </p>
          </div>
        </div>
      </section>

      <section id="resources" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Recursos Adicionais</h2>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WCAG 2.1 Quick Reference
            </a>
          </li>
          <li>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Accessibility"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              MDN Web Docs - Acessibilidade
            </a>
          </li>
          <li>
            <a
              href="https://reactjs.org/docs/accessibility.html"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              React - Acessibilidade
            </a>
          </li>
          <li>
            <a
              href="https://webaim.org/techniques/keyboard/"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WebAIM - Acessibilidade por Teclado
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default A11yDocs
