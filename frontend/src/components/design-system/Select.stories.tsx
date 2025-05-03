import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Select from './Select'

/**
 * O componente Select é usado para permitir que o usuário escolha uma ou mais opções de uma lista suspensa.
 * Ele suporta diferentes variantes, tamanhos, estados e validação.
 */
const meta = {
  title: 'Design System/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente para seleção de opções em uma lista suspensa, seguindo o Design System.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Rótulo para o campo de seleção',
    },
    helperText: {
      control: 'text',
      description: 'Texto auxiliar exibido abaixo do campo',
    },
    error: {
      control: 'text',
      description: 'Mensagem de erro ou indicador de estado de erro',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Variante visual do campo',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Tamanho do campo',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Se o campo deve ocupar toda a largura disponível',
    },
    options: {
      control: 'object',
      description: 'Array de opções para o select',
    },
    multiple: {
      control: 'boolean',
      description: 'Se permite selecionar múltiplas opções',
    },
    placeholder: {
      control: 'text',
      description: 'Texto placeholder quando nenhuma opção está selecionada',
    },
  },
  args: {
    label: 'Selecione uma opção',
    variant: 'outlined',
    size: 'medium',
    placeholder: 'Escolha uma opção...',
    options: [
      { value: 'option1', label: 'Opção 1' },
      { value: 'option2', label: 'Opção 2' },
      { value: 'option3', label: 'Opção 3' },
    ],
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Exemplo básico com configuração padrão.
 */
export const Default: Story = {
  args: {
    label: 'Categoria',
    placeholder: 'Selecione uma categoria',
    options: [
      { value: 'electronics', label: 'Eletrônicos' },
      { value: 'clothing', label: 'Roupas' },
      { value: 'books', label: 'Livros' },
      { value: 'food', label: 'Alimentos' },
    ],
  },
}

/**
 * Select com texto auxiliar para fornecer contexto adicional.
 */
export const WithHelperText: Story = {
  args: {
    label: 'Estado',
    helperText: 'Selecione o estado onde você reside',
    placeholder: 'Selecione um estado',
    options: [
      { value: 'sp', label: 'São Paulo' },
      { value: 'rj', label: 'Rio de Janeiro' },
      { value: 'mg', label: 'Minas Gerais' },
      { value: 'rs', label: 'Rio Grande do Sul' },
    ],
  },
}

/**
 * Select em estado de erro com mensagem explicativa.
 */
export const WithError: Story = {
  args: {
    label: 'Plano',
    error: 'Por favor, selecione um plano para continuar',
    placeholder: 'Selecione um plano',
    options: [
      { value: 'basic', label: 'Básico' },
      { value: 'standard', label: 'Padrão' },
      { value: 'premium', label: 'Premium' },
    ],
  },
}

/**
 * Select com opção desabilitada.
 */
export const WithDisabledOption: Story = {
  args: {
    label: 'Meses',
    placeholder: 'Selecione um mês',
    options: [
      { value: 'jan', label: 'Janeiro' },
      { value: 'feb', label: 'Fevereiro' },
      { value: 'mar', label: 'Março', disabled: true },
      { value: 'apr', label: 'Abril' },
      { value: 'may', label: 'Maio' },
    ],
  },
}

/**
 * Diferentes variantes do select.
 */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '250px',
      }}
    >
      <Select
        label="Outlined (padrão)"
        variant="outlined"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
      <Select
        label="Filled"
        variant="filled"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
      <Select
        label="Standard"
        variant="standard"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
    </div>
  ),
}

/**
 * Diferentes tamanhos do select.
 */
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '250px',
      }}
    >
      <Select
        label="Pequeno"
        size="small"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
      <Select
        label="Médio (padrão)"
        size="medium"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
      <Select
        label="Grande"
        size="large"
        placeholder="Selecione..."
        options={[
          { value: 'opt1', label: 'Primeira opção' },
          { value: 'opt2', label: 'Segunda opção' },
        ]}
      />
    </div>
  ),
}

/**
 * Select com múltipla seleção.
 */
export const MultipleSelect: Story = {
  args: {
    label: 'Habilidades',
    placeholder: 'Selecione suas habilidades',
    multiple: true,
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'node', label: 'Node.js' },
    ],
  },
}

/**
 * Select que ocupa toda a largura disponível.
 */
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      <Select
        label="País"
        fullWidth
        placeholder="Selecione um país"
        options={[
          { value: 'br', label: 'Brasil' },
          { value: 'us', label: 'Estados Unidos' },
          { value: 'ca', label: 'Canadá' },
          { value: 'jp', label: 'Japão' },
        ]}
      />
    </div>
  ),
}

/**
 * Exemplo interativo com estado controlado.
 */
export const Interactive: Story = {
  render: () => {
    // Usando estado React para controlar o valor selecionado
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    const handleChange = (
      event: React.ChangeEvent<{ name?: string; value: unknown }>
    ) => {
      const newValue = event.target.value as string
      setValue(newValue)

      // Validação simples
      if (!newValue) {
        setError('Por favor, selecione uma opção')
      } else {
        setError('')
      }
    }

    return (
      <div style={{ width: '300px' }}>
        <Select
          label="Prioridade da tarefa"
          value={value}
          onChange={handleChange}
          error={error}
          helperText={
            !error ? 'Selecione a prioridade desta tarefa' : undefined
          }
          placeholder="Selecione a prioridade"
          fullWidth
          options={[
            { value: 'low', label: 'Baixa' },
            { value: 'medium', label: 'Média' },
            { value: 'high', label: 'Alta' },
            { value: 'urgent', label: 'Urgente' },
          ]}
        />

        {value && !error && (
          <div
            style={{
              marginTop: '16px',
              padding: '8px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
            }}
          >
            <p>
              Prioridade selecionada:{' '}
              {{
                low: 'Baixa',
                medium: 'Média',
                high: 'Alta',
                urgent: 'Urgente',
              }[value] || value}
            </p>
          </div>
        )}
      </div>
    )
  },
}

/**
 * Select com renderização personalizada das opções.
 */
export const CustomOption: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <Select
        label="Idioma"
        placeholder="Selecione um idioma"
        options={[
          { value: 'pt', label: 'Português' },
          { value: 'en', label: 'Inglês' },
          { value: 'es', label: 'Espanhol' },
          { value: 'fr', label: 'Francês' },
        ]}
        renderOption={(option) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor:
                  option.value === 'pt'
                    ? '#009c3b'
                    : option.value === 'en'
                    ? '#012169'
                    : option.value === 'es'
                    ? '#f1bf00'
                    : option.value === 'fr'
                    ? '#002654'
                    : '#ccc',
              }}
            />
            <span>{option.label}</span>
          </div>
        )}
      />
    </div>
  ),
}
