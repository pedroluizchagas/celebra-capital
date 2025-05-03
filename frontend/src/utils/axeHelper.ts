import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from '@axe-core/react'
import React from 'react'

// Estender as expectativas do Jest para incluir acessibilidade
expect.extend(toHaveNoViolations)

/**
 * Função utilitária para testar a acessibilidade de um componente React
 * @param ui Componente React a ser testado
 * @param options Opções adicionais para passar para o axe
 */
export async function checkA11y(
  ui: React.ReactElement,
  options = {}
): Promise<void> {
  const container = render(ui).container
  const results = await axe(container, options)

  expect(results).toHaveNoViolations()
}

/**
 * Configuração para o axe utilizar a linguagem portuguesa
 */
export const axeConfig = {
  locale: {
    lang: 'pt-BR',
    rules: {
      'aria-allowed-attr': {
        description: 'Atributos ARIA devem corresponder a seus papeis',
        help: 'Verifique se os atributos ARIA são válidos para o papel do elemento',
      },
      'aria-hidden-body': {
        description: 'O elemento body não deve ter aria-hidden',
        help: 'Remova aria-hidden="true" do elemento body',
      },
      'aria-required-attr': {
        description: 'Elementos ARIA precisam de atributos obrigatórios',
        help: 'Verifique se todos os atributos ARIA necessários estão presentes',
      },
      'color-contrast': {
        description: 'Elementos devem ter contraste de cor suficiente',
        help: 'Aumente o contraste entre a cor de fundo e a cor do texto',
      },
      'document-title': {
        description: 'Documentos devem ter um título',
        help: 'Adicione um título ao documento',
      },
      'form-field-multiple-labels': {
        description: 'Campos de formulário não devem ter múltiplos rótulos',
        help: 'Mantenha apenas um elemento label para cada campo de formulário',
      },
      label: {
        description: 'Campos de formulário precisam de rótulos',
        help: 'Adicione um rótulo (label) ao elemento de formulário',
      },
    },
  },
}
