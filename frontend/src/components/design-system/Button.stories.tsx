import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

/**
 * O componente Button é usado para iniciar uma ação. É um componente fundamental do Design System.
 * Ele suporta diferentes variantes, tamanhos e estados.
 */
const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Botão interativo com diferentes variantes, tamanhos e estados.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'text'],
      description: 'Define a aparência visual do botão',
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'Define o tamanho do botão',
    },
    isLoading: {
      control: 'boolean',
      description: 'Exibe um indicador de carregamento',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilita o botão',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Faz o botão ocupar toda a largura disponível',
    },
    startIcon: {
      control: 'text',
      description:
        'Ícone exibido no início do botão (apenas para demonstração)',
    },
    endIcon: {
      control: 'text',
      description: 'Ícone exibido no final do botão (apenas para demonstração)',
    },
    onClick: { action: 'clicked' },
    children: {
      control: 'text',
      description: 'Conteúdo do botão',
    },
    'aria-label': {
      control: 'text',
      description: 'Rótulo de acessibilidade para o botão (quando necessário)',
    },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    isLoading: false,
    disabled: false,
    fullWidth: false,
    children: 'Botão',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Variante primária do botão, usada para ações principais.
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Botão Primário',
  },
}

/**
 * Variante secundária, usada para ações importantes, mas não a principal da tela.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Botão Secundário',
  },
}

/**
 * Variante outline, usada para ações menos enfatizadas ou em fundos coloridos.
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Botão Outline',
  },
}

/**
 * Variante de texto, usada para ações terciárias ou links discretos.
 */
export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Botão Texto',
  },
}

/**
 * Versão pequena do botão, útil para interfaces densas.
 */
export const Small: Story = {
  args: {
    size: 'small',
    children: 'Botão Pequeno',
  },
}

/**
 * Versão grande do botão, útil para aumentar a área clicável ou dar destaque.
 */
export const Large: Story = {
  args: {
    size: 'large',
    children: 'Botão Grande',
  },
}

/**
 * Estado de carregamento do botão, usado durante operações assíncronas.
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Carregando...',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-valid-attr-value',
            enabled: true,
          },
        ],
      },
    },
  },
}

/**
 * Botão desabilitado, utilizado quando a ação não está disponível.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Botão Desabilitado',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-allowed-attr',
            enabled: true,
          },
        ],
      },
    },
  },
}

/**
 * Botão com largura completa, útil para formulários ou ações em telas móveis.
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Botão com Largura Total',
  },
  parameters: {
    layout: 'padded',
  },
}

/**
 * Botão com apenas ícone, precisa de aria-label para acessibilidade.
 */
export const IconOnly: Story = {
  args: {
    children: '★',
    'aria-label': 'Favoritar item',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
}
