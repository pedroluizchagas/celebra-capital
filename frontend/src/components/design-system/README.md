# Design System da Celebra Capital

Este diretório contém os componentes e configurações do Design System da Celebra Capital, criados para garantir consistência visual e comportamental em toda a aplicação.

## Componentes Implementados

- ✅ **Button**: Botões com diferentes variantes, tamanhos e estados
- ✅ **Card**: Containers para agrupar informações relacionadas
- ✅ **Typography**: Componente para exibição de texto com estilos consistentes
- ✅ **Input**: Campos de entrada de texto com suporte a diferentes estados e validação

## Tokens de Design

Os tokens de design estão disponíveis em:

- 📄 `src/styles/tokens.ts` - Tokens em TypeScript
- 📄 `src/styles/tokens.css` - Variáveis CSS

## Documentação

A documentação completa dos componentes está disponível via Storybook. Para visualizar:

```
npm run storybook
```

## Próximos Componentes Planejados

- ⬜ **Select**: Campos de seleção com opções
- ⬜ **Checkbox/Radio**: Campos de marcação
- ⬜ **Alert**: Componentes para mensagens de feedback
- ⬜ **Modal**: Diálogos e popovers
- ⬜ **Tabs**: Navegação por abas
- ⬜ **Table**: Tabelas de dados

## Como Usar

Os componentes podem ser importados diretamente:

```tsx
import { Button, Typography, Card, Input } from 'src/components/design-system'

function MyComponent() {
  return (
    <Card variant="elevated">
      <Typography variant="h2">Título do Card</Typography>
      <Typography variant="body1">
        Este é um exemplo de como usar os componentes do Design System.
      </Typography>
      <Input label="Nome" placeholder="Digite seu nome" />
      <Button variant="primary">Enviar</Button>
    </Card>
  )
}
```

## Princípios do Design System

1. **Consistência**: Componentes seguem os mesmos padrões de design e comportamento
2. **Acessibilidade**: Todos os componentes seguem diretrizes WCAG AA
3. **Responsividade**: Componentes se adaptam a diferentes tamanhos de tela
4. **Reutilização**: Componentes são modulares e podem ser combinados
5. **Documentação**: Todos os componentes têm exemplos e documentação no Storybook

## Contribuição

Ao adicionar novos componentes:

1. Crie o componente seguindo os padrões existentes
2. Adicione tipos TypeScript para todas as props
3. Crie um arquivo de stories para documentação
4. Atualize o arquivo `index.ts` para exportar o novo componente
5. Teste o componente em diferentes temas e tamanhos de tela

Consulte o arquivo `DESIGN-SYSTEM.md` na raiz do projeto para mais detalhes sobre as convenções e diretrizes.
