// Exemplo de script para testar a acessibilidade do componente Button
import { runComponentA11yTests } from './test-component-a11y.js'

// Importando componentes para teste
// Nota: Ajuste os caminhos de importação conforme necessário
import Button from '../src/components/design-system/Button.jsx'

// Executar testes com diferentes variações do componente
runComponentA11yTests([
  {
    component: Button,
    props: {
      children: 'Enviar',
      variant: 'primary',
    },
    name: 'Button-Primary',
  },
  {
    component: Button,
    props: {
      children: 'Cancelar',
      variant: 'secondary',
    },
    name: 'Button-Secondary',
  },
  {
    component: Button,
    props: {
      children: 'Enviar',
      variant: 'primary',
      disabled: true,
    },
    name: 'Button-Primary-Disabled',
  },
  // Botão sem texto - potencial problema de acessibilidade
  {
    component: Button,
    props: {
      children: '',
      variant: 'icon',
      icon: 'search',
    },
    name: 'Button-Icon-Only',
  },
  // Botão com aria-label - solução para botão apenas com ícone
  {
    component: Button,
    props: {
      children: '',
      variant: 'icon',
      icon: 'search',
      'aria-label': 'Pesquisar',
    },
    name: 'Button-Icon-Only-WithAriaLabel',
  },
])

// Para executar este script:
// node --experimental-modules scripts/test-button-a11y.js
