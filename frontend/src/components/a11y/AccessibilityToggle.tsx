import React, { useState, useEffect } from 'react'
import { VisuallyHidden } from './VisuallyHidden'
import FocusManager from './FocusManager'

// Tipos de configurações de acessibilidade
interface A11ySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  fontSize: string
  letterSpacing: string
  dyslexicFont: boolean
}

interface AccessibilityToggleProps {
  /** Posição do botão na tela */
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
}

const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({
  position = 'bottom-right',
}) => {
  // Estado para as configurações de acessibilidade
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(() => {
    // Carregar configurações salvas do localStorage
    const savedSettings = localStorage.getItem('a11y-settings')
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          fontSize: '100',
          letterSpacing: 'normal',
          dyslexicFont: false,
        }
  })

  // Aplicar configurações ao carregar o componente
  useEffect(() => {
    applySettings()
  }, [settings])

  // Aplicar configurações ao documento
  const applySettings = () => {
    const htmlElement = document.documentElement

    // Alto contraste
    if (settings.highContrast) {
      htmlElement.classList.add('high-contrast')
    } else {
      htmlElement.classList.remove('high-contrast')
    }

    // Texto grande
    if (settings.largeText) {
      htmlElement.classList.add('large-text')
    } else {
      htmlElement.classList.remove('large-text')
    }

    // Reduzir movimento
    if (settings.reducedMotion) {
      htmlElement.classList.add('reduced-motion')
    } else {
      htmlElement.classList.remove('reduced-motion')
    }

    // Tamanho da fonte
    htmlElement.classList.remove(
      'font-size-100',
      'font-size-120',
      'font-size-150',
      'font-size-200'
    )
    if (settings.fontSize !== '100') {
      htmlElement.classList.add(`font-size-${settings.fontSize}`)
    }

    // Espaçamento de letras
    htmlElement.classList.remove(
      'spacing-normal',
      'spacing-loose',
      'spacing-wide'
    )
    if (settings.letterSpacing !== 'normal') {
      htmlElement.classList.add(`spacing-${settings.letterSpacing}`)
    }

    // Fonte para dislexia
    if (settings.dyslexicFont) {
      htmlElement.classList.add('dyslexia-friendly')
    } else {
      htmlElement.classList.remove('dyslexia-friendly')
    }

    // Salvar no localStorage
    localStorage.setItem('a11y-settings', JSON.stringify(settings))
  }

  // Alternar configurações
  const toggleSetting = (setting: keyof A11ySettings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Atualizar um valor de configuração
  const updateSetting = (setting: keyof A11ySettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  // Restaurar todas as configurações para o padrão
  const resetSettings = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      fontSize: '100',
      letterSpacing: 'normal',
      dyslexicFont: false,
    })
  }

  // Alternar a visibilidade do painel
  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  // Fechar o painel quando ESC é pressionado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Mapear posição para classes CSS
  const positionClasses = {
    'top-right': 'top-20 right-0',
    'bottom-right': 'bottom-20 right-0',
    'bottom-left': 'bottom-20 left-0',
    'top-left': 'top-20 left-0',
  }

  return (
    <div className="relative">
      {/* Botão de acessibilidade */}
      <button
        className={`fixed z-50 p-2 bg-blue-600 text-white rounded-l-lg ${
          position.includes('right') ? 'right-0' : 'left-0'
        } ${position.includes('top') ? 'top-20' : 'bottom-20'}`}
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label="Opções de acessibilidade"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="21.17" y1="8" x2="12" y2="8" />
          <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
          <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
        </svg>
        <VisuallyHidden>Acessibilidade</VisuallyHidden>
      </button>

      {/* Painel de configurações */}
      <FocusManager
        isActive={isOpen}
        trapFocus={true}
        returnFocus={true}
        initialFocusId="a11y-close-button"
      >
        <div
          id="accessibility-panel"
          className={`fixed ${
            positionClasses[position]
          } bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-72 ${
            isOpen ? 'open' : ''
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-heading"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
            }
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 id="a11y-heading" className="text-lg font-bold">
              Acessibilidade
            </h2>
            <button
              id="a11y-close-button"
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar painel de acessibilidade"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Alto contraste */}
            <div className="flex items-center justify-between">
              <label htmlFor="highContrast" className="text-sm">
                Alto contraste
              </label>
              <button
                id="highContrast"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSetting('highContrast')
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue ${
                  settings.highContrast ? 'bg-celebra-blue' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={settings.highContrast}
                aria-describedby="highContrastDesc"
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <VisuallyHidden>
                  {settings.highContrast ? 'Desativar' : 'Ativar'} alto
                  contraste
                </VisuallyHidden>
              </button>
              <div id="highContrastDesc" className="sr-only">
                Aumenta o contraste para melhorar a legibilidade
              </div>
            </div>

            {/* Texto grande */}
            <div className="flex items-center justify-between">
              <label htmlFor="largeText" className="text-sm">
                Texto grande
              </label>
              <button
                id="largeText"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSetting('largeText')
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue ${
                  settings.largeText ? 'bg-celebra-blue' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={settings.largeText}
                aria-describedby="largeTextDesc"
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <VisuallyHidden>
                  {settings.largeText ? 'Desativar' : 'Ativar'} texto grande
                </VisuallyHidden>
              </button>
              <div id="largeTextDesc" className="sr-only">
                Aumenta o tamanho do texto em todos os elementos
              </div>
            </div>

            {/* Reduzir movimento */}
            <div className="flex items-center justify-between">
              <label htmlFor="reducedMotion" className="text-sm">
                Reduzir animações
              </label>
              <button
                id="reducedMotion"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSetting('reducedMotion')
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue ${
                  settings.reducedMotion ? 'bg-celebra-blue' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-describedby="reducedMotionDesc"
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <VisuallyHidden>
                  {settings.reducedMotion ? 'Desativar' : 'Ativar'} redução de
                  animações
                </VisuallyHidden>
              </button>
              <div id="reducedMotionDesc" className="sr-only">
                Reduz ou remove animações e efeitos de movimento
              </div>
            </div>

            {/* Tamanho da fonte */}
            <div>
              <label htmlFor="font-size" className="block mb-2">
                Tamanho da fonte:
              </label>
              <select
                id="font-size"
                className="w-full border border-gray-300 rounded p-2"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
              >
                <option value="100">Normal</option>
                <option value="120">Médio (120%)</option>
                <option value="150">Grande (150%)</option>
                <option value="200">Muito Grande (200%)</option>
              </select>
            </div>

            {/* Espaçamento de texto */}
            <div>
              <label htmlFor="letter-spacing" className="block mb-2">
                Espaçamento do texto:
              </label>
              <select
                id="letter-spacing"
                className="w-full border border-gray-300 rounded p-2"
                value={settings.letterSpacing}
                onChange={(e) => updateSetting('letterSpacing', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="loose">Ampliado</option>
                <option value="wide">Muito ampliado</option>
              </select>
            </div>

            {/* Fonte para dislexia */}
            <div className="flex items-center justify-between">
              <label htmlFor="dyslexicFont" className="text-sm">
                Fonte para dislexia
              </label>
              <button
                id="dyslexicFont"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSetting('dyslexicFont')
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue ${
                  settings.dyslexicFont ? 'bg-celebra-blue' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={settings.dyslexicFont}
                aria-describedby="dyslexicFontDesc"
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.dyslexicFont ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <VisuallyHidden>
                  {settings.dyslexicFont ? 'Desativar' : 'Ativar'} fonte para
                  dislexia
                </VisuallyHidden>
              </button>
              <div id="dyslexicFontDesc" className="sr-only">
                Utiliza uma fonte mais amigável para pessoas com dislexia
              </div>
            </div>
          </div>

          {/* Botão de resetar configurações */}
          <div className="mt-4">
            <button
              onClick={resetSettings}
              className="w-full py-2 text-sm text-celebra-blue border border-celebra-blue rounded hover:bg-celebra-blue hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
            >
              Restaurar configurações padrão
            </button>
          </div>
        </div>
      </FocusManager>
    </div>
  )
}

export default AccessibilityToggle
