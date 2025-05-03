# Testando Acessibilidade de Componentes

Este documento explica como testar a acessibilidade de componentes individuais na Celebra Capital.

## 📋 Visão Geral

Temos dois métodos para testar acessibilidade:

1. **Auditoria de páginas completas** - Verifica a acessibilidade de páginas inteiras em múltiplos tamanhos de tela.
2. **Testes de componentes individuais** - Verifica a acessibilidade de componentes específicos em isolamento.

Este documento foca no segundo método.

## 🧪 Como Testar Componentes

### Usando o Storybook

A forma mais simples de testar a acessibilidade de componentes é usando o Storybook com o addon de acessibilidade:

```bash
# Iniciar o Storybook
npm run storybook
```

1. No Storybook, navegue até o componente que deseja testar.
2. Abra o painel "Accessibility" na barra inferior.
3. Verifique as violações de acessibilidade detectadas.
4. Resolva os problemas identificados e veja os resultados em tempo real.

![Storybook A11y Addon](https://storybook.js.org/images/a11y-addon.png)

### Usando os Scripts de Teste

Para testes mais automatizados e integração com CI/CD, use os scripts de teste de componentes:

```bash
# Testar todos os componentes configurados
npm run test:a11y:components

# Testar apenas os botões
npm run test:a11y:button
```

Os resultados serão exibidos no console e salvos em:

- `frontend/a11y-reports/components/`

## 🚀 Criando Testes para Novos Componentes

Para criar testes para um novo componente:

1. Crie um arquivo de teste na pasta `scripts`:

```js
// scripts/test-your-component-a11y.js
import { runComponentA11yTests } from './test-component-a11y.js'
import YourComponent from '../src/components/YourComponent'

runComponentA11yTests([
  {
    component: YourComponent,
    props: {
      /* props básicas */
    },
    name: 'YourComponent-Default',
  },
  {
    component: YourComponent,
    props: {
      /* props alternativas */
    },
    name: 'YourComponent-Alternative',
  },
])
```

2. Adicione um script ao `package.json`:

```json
"scripts": {
  "test:a11y:your-component": "node scripts/test-your-component-a11y.js"
}
```

3. Execute o teste:

```bash
npm run test:a11y:your-component
```

## 🔍 Problemas Comuns e Soluções

### Botões apenas com ícones

Os botões que contêm apenas ícones devem incluir um `aria-label`:

```jsx
// Problema:
<Button variant="icon" icon="search" />

// Solução:
<Button variant="icon" icon="search" aria-label="Pesquisar" />
```

### Imagens sem texto alternativo

As imagens informativas devem ter texto alternativo:

```jsx
// Problema:
<Image src="/logo.png" />

// Solução:
<Image src="/logo.png" alt="Logo da Celebra Capital" />
```

### Contraste de cores insuficiente

Textos e componentes interativos devem ter contraste adequado:

```jsx
// Problema:
<Text color="#aaa" backgroundColor="#eee">Texto com baixo contraste</Text>

// Solução:
<Text color="#333" backgroundColor="#fff">Texto com contraste adequado</Text>
```

## 📊 Interpretando os Resultados

Os relatórios de teste incluem:

- **Violações**: Problemas que devem ser corrigidos.
- **Impactos**: Crítico, Sério, Moderado ou Menor.
- **Passes**: Testes que passaram com sucesso.

Priorize a correção de violações com impacto Crítico e Sério primeiro.

## 🔄 Ciclo de Desenvolvimento

1. **Desenvolva** - Crie ou modifique um componente.
2. **Teste** - Execute os testes de acessibilidade.
3. **Corrija** - Resolva as violações identificadas.
4. **Valide** - Execute novamente os testes para confirmar as correções.
5. **Documente** - Registre soluções para problemas recorrentes.

---

## 📚 Recursos Adicionais

- [WCAG 2.1 em Português](https://www.w3c.br/traducoes/wcag/wcag21-pt-BR/)
- [Addon de Acessibilidade do Storybook](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Axe-core API](https://github.com/dequelabs/axe-core/blob/master/doc/API.md)

---

_Última atualização: Abril 2024_
