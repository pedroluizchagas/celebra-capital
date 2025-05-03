import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../../utils/a11y-test-helpers'
import { testAccessibility } from '../../../utils/a11y-test-helpers'
import AccessibilityToggle from '../AccessibilityToggle'

// Configuração para mockar localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('AccessibilityToggle', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear()
    // Limpar classes do documento
    document.documentElement.className = ''
    document.body.className = ''
  })

  it('deve renderizar corretamente o botão de acessibilidade', () => {
    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('deve abrir o painel quando o botão é clicado', () => {
    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })

    fireEvent.click(toggleButton)

    // Verificar se o painel está aberto
    const panel = screen.getByRole('dialog')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveAttribute('aria-hidden', 'false')
  })

  it('deve fechar o painel quando o botão de fechar é clicado', () => {
    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })

    // Abrir painel
    fireEvent.click(toggleButton)

    // Clicar no botão de fechar
    const closeButton = screen.getByRole('button', { name: /fechar/i })
    fireEvent.click(closeButton)

    // Verificar se o painel está fechado
    const panel = screen.getByRole('dialog')
    expect(panel).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve fechar o painel quando ESC é pressionado', () => {
    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })

    // Abrir painel
    fireEvent.click(toggleButton)

    // Pressionar ESC
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })

    // Verificar se o painel está fechado
    const panel = screen.getByRole('dialog')
    expect(panel).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve aplicar configurações ao mudar seletores', () => {
    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })

    // Abrir painel
    fireEvent.click(toggleButton)

    // Mudar configuração de alto contraste
    const highContrastCheckbox = screen.getByLabelText(/alto contraste/i)
    fireEvent.click(highContrastCheckbox)

    // Verificar se a classe foi aplicada ao documento
    expect(document.documentElement.classList.contains('high-contrast')).toBe(
      true
    )

    // Verificar se foi salvo no localStorage
    expect(localStorage.getItem('a11y-high-contrast')).toBe('true')
  })

  it('deve resetar configurações quando botão de reset é clicado', () => {
    // Configurar localStorage com valores iniciais
    localStorage.setItem('a11y-high-contrast', 'true')
    localStorage.setItem('a11y-font-size', '150')
    document.documentElement.classList.add('high-contrast')

    render(<AccessibilityToggle />)
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })

    // Abrir painel
    fireEvent.click(toggleButton)

    // Clicar no botão de reset
    const resetButton = screen.getByRole('button', {
      name: /restaurar padrões/i,
    })
    fireEvent.click(resetButton)

    // Verificar se as configurações foram resetadas
    expect(document.documentElement.classList.contains('high-contrast')).toBe(
      false
    )
    expect(localStorage.getItem('a11y-high-contrast')).toBe(null)
    expect(localStorage.getItem('a11y-font-size')).toBe('100')
  })

  it('deve estar em conformidade com diretrizes de acessibilidade', async () => {
    const { container } = render(<AccessibilityToggle />)

    // Teste básico de acessibilidade
    await testAccessibility(container)

    // Abrir painel para testar seu conteúdo também
    const toggleButton = screen.getByRole('button', { name: /acessibilidade/i })
    fireEvent.click(toggleButton)

    // Testar acessibilidade com painel aberto
    await testAccessibility(container)
  })
})
