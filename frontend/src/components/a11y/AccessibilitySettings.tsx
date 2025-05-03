import React, { useState, useEffect } from 'react'
import { HighContrastToggle } from './A11yUtils'

interface AccessibilitySettingsProps {
  className?: string
}

/**
 * Componente de configurações de acessibilidade
 * Permite usuários ajustarem preferências como tamanho de fonte, contraste, etc.
 */
export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  className,
}) => {
  // Configurações de fonte
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('a11y-font-size') || '100'
  })

  // Configurações de espaçamento
  const [textSpacing, setTextSpacing] = useState(() => {
    return localStorage.getItem('a11y-text-spacing') === 'true'
  })

  // Configurações de redução de movimento
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('a11y-reduce-motion') === 'true'
  })

  // Aplica as configurações ao carregar o componente
  useEffect(() => {
    // Aplicar tamanho da fonte
    document.documentElement.style.fontSize = `${fontSize}%`
    localStorage.setItem('a11y-font-size', fontSize)

    // Aplicar espaçamento de texto
    if (textSpacing) {
      document.body.classList.add('increased-spacing')
    } else {
      document.body.classList.remove('increased-spacing')
    }
    localStorage.setItem('a11y-text-spacing', textSpacing.toString())

    // Aplicar redução de movimento
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
    localStorage.setItem('a11y-reduce-motion', reduceMotion.toString())
  }, [fontSize, textSpacing, reduceMotion])

  // Handler para alteração de tamanho de fonte
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(e.target.value)
  }

  return (
    <div
      className={`accessibility-settings ${className || ''}`}
      aria-labelledby="a11y-settings-heading"
    >
      <h2 id="a11y-settings-heading" className="text-xl font-semibold mb-4">
        Configurações de Acessibilidade
      </h2>

      <div className="space-y-6">
        {/* Tamanho da fonte */}
        <div>
          <label htmlFor="font-size" className="block font-medium mb-2">
            Tamanho da fonte: {fontSize}%
          </label>
          <input
            type="range"
            id="font-size"
            min="80"
            max="200"
            step="10"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="w-full"
            aria-valuemin={80}
            aria-valuemax={200}
            aria-valuenow={parseInt(fontSize)}
          />
          <div className="flex justify-between text-sm mt-1">
            <span>Menor</span>
            <span>Normal</span>
            <span>Maior</span>
          </div>
        </div>

        {/* Alto Contraste */}
        <div>
          <span className="block font-medium mb-2">Contraste</span>
          <HighContrastToggle className="rounded bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
        </div>

        {/* Espaçamento de texto */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={textSpacing}
              onChange={() => setTextSpacing(!textSpacing)}
              className="h-4 w-4 mr-2"
            />
            <span>Aumentar espaçamento de texto</span>
          </label>
        </div>

        {/* Redução de movimento */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={() => setReduceMotion(!reduceMotion)}
              className="h-4 w-4 mr-2"
            />
            <span>Reduzir animações</span>
          </label>
        </div>

        {/* Botão para resetar configurações */}
        <button
          onClick={() => {
            setFontSize('100')
            setTextSpacing(false)
            setReduceMotion(false)
            localStorage.removeItem('high-contrast')
            document.documentElement.classList.remove('high-contrast')
          }}
          className="mt-4 rounded border border-blue-600 text-blue-600 py-2 px-4 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Restaurar configurações padrão de acessibilidade"
        >
          Restaurar Padrões
        </button>
      </div>
    </div>
  )
}
