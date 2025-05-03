# Guia de Testes de Acessibilidade

Este documento fornece instruções para criar e executar testes de acessibilidade usando axe-core/react no projeto Celebra Capital.

## Configuração Inicial

O projeto já está configurado com as seguintes ferramentas:

1. **@axe-core/react**: Biblioteca para testes automatizados de acessibilidade
2. **Jest**: Para execução dos testes
3. **Utilitários personalizados**: Em `src/utils/axeHelper.ts`

## Como Escrever Testes de Acessibilidade

### 1. Nomenclatura de Arquivos

Siga o padrão de nomenclatura `.a11y.test.tsx` para arquivos de teste de acessibilidade:

```
ComponentName.a11y.test.tsx
```

### 2. Estrutura Básica de um Teste

```tsx
import React from 'react'
import { render } from '@testing-library/react'
import { checkA11y, axeConfig } from '../utils/axeHelper'
import ComponentName from './ComponentName'

describe('ComponentName - Testes de Acessibilidade', () => {
  it('não deve ter violações de acessibilidade', async () => {
    await checkA11y(<ComponentName />, axeConfig)
  })

  // Testes adicionais específicos para o componente
})
```

### 3. Testes Comuns de Acessibilidade

#### Verificação de Violações Gerais

```tsx
it('não deve ter violações de acessibilidade', async () => {
  await checkA11y(<ComponentName />, axeConfig)
})
```

#### Teste de Navegação por Teclado

```tsx
it('deve ser navegável por teclado', () => {
  const { getByRole } = render(<Button>Clique aqui</Button>)
  const button = getByRole('button')

  button.focus()
  expect(document.activeElement).toBe(button)
})
```

#### Verificação de Atributos ARIA

```tsx
it('deve ter atributos ARIA corretos quando desabilitado', () => {
  const { getByRole } = render(<Button disabled>Desabilitado</Button>)
  const button = getByRole('button')

  expect(button).toHaveAttribute('disabled')
  expect(button).toHaveAttribute('aria-disabled', 'true')
})
```

#### Teste de Contraste (Manual)

Para contraste, geralmente dependemos da inspeção visual no Storybook com o addon-a11y.

### 4. Executando os Testes

```bash
# Executar apenas testes de acessibilidade
npm run test:a11y

# Executar todos os testes incluindo acessibilidade
npm run test
```

## Boas Práticas

1. **Teste Variações**: Teste todas as variantes de um componente (tamanhos, estados, temas)
2. **Componente Completo**: Teste o componente em um contexto que represente seu uso real
3. **Contexto Necessário**: Forneça providers necessários para o componente funcionar corretamente
4. **Foco em Problemas Comuns**:
   - Elementos interativos sem nome acessível
   - Imagens sem texto alternativo
   - Controles sem labels
   - Problemas de contraste
   - Navegação por teclado interrompida

## Exemplos de Testes por Tipo de Componente

### Botões

```tsx
it('botão com ícone deve ter nome acessível', async () => {
  await checkA11y(
    <Button startIcon={<IconElement aria-hidden="true" />}>
      Texto Acessível
    </Button>,
    axeConfig
  )
})
```

### Formulários

```tsx
it('campos de formulário devem ter labels associados', async () => {
  const { getByLabelText } = render(<FormComponent />)
  expect(getByLabelText('Nome')).toBeInTheDocument()
})
```

### Modais

```tsx
it('modal deve ter foco inicial no elemento apropriado', async () => {
  const { getByRole } = render(<Modal isOpen title="Teste" />)
  const closeButton = getByRole('button', { name: 'Fechar' })
  expect(document.activeElement).toBe(closeButton)
})
```

## Solucionando Problemas Comuns

| Problema                              | Solução                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| "Element must have [role]"            | Adicione o atributo role apropriado                                                    |
| "Images must have alternate text"     | Adicione alt="" para imagens decorativas ou texto descritivo para imagens informativas |
| "Form elements must have labels"      | Use `<label>` ou aria-label/aria-labelledby                                            |
| "Elements must meet minimum contrast" | Ajuste as cores para atingir contraste AA (4.5:1)                                      |

## Referências

- [Documentação do axe-core/react](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react)
- [WCAG 2.1 Checklist](https://webaim.org/standards/wcag/checklist)
- [Testing Library - Acessibilidade](https://testing-library.com/docs/dom-testing-library/api-accessibility)

---

Para qualquer dúvida sobre testes de acessibilidade, consulte o documento principal de Diretrizes de Acessibilidade.
