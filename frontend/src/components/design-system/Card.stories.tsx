import type { Meta, StoryObj } from '@storybook/react'
import Card from './Card'

/**
 * O componente Card é usado para agrupar informações relacionadas em um contêiner visual.
 * Oferece diferentes variantes e estilos para diferentes contextos de uso.
 */
const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Container para agrupar conteúdo relacionado com diferentes variantes e estilos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'Define a aparência visual do card',
    },
    noPadding: {
      control: 'boolean',
      description: 'Remove o padding interno do card',
    },
    interactive: {
      control: 'boolean',
      description: 'Adiciona estilos interativos (hover/focus)',
    },
    selected: {
      control: 'boolean',
      description: 'Mostra o card como selecionado',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais',
    },
    onClick: { action: 'clicked' },
    children: {
      control: 'text',
      description: 'Conteúdo do card',
    },
  },
  args: {
    variant: 'default',
    noPadding: false,
    interactive: false,
    selected: false,
    children: 'Conteúdo do card',
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Variante padrão do card com fundo sólido.
 */
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <div style={{ padding: '20px' }}>
        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
        >
          Título do Card
        </h3>
        <p>
          Este é um exemplo de conteúdo no card padrão. O card padrão tem um
          fundo sólido.
        </p>
      </div>
    ),
  },
}

/**
 * Variante com borda, sem preenchimento de fundo.
 */
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div style={{ padding: '20px' }}>
        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
        >
          Card com Borda
        </h3>
        <p>Este é um exemplo de card com borda, sem preenchimento de fundo.</p>
      </div>
    ),
  },
}

/**
 * Variante com sombra, dando efeito de elevação.
 */
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div style={{ padding: '20px' }}>
        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
        >
          Card Elevado
        </h3>
        <p>
          Este é um exemplo de card com sombra, criando um efeito de elevação.
        </p>
      </div>
    ),
  },
}

/**
 * Card sem padding interno, útil para conteúdo que precisa ir até as bordas.
 */
export const NoPadding: Story = {
  args: {
    noPadding: true,
    children: (
      <div style={{ padding: '0' }}>
        <img
          src="https://via.placeholder.com/300x150"
          alt="Imagem de exemplo"
          style={{ width: '100%', borderRadius: '4px 4px 0 0' }}
        />
        <div style={{ padding: '16px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Card sem Padding
          </h3>
          <p>
            Este card não tem padding interno padrão, permitindo que o conteúdo
            ocupe todo o espaço até as bordas.
          </p>
        </div>
      </div>
    ),
  },
}

/**
 * Card interativo que responde a eventos de hover e clique.
 */
export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div style={{ padding: '20px' }}>
        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
        >
          Card Interativo
        </h3>
        <p>
          Este card tem estilos interativos que respondem ao hover e foco. Tente
          passar o mouse por cima.
        </p>
      </div>
    ),
  },
}

/**
 * Card no estado selecionado.
 */
export const Selected: Story = {
  args: {
    selected: true,
    children: (
      <div style={{ padding: '20px' }}>
        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}
        >
          Card Selecionado
        </h3>
        <p>Este card está no estado selecionado, com destaque visual.</p>
      </div>
    ),
  },
}

/**
 * Card com todas as propriedades combinadas.
 */
export const ComplexExample: Story = {
  args: {
    variant: 'elevated',
    interactive: true,
    children: (
      <div style={{ padding: '0' }}>
        <img
          src="https://via.placeholder.com/300x150"
          alt="Imagem de exemplo"
          style={{ width: '100%', borderRadius: '4px 4px 0 0' }}
        />
        <div style={{ padding: '16px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Exemplo Completo
          </h3>
          <p>
            Um exemplo completo combinando várias propriedades: elevated,
            interactive e conteúdo personalizado.
          </p>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              style={{
                backgroundColor: '#6860fa',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Ver mais
            </button>
          </div>
        </div>
      </div>
    ),
  },
}
