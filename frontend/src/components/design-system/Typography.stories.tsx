import type { Meta, StoryObj } from '@storybook/react'
import Typography from './Typography'

/**
 * O componente Typography é usado para apresentar texto com estilos consistentes no Design System.
 * Suporta diferentes variantes, cores, alinhamentos e formatações.
 */
const meta = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente para exibir texto com estilos consistentes seguindo o Design System.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'overline',
      ],
      description: 'Variante tipográfica',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'inherit',
      ],
      description: 'Cor do texto',
    },
    align: {
      control: 'radio',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Alinhamento do texto',
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'semibold', 'bold'],
      description: 'Peso da fonte',
    },
    uppercase: {
      control: 'boolean',
      description: 'Texto em maiúsculas',
    },
    italic: {
      control: 'boolean',
      description: 'Texto em itálico',
    },
    underline: {
      control: 'boolean',
      description: 'Texto sublinhado',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncar texto com reticências',
    },
    children: {
      control: 'text',
      description: 'Conteúdo do texto',
    },
  },
  args: {
    variant: 'body1',
    color: 'primary',
    align: 'left',
    children: 'Texto de exemplo',
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Exemplo de uso básico com configurações padrão.
 */
export const Default: Story = {
  args: {
    children: 'Este é um texto padrão usando o componente Typography',
  },
}

/**
 * Exemplos de todas as variantes de cabeçalho (h1-h6).
 */
export const Headings: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <Typography variant="h1">Heading 1 (h1)</Typography>
      <Typography variant="h2">Heading 2 (h2)</Typography>
      <Typography variant="h3">Heading 3 (h3)</Typography>
      <Typography variant="h4">Heading 4 (h4)</Typography>
      <Typography variant="h5">Heading 5 (h5)</Typography>
      <Typography variant="h6">Heading 6 (h6)</Typography>
    </div>
  ),
}

/**
 * Exemplos de variantes de texto para corpo.
 */
export const BodyText: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <Typography variant="subtitle1">
        Subtítulo 1 - usado para títulos de seções.
      </Typography>
      <Typography variant="subtitle2">
        Subtítulo 2 - usado para subtítulos menores.
      </Typography>
      <Typography variant="body1">
        Body 1 - O principal estilo de texto para a maioria dos conteúdos. Esta
        é uma variante com tamanho maior, adequada para textos principais. Lorem
        ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod nisl
        id eros feugiat, sed volutpat tortor tincidunt.
      </Typography>
      <Typography variant="body2" style={{ marginTop: '1rem' }}>
        Body 2 - Texto um pouco menor que body1, usado para textos secundários
        ou complementares. Lorem ipsum dolor sit amet, consectetur adipiscing
        elit. Nullam euismod nisl id eros feugiat, sed volutpat tortor
        tincidunt.
      </Typography>
      <Typography variant="caption" style={{ marginTop: '1rem' }}>
        Caption - Usado para legendas ou textos auxiliares, como notas de rodapé
        ou legendas de imagens.
      </Typography>
      <Typography variant="overline" style={{ marginTop: '1rem' }}>
        OVERLINE - USADO PARA RÓTULOS OU CATEGORIAS
      </Typography>
    </div>
  ),
}

/**
 * Demonstração das diferentes cores de texto disponíveis.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <Typography color="primary">Texto com cor primária (padrão)</Typography>
      <Typography color="secondary">Texto com cor secundária</Typography>
      <Typography color="error">Texto com cor de erro</Typography>
      <Typography color="warning">Texto com cor de aviso</Typography>
      <Typography color="info">Texto com cor de informação</Typography>
      <Typography color="success">Texto com cor de sucesso</Typography>
    </div>
  ),
}

/**
 * Demonstração dos diferentes alinhamentos de texto.
 */
export const Alignment: Story = {
  render: () => (
    <div
      style={{ maxWidth: '800px', border: '1px dashed #ccc', padding: '1rem' }}
    >
      <Typography align="left">
        Este texto está alinhado à esquerda (padrão). Lorem ipsum dolor sit
        amet, consectetur adipiscing elit.
      </Typography>
      <Typography align="center" style={{ marginTop: '1rem' }}>
        Este texto está centralizado. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit.
      </Typography>
      <Typography align="right" style={{ marginTop: '1rem' }}>
        Este texto está alinhado à direita. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit.
      </Typography>
      <Typography align="justify" style={{ marginTop: '1rem' }}>
        Este texto está justificado. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Nullam euismod nisl id eros feugiat, sed volutpat
        tortor tincidunt. Praesent euismod nunc vel massa scelerisque, ut varius
        mauris fringilla. Mauris id tortor in odio mollis faucibus. Donec vitae
        enim eu orci cursus rutrum id in turpis.
      </Typography>
    </div>
  ),
}

/**
 * Demonstração dos diferentes pesos de fonte.
 */
export const FontWeights: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <Typography weight="light">Texto com peso leve (300)</Typography>
      <Typography weight="regular">
        Texto com peso regular/normal (400)
      </Typography>
      <Typography weight="medium">Texto com peso médio (500)</Typography>
      <Typography weight="semibold">
        Texto com peso semi-negrito (600)
      </Typography>
      <Typography weight="bold">Texto com peso negrito (700)</Typography>
    </div>
  ),
}

/**
 * Demonstração das opções de estilização do texto.
 */
export const TextStyling: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <Typography uppercase>Este texto está em maiúsculas</Typography>
      <Typography italic>Este texto está em itálico</Typography>
      <Typography underline>Este texto está sublinhado</Typography>
      <Typography uppercase italic underline>
        Este texto combina maiúsculas, itálico e sublinhado
      </Typography>
    </div>
  ),
}

/**
 * Demonstração de texto truncado com reticências quando excede o espaço.
 */
export const TruncatedText: Story = {
  render: () => (
    <div
      style={{ maxWidth: '300px', border: '1px dashed #ccc', padding: '1rem' }}
    >
      <Typography truncate>
        Este é um texto longo que deve ser truncado com reticências quando
        excede o espaço disponível em seu contêiner. Observe como o texto é
        cortado e reticências são adicionadas.
      </Typography>
    </div>
  ),
}

/**
 * Exemplo de uso completo combinando várias propriedades.
 */
export const ComplexExample: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '2rem',
          borderRadius: '8px',
        }}
      >
        <Typography
          variant="h3"
          color="primary"
          align="center"
          weight="bold"
          style={{ marginBottom: '1rem' }}
        >
          Título de Exemplo
        </Typography>
        <Typography
          variant="subtitle1"
          color="secondary"
          style={{ marginBottom: '1rem' }}
        >
          Este é um exemplo de subtítulo usando o componente Typography
        </Typography>
        <Typography variant="body1" align="justify">
          Este é um exemplo de texto de corpo usando o componente Typography com
          alinhamento justificado. O texto está formatado para demonstrar como o
          componente pode ser usado em uma situação real. Observe como
          diferentes propriedades podem ser combinadas para criar uma hierarquia
          visual clara.
        </Typography>
      </div>
    </div>
  ),
}
