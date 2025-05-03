import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { withA11y } from '@storybook/addon-a11y'
import { axeConfig } from '../src/utils/axeHelper'

// Tema claro padrão
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6860fa', // Primary-500
    },
    secondary: {
      main: '#0070f3', // Secondary-500
    },
    error: {
      main: '#ef4444', // Red-500
    },
    warning: {
      main: '#f59e0b', // Yellow-500
    },
    info: {
      main: '#3b82f6', // Blue-500
    },
    success: {
      main: '#10b981', // Green-500
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

// Tema escuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7a80ff', // Primary-400
    },
    secondary: {
      main: '#0091ff', // Secondary-400
    },
    error: {
      main: '#f87171', // Red-400
    },
    warning: {
      main: '#fbbf24', // Yellow-400
    },
    info: {
      main: '#60a5fa', // Blue-400
    },
    success: {
      main: '#34d399', // Green-400
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#111827',
        },
      ],
    },
    // Configurações do addon de acessibilidade
    a11y: {
      // Passa as configurações de localização do axe
      config: axeConfig,
      // Opções para o addon-a11y
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
      // Personalização de como as violações são exibidas
      manual: true,
    },
  },
  // Adiciona o decorator de acessibilidade para todos os stories
  decorators: [
    withA11y,
    (Story, context) => {
      // Alterna entre temas claro e escuro com base no contexto do Storybook
      const theme = context.globals.theme === 'dark' ? darkTheme : lightTheme

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ padding: '2rem' }}>
            <Story />
          </div>
        </ThemeProvider>
      )
    },
  ],
  globalTypes: {
    theme: {
      name: 'Tema',
      description: 'Tema global da aplicação',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Tema Claro' },
          { value: 'dark', icon: 'moon', title: 'Tema Escuro' },
        ],
        showName: true,
      },
    },
  },
}

export default preview
