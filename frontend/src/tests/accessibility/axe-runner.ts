import { axe, toHaveNoViolations } from 'jest-axe'
import { render, RenderResult } from '@testing-library/react'
import React, { ReactElement } from 'react'

// Estender o Jest com o matcher de acessibilidade
expect.extend(toHaveNoViolations)

/**
 * Configuração para teste de acessibilidade
 */
export const axeConfig = {
  rules: {
    // Regras específicas para o projeto
    'color-contrast': { enabled: true },
    'link-name': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    label: { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
    'scrollable-region-focusable': { enabled: true },
  },
}

/**
 * Testa a acessibilidade de um componente React usando axe-core
 * @param ui O componente React a ser testado
 * @param options Opções adicionais para o teste
 * @returns Promise com o resultado do teste
 */
export async function testAccessibility(
  ui: ReactElement,
  options?: { axeOptions?: any }
): Promise<void> {
  const container = render(ui)
  const results = await axe(
    container.container,
    options?.axeOptions || axeConfig
  )

  expect(results).toHaveNoViolations()
}

/**
 * Testa a acessibilidade de um componente já renderizado
 * @param container O elemento HTML que foi renderizado
 * @param options Opções adicionais para o teste
 * @returns Promise com o resultado do teste
 */
export async function testAccessibilityForRenderedComponent(
  container: RenderResult | HTMLElement,
  options?: { axeOptions?: any }
): Promise<void> {
  const element = 'container' in container ? container.container : container
  const results = await axe(element, options?.axeOptions || axeConfig)

  expect(results).toHaveNoViolations()
}

/**
 * Gerador de relatório de acessibilidade detalhado
 * Útil para identificar e corrigir problemas de acessibilidade
 * @param ui O componente React a ser testado
 * @returns Um relatório detalhado de acessibilidade
 */
export async function generateAccessibilityReport(
  ui: ReactElement,
  options?: { axeOptions?: any }
): Promise<string> {
  const container = render(ui)
  const results = await axe(
    container.container,
    options?.axeOptions || axeConfig
  )

  let report = '## Relatório de Acessibilidade\n\n'

  if (results.violations.length === 0) {
    report += '✅ Nenhuma violação de acessibilidade detectada!\n'
    return report
  }

  report += `❌ **${results.violations.length} violações encontradas:**\n\n`

  results.violations.forEach((violation, index) => {
    report += `### ${index + 1}. ${violation.id}: ${violation.help}\n`
    report += `**Impacto:** ${violation.impact}\n`
    report += `**Descrição:** ${violation.description}\n`
    report += `**Link de ajuda:** ${violation.helpUrl}\n\n`

    report += '**Elementos afetados:**\n'
    violation.nodes.forEach((node, nodeIndex) => {
      report += `${nodeIndex + 1}. \`${node.html}\`\n`
      report += `   - **Caminho:** ${node.target.join(' > ')}\n`
      if (node.failureSummary) {
        report += `   - **Problema:** ${node.failureSummary}\n`
      }
      report += '\n'
    })

    report += '---\n\n'
  })

  return report
}

/**
 * Cria um teste completo de componente com verificação de acessibilidade
 * Combina renderização e teste de acessibilidade em uma única função
 * @param name Nome do teste
 * @param element Elemento a ser testado
 * @param assertion Função opcional para testar o componente além da acessibilidade
 */
export function testComponentWithAccessibility(
  name: string,
  element: ReactElement,
  assertion?: (container: RenderResult) => void | Promise<void>
): void {
  test(name, async () => {
    const container = render(element)

    if (assertion) {
      await assertion(container)
    }

    await testAccessibilityForRenderedComponent(container)
  })
}
