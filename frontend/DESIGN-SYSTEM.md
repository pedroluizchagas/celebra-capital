# Design System - Celebra Capital

Este documento descreve o sistema de design da Celebra Capital, suas estruturas, componentes e diretrizes para uso e manutenção.

## Estrutura

O Design System da Celebra Capital está organizado da seguinte forma:

```
frontend/src/
├── styles/
│   ├── index.css         # Estilos globais e utilitários
│   ├── contrast.css      # Utilitários de contraste WCAG AA
│   ├── tokens.css        # Variáveis CSS para tokens de design
│   └── tokens.ts         # Tokens de design como constantes TypeScript
│
├── components/
│   └── design-system/
│       ├── index.ts      # Exporta todos os componentes do Design System
│       ├── Button.tsx    # Componente botão com diferentes variantes
│       ├── Button.stories.tsx   # Documentação e exemplos do componente Button
│       ├── Card.tsx      # Componente de container com diferentes variantes
│       ├── Card.stories.tsx     # Documentação e exemplos do componente Card
│       ├── Typography.tsx          # Componente para exibição de texto com estilos consistentes
│       ├── Typography.stories.tsx  # Documentação e exemplos do componente Typography
│       ├── Input.tsx               # Componente para campos de entrada de texto
│       ├── Input.stories.tsx       # Documentação e exemplos do componente Input
│       └── DesignSystem.mdx        # Documentação geral do Design System
│
└── .storybook/           # Configuração do Storybook
    ├── main.js           # Configuração principal do Storybook
    └── preview.js        # Configuração de visualização e temas
```

## Tokens de Design

Os tokens de design são as unidades fundamentais do sistema. Eles definem as constantes que serão usadas pelos componentes para garantir consistência visual.

Os tokens estão disponíveis em dois formatos:

1. **Variáveis CSS** (`tokens.css`) - Para uso direto em estilos CSS
2. **Constantes TypeScript** (`tokens.ts`) - Para uso em lógica JavaScript/TypeScript

### Categorias de Tokens

- **Cores**: Primárias, secundárias, tons de cinza, cores semânticas
- **Tipografia**: Famílias de fontes, tamanhos, pesos, alturas de linha
- **Espaçamento**: Sistema de grid e espaçamento entre elementos
- **Bordas**: Larguras e raios de borda
- **Sombras**: Níveis de elevação
- **Breakpoints**: Pontos de quebra para responsividade
- **Z-index**: Camadas de profundidade

## Componentes

Os componentes do Design System são construídos usando React e estilizados com uma combinação de Material UI, Tailwind CSS e estilos personalizados.

Cada componente:

- É fortemente tipado com TypeScript
- Utiliza os tokens de design
- Suporta temas claro e escuro
- Segue as diretrizes de acessibilidade WCAG AA
- É documentado no Storybook

### Lista atual de componentes

- **Button**: Botões com diferentes variantes, tamanhos e estados
- **Card**: Containers para agrupar informações relacionadas
- **Typography**: Componente para exibição de texto com estilos consistentes
- **Input**: Campos de entrada de texto com suporte a diferentes variantes, estados e validação

### Detalhes dos Componentes

#### Typography

O componente `Typography` oferece uma maneira consistente de exibir texto em toda a aplicação. Ele suporta:

- Diferentes variantes: h1-h6, subtitle1, subtitle2, body1, body2, caption, overline
- Cores: primary, secondary, error, warning, info, success, inherit
- Alinhamentos: left, center, right, justify
- Pesos de fonte: light, regular, medium, semibold, bold
- Propriedades adicionais: uppercase, italic, underline, truncate

Cada variante mapeia para um elemento HTML semântico apropriado, garantindo acessibilidade e SEO.

#### Input

O componente `Input` fornece campos de entrada de texto estilizados consistentemente. Características principais:

- Variantes: outlined, filled, standard
- Tamanhos: small, medium, large
- Estados: normal, error, disabled, readOnly, required
- Suporte para adornos/ícones no início e final do input
- Suporte para texto auxiliar e mensagens de erro
- Integração com formulários

## Storybook

O Storybook é usado para documentar e desenvolver os componentes do Design System. Ele permite:

- Visualizar cada componente em isolamento
- Testar diferentes estados e variantes
- Documentar props e exemplos de uso
- Verificar a aparência em temas claro e escuro

Para executar o Storybook:

```
npm run storybook
```

## Próximos passos

Este Design System está em desenvolvimento ativo. Os próximos componentes a serem adicionados são:

1. **Select**: Campos de seleção com opções
2. **Checkbox/Radio**: Campos de marcação
3. **Alert**: Componentes para mensagens de feedback
4. **Modal**: Diálogos e popovers
5. **Tabs**: Navegação por abas
6. **Table**: Tabelas de dados

## Diretrizes para contribuição

Ao adicionar novos componentes ao Design System:

1. Use os tokens de design existentes em vez de valores fixos
2. Adicione tipos TypeScript para todas as props
3. Suporte temas claro e escuro
4. Garanta a acessibilidade (contraste, navegação por teclado)
5. Documente o componente com stories no Storybook
6. Adicione exemplos para todos os estados e variantes
7. Exporte o componente em `design-system/index.ts`

## Testes

Os componentes do Design System devem ser testados usando:

- Testes unitários com Jest e Testing Library
- Testes de acessibilidade com axe-core
- Verificação visual com Storybook

## Versão atual

O Design System está atualmente na versão inicial de desenvolvimento (0.1.0).

---

Documento criado em: Abril de 2025  
Última atualização: Abril de 2025
