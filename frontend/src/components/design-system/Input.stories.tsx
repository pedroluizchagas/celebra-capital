import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input'

/**
 * O componente Input é usado para receber entrada de texto do usuário.
 * Ele suporta diferentes variantes, tamanhos, estados e validação.
 */
const meta = {
  title: 'Design System/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Campo de entrada de texto com suporte a diferentes variantes, tamanhos e estados.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Rótulo para o campo de entrada',
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
    disabled: {
      control: 'boolean',
      description: 'Se o campo está desabilitado',
    },
    readOnly: {
      control: 'boolean',
      description: 'Se o campo é somente leitura',
    },
    required: {
      control: 'boolean',
      description: 'Se o campo é obrigatório',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Se o campo deve ocupar toda a largura disponível',
    },
    placeholder: {
      control: 'text',
      description: 'Texto placeholder quando o campo está vazio',
    },
  },
  args: {
    label: 'Rótulo',
    variant: 'outlined',
    size: 'medium',
    placeholder: 'Digite algo...',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Exemplo básico com configuração padrão.
 */
export const Default: Story = {
  args: {
    label: 'Nome',
    placeholder: 'Digite seu nome',
  },
}

/**
 * Campo com texto auxiliar para fornecer contexto adicional.
 */
export const WithHelperText: Story = {
  args: {
    label: 'E-mail',
    helperText: 'Seu endereço de e-mail será usado para login',
    placeholder: 'exemplo@email.com',
  },
}

/**
 * Campo em estado de erro com mensagem explicativa.
 */
export const WithError: Story = {
  args: {
    label: 'Senha',
    type: 'password',
    error: 'A senha deve ter pelo menos 8 caracteres',
    placeholder: 'Digite sua senha',
  },
}

/**
 * Campo desabilitado que não pode ser editado.
 */
export const Disabled: Story = {
  args: {
    label: 'Username',
    disabled: true,
    value: 'usuario_exemplo',
  },
}

/**
 * Campo somente leitura, que não pode ser editado mas mantém a aparência normal.
 */
export const ReadOnly: Story = {
  args: {
    label: 'ID do perfil',
    readOnly: true,
    value: 'usr_12345678',
  },
}

/**
 * Diferentes variantes do campo de entrada.
 */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '300px',
      }}
    >
      <Input
        label="Outlined (padrão)"
        variant="outlined"
        placeholder="Variante outlined"
      />
      <Input label="Filled" variant="filled" placeholder="Variante filled" />
      <Input
        label="Standard"
        variant="standard"
        placeholder="Variante standard"
      />
    </div>
  ),
}

/**
 * Diferentes tamanhos do campo de entrada.
 */
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '300px',
      }}
    >
      <Input label="Pequeno" size="small" placeholder="Tamanho pequeno" />
      <Input label="Médio (padrão)" size="medium" placeholder="Tamanho médio" />
      <Input label="Grande" size="large" placeholder="Tamanho grande" />
    </div>
  ),
}

/**
 * Campo com ícones ou adornos no início e no fim.
 */
export const WithAdornments: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '300px',
      }}
    >
      <Input label="Valor em reais" startAdornment="R$" placeholder="0,00" />
      <Input label="Peso" endAdornment="kg" placeholder="75" />
      <Input
        label="Intervalo"
        startAdornment="Min:"
        endAdornment="Max: 100"
        placeholder="0"
      />
    </div>
  ),
}

/**
 * Campo que ocupa toda a largura disponível.
 */
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <Input
        label="Mensagem"
        fullWidth
        placeholder="Digite sua mensagem aqui"
      />
    </div>
  ),
}

/**
 * Campo de tipo diferente para usos específicos.
 */
export const DifferentTypes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '300px',
      }}
    >
      <Input label="E-mail" type="email" placeholder="exemplo@email.com" />
      <Input label="Senha" type="password" placeholder="••••••••" />
      <Input label="Data de nascimento" type="date" />
      <Input label="Idade" type="number" placeholder="25" />
      <Input
        label="URL do website"
        type="url"
        placeholder="https://exemplo.com"
      />
    </div>
  ),
}

/**
 * Exemplo interativo com estado controlado.
 */
export const Interactive: Story = {
  render: () => {
    // Usando estado React para controlar o valor e validação
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      // Validação simples
      if (newValue.length > 0 && newValue.length < 3) {
        setError('O texto deve ter pelo menos 3 caracteres')
      } else {
        setError('')
      }
    }

    return (
      <div style={{ width: '300px' }}>
        <Input
          label="Campo interativo"
          value={value}
          onChange={handleChange}
          error={error}
          helperText={!error ? 'Digite pelo menos 3 caracteres' : undefined}
          placeholder="Digite algo..."
          fullWidth
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
            <p>Valor válido: {value}</p>
          </div>
        )}
      </div>
    )
  },
}
