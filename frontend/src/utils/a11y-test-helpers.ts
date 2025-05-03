/**
 * Utilidades para testes de acessibilidade
 *
 * Este arquivo fornece funções auxiliares para testar a acessibilidade dos componentes
 * utilizando o axe-core via jest-axe.
 */

import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

// Estenda as expectativas do Jest para incluir toHaveNoViolations
expect.extend(toHaveNoViolations)

/**
 * Configurações padrão para testes de acessibilidade
 * Estas configurações podem ser modificadas conforme necessário para testes específicos
 */
export const defaultAxeConfig = {
  rules: {
    // Exemplos de regras que podem ser configuradas
    'color-contrast': { enabled: true },
    'landmark-one-main': { enabled: true },
    region: { enabled: false }, // Desabilitada para testes de componentes isolados
    'page-has-heading-one': { enabled: false }, // Desabilitada para testes de componentes isolados
  },
}

/**
 * Testa a acessibilidade de um elemento HTML ou componente React
 *
 * @param container Elemento HTML ou componente a ser testado
 * @param axeOptions Opções adicionais para o axe (opcional)
 * @returns Promessa com os resultados do teste
 *
 * @example
 * it('deve estar em conformidade com diretrizes de acessibilidade', async () => {
 *   const { container } = render(<MeuComponente />);
 *   await testAccessibility(container);
 * });
 */
export async function testAccessibility(
  container: Element | null,
  axeOptions = defaultAxeConfig
) {
  if (!container) {
    throw new Error('Container não fornecido para teste de acessibilidade')
  }

  const results = await axe(container, axeOptions)
  expect(results).toHaveNoViolations()
  return results
}

/**
 * Configuração específica para testes de formulários
 */
export const formAxeConfig = {
  rules: {
    ...defaultAxeConfig.rules,
    label: { enabled: true },
    'label-content-name-mismatch': { enabled: true },
    'label-title-only': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
  },
}

/**
 * Testa a acessibilidade de um formulário
 *
 * @param formElement Elemento do formulário a ser testado
 * @param options Opções adicionais para o axe (opcional)
 * @returns Resultados dos testes
 */
export async function testFormAccessibility(
  formElement: Element | null,
  options = formAxeConfig
) {
  if (!formElement) {
    throw new Error(
      'Elemento de formulário não fornecido para teste de acessibilidade'
    )
  }

  // Validar que é realmente um formulário
  if (formElement.tagName.toLowerCase() !== 'form') {
    throw new Error('O elemento fornecido não é um formulário (<form>)')
  }

  // Verificações adicionais específicas para formulários
  const results = {
    axeResults: await axe(formElement, options),
    labelTests: testFormLabels(formElement),
    fieldTests: testFormFields(formElement),
    keyboardTests: testFormKeyboardAccessibility(formElement),
  }

  return results
}

/**
 * Testa se todos os campos do formulário têm labels associados corretamente
 *
 * @param formElement Elemento do formulário
 * @returns Resultados dos testes de labels
 */
function testFormLabels(formElement: Element): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Obter todos os campos de entrada
  const inputs = formElement.querySelectorAll(
    'input:not([type="hidden"]), select, textarea'
  )

  inputs.forEach((input) => {
    const inputElement = input as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    const id = inputElement.id

    // Verificar se o campo tem ID
    if (!id) {
      issues.push(
        `Campo sem ID: ${inputElement.tagName.toLowerCase()}${
          inputElement.name ? ` com name="${inputElement.name}"` : ''
        }`
      )
      return
    }

    // Verificar se existe um label associado
    const label = formElement.querySelector(`label[for="${id}"]`)
    if (!label) {
      issues.push(`Campo sem label associado: ${id}`)
    }

    // Verificar aria-required em campos obrigatórios
    if (
      inputElement.hasAttribute('required') &&
      !inputElement.hasAttribute('aria-required')
    ) {
      issues.push(`Campo obrigatório sem aria-required: ${id}`)
    }
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Testa outros aspectos de acessibilidade dos campos do formulário
 *
 * @param formElement Elemento do formulário
 * @returns Resultados dos testes de campos
 */
function testFormFields(formElement: Element): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Verificar mensagens de erro acessíveis
  const errorMessages = formElement.querySelectorAll(
    '.error-message, [role="alert"]'
  )
  errorMessages.forEach((message) => {
    const relatedField = message.getAttribute('aria-describedby')
      ? formElement.querySelector(`[aria-describedby*="${message.id}"]`)
      : null

    if (!relatedField) {
      issues.push(
        `Mensagem de erro sem campo associado: ${
          message.textContent?.trim() || '[Sem texto]'
        }`
      )
    }
  })

  // Verificar campos com atributos de descrição válidos
  const fieldsWithDescribedBy =
    formElement.querySelectorAll('[aria-describedby]')
  fieldsWithDescribedBy.forEach((field) => {
    const describedBy = field.getAttribute('aria-describedby') as string
    const ids = describedBy.split(/\s+/)

    ids.forEach((id) => {
      if (!id) return
      const element = document.getElementById(id)
      if (!element) {
        issues.push(
          `Campo referencia ID inexistente em aria-describedby: ${
            field.id || 'campo sem ID'
          } -> ${id}`
        )
      }
    })
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Testa a acessibilidade por teclado do formulário
 *
 * @param formElement Elemento do formulário
 * @returns Resultados dos testes de navegação por teclado
 */
function testFormKeyboardAccessibility(formElement: Element): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Verificar ordem de tabulação
  const focusableElements = getFocusableElements(formElement as HTMLElement)
  const tabIndexElements = Array.from(
    formElement.querySelectorAll('[tabindex]')
  ).filter((el) => parseInt(el.getAttribute('tabindex') || '0') > 0)

  if (tabIndexElements.length > 0) {
    issues.push(
      'Formulário contém elementos com tabindex > 0, o que pode interferir na ordem natural de tabulação'
    )
  }

  // Verificar se botões de envio são acessíveis
  const submitButtons = formElement.querySelectorAll(
    'button[type="submit"], input[type="submit"]'
  )
  if (submitButtons.length === 0) {
    issues.push('Formulário não possui botão de envio explícito')
  }

  // Verificar se existem elementos não-focáveis que deveriam ser focáveis
  const clickableWithoutFocus = Array.from(
    formElement.querySelectorAll('div[onclick], span[onclick]')
  ).filter((el) => !el.hasAttribute('tabindex'))

  if (clickableWithoutFocus.length > 0) {
    issues.push(
      'Formulário contém elementos clicáveis que não são focáveis por teclado'
    )
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Verifica se um elemento tem a definição de ARIA correta
 *
 * @param element Elemento a ser verificado
 * @param role Role ARIA esperada
 * @param attributes Atributos ARIA esperados
 *
 * @example
 * it('deve ter atributos ARIA corretos', () => {
 *   const button = screen.getByRole('button', { name: 'Enviar' });
 *   checkAriaAttributes(button, 'button', { 'aria-pressed': 'false' });
 * });
 */
export function checkAriaAttributes(
  element: HTMLElement | null,
  role: string,
  attributes: Record<string, string> = {}
) {
  if (!element) {
    throw new Error('Elemento não fornecido para verificação de atributos ARIA')
  }

  // Verifica o role
  if (role) {
    expect(element).toHaveAttribute('role', role)
  }

  // Verifica outros atributos aria
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value)
  })
}

/**
 * Verifica se um elemento é focável e o foco ocorre na ordem correta
 *
 * @param elements Array de elementos na ordem esperada de foco
 *
 * @example
 * it('deve ter ordem de foco correta', () => {
 *   const elements = [
 *     screen.getByRole('button', { name: 'Primeiro' }),
 *     screen.getByRole('button', { name: 'Segundo' }),
 *     screen.getByRole('button', { name: 'Terceiro' })
 *   ];
 *   checkFocusOrder(elements);
 * });
 */
export function checkFocusOrder(elements: HTMLElement[]) {
  if (!elements.length) {
    throw new Error(
      'Nenhum elemento fornecido para verificação de ordem de foco'
    )
  }

  // Verifica se cada elemento está na ordem correta de foco
  elements.forEach((element, index) => {
    element.focus()
    expect(document.activeElement).toBe(element)

    // Se não for o último elemento, verifica se o Tab move para o próximo elemento
    if (index < elements.length - 1) {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true,
      })
      element.dispatchEvent(event)

      // Esta abordagem é simplificada e pode não funcionar perfeitamente
      // em todos os cenários, pois o comportamento real do Tab é complexo
      // e depende da implementação do navegador
    }
  })
}

/**
 * Verifica contraste de cores entre texto e fundo
 *
 * @param foreground Cor de texto (formato hexadecimal)
 * @param background Cor de fundo (formato hexadecimal)
 * @param isLargeText Se o texto é considerado grande (>=18pt ou >=14pt bold)
 * @returns Objeto com informações sobre o contraste
 *
 * @example
 * it('deve ter contraste adequado', () => {
 *   const result = checkColorContrast('#333333', '#FFFFFF', false);
 *   expect(result.passes).toBe(true);
 * });
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  isLargeText = false
) {
  // Converter hex para RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    const fullHex = hex.replace(
      shorthandRegex,
      (_, r, g, b) => r + r + g + g + b + b
    )
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)

    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0]
  }

  // Calcular luminância relativa
  const calculateLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((value) => {
      value = value / 255
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const foregroundRgb = hexToRgb(foreground)
  const backgroundRgb = hexToRgb(background)

  const foregroundLuminance = calculateLuminance(foregroundRgb)
  const backgroundLuminance = calculateLuminance(backgroundRgb)

  // Calcular razão de contraste
  const ratio =
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)

  // Determinar se passa em WCAG AA
  const passesAA = isLargeText ? ratio >= 3 : ratio >= 4.5

  // Determinar se passa em WCAG AAA
  const passesAAA = isLargeText ? ratio >= 4.5 : ratio >= 7

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    passes: passesAA, // Compatibilidade com WCAG AA por padrão
  }
}

/**
 * Verifica se um elemento é acessível via teclado
 * @param element - Elemento a ser testado
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  // Elementos nativamente acessíveis por teclado
  const nativelyFocusable = ['a', 'button', 'input', 'select', 'textarea']

  // Elementos com atributos que os tornam focáveis
  const hasTabIndex = element.getAttribute('tabIndex') !== null

  // Verificar se elemento está desabilitado
  const isDisabled =
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'

  return (
    (nativelyFocusable.includes(element.tagName.toLowerCase()) ||
      hasTabIndex) &&
    !isDisabled
  )
}

/**
 * Verifica se um elemento possui nome acessível
 * @param element - Elemento a ser testado
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  // Verificar todos os possíveis atributos que fornecem nome acessível
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.hasAttribute('title') ||
    (element.tagName.toLowerCase() === 'img' && element.hasAttribute('alt')) ||
    element.textContent?.trim()
  )
}

/**
 * Verifica se um elemento é um landmark ARIA válido
 * @param element - Elemento a ser testado
 */
export function isValidLandmark(element: HTMLElement): boolean {
  const landmarks = [
    'banner',
    'complementary',
    'contentinfo',
    'form',
    'main',
    'navigation',
    'region',
    'search',
  ]

  const role = element.getAttribute('role')
  const tagName = element.tagName.toLowerCase()

  // Verificar role explícito
  if (role && landmarks.includes(role)) {
    return true
  }

  // Verificar elementos semânticos que implicitamente definem landmarks
  const semanticLandmarks: Record<string, string> = {
    header: 'banner',
    nav: 'navigation',
    main: 'main',
    footer: 'contentinfo',
    aside: 'complementary',
  }

  return tagName in semanticLandmarks
}

/**
 * Simula navegação por teclado em um componente
 * @param container - Container do componente a testar
 * @param maxTabs - Número máximo de tabs a simular (para evitar loops infinitos)
 */
export function simulateKeyboardNavigation(
  container: HTMLElement,
  maxTabs = 20
): HTMLElement[] {
  const focusableElements = getFocusableElements(container)

  if (focusableElements.length === 0) {
    return []
  }

  const focusSequence: HTMLElement[] = []
  let currentFocus: HTMLElement | null = null

  // Reset de foco antes de começar
  ;(document.activeElement as HTMLElement)?.blur()

  // Simular pressionar Tab várias vezes
  for (let i = 0; i < Math.min(maxTabs, focusableElements.length * 2); i++) {
    // Simular keydown do Tab
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      bubbles: true,
      cancelable: true,
      shiftKey: false,
    })

    document.dispatchEvent(tabEvent)

    // Se o evento foi cancelado (por ex: por um trap focus), fazer foco manualmente
    if (tabEvent.defaultPrevented && currentFocus) {
      const currentIndex = focusableElements.indexOf(currentFocus)
      const nextIndex = (currentIndex + 1) % focusableElements.length
      focusableElements[nextIndex].focus()
    }

    // Verificar elemento que recebeu foco
    if (document.activeElement && document.activeElement !== currentFocus) {
      currentFocus = document.activeElement as HTMLElement
      focusSequence.push(currentFocus)
    }
  }

  return focusSequence
}

/**
 * Obtém todos os elementos focáveis em um container
 * @param container - Container a ser pesquisado
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',')

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
}

/**
 * Verifica se a estrutura de cabeçalhos (h1-h6) está correta hierarquicamente
 * @param container - Container a ser testado
 */
export function checkHeadingStructure(container: HTMLElement): {
  valid: boolean
  issues: string[]
} {
  const headings = Array.from(
    container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  )
  const issues: string[] = []

  // Verificar se começa com h1
  if (headings.length > 0 && headings[0].tagName.toLowerCase() !== 'h1') {
    issues.push('A estrutura de cabeçalhos deve começar com h1')
  }

  // Verificar se não pula níveis
  for (let i = 0; i < headings.length - 1; i++) {
    const current = parseInt(headings[i].tagName.charAt(1))
    const next = parseInt(headings[i + 1].tagName.charAt(1))

    if (next > current + 1) {
      issues.push(
        `Pulo de nível de cabeçalho: ${headings[i].tagName} para ${
          headings[i + 1].tagName
        }`
      )
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

// Exportar axe para uso nos testes
export { axe }

// Configurações padrão para testes de acessibilidade
export const a11yTestConfig = {
  rules: {
    'color-contrast': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'image-alt': { enabled: true },
    label: { enabled: true },
    'link-name': { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    'meta-viewport': { enabled: true },
    'object-alt': { enabled: true },
    tabindex: { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
  },
}

// Função para testar acessibilidade de componentes
export async function testAccessibility(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container, a11yTestConfig)
  expect(results).toHaveNoViolations()
}

// Função para testar acessibilidade de formulários
export async function testFormAccessibility(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container, {
    ...a11yTestConfig,
    rules: {
      ...a11yTestConfig.rules,
      'form-field-multiple-labels': { enabled: true },
      'label-title-only': { enabled: true },
      'select-name': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}

// Função para testar acessibilidade de tabelas
export async function testTableAccessibility(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container, {
    ...a11yTestConfig,
    rules: {
      ...a11yTestConfig.rules,
      'table-fake-caption': { enabled: true },
      'td-has-header': { enabled: true },
      'th-has-data-cells': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}

// Função para testar acessibilidade de modais
export async function testModalAccessibility(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container, {
    ...a11yTestConfig,
    rules: {
      ...a11yTestConfig.rules,
      'aria-hidden-focus': { enabled: true },
      'aria-modal': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}

// Função para testar acessibilidade de navegação
export async function testNavigationAccessibility(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container, {
    ...a11yTestConfig,
    rules: {
      ...a11yTestConfig.rules,
      'aria-roles': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'heading-order': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}
