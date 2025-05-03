import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProposalFilters from '../ProposalFilters'

describe('ProposalFilters Component', () => {
  const mockOnApplyFilters = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renderiza o campo de busca e o botão de expandir filtros', () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    expect(
      screen.getByPlaceholderText(
        'Buscar proposta por número, cliente ou email...'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Mostrar Filtros Avançados')).toBeInTheDocument()
    expect(screen.getByText('Buscar')).toBeInTheDocument()
  })

  test('expande os filtros avançados quando o botão é clicado', () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Inicialmente, os filtros avançados não devem estar visíveis
    expect(screen.queryByText('Status')).not.toBeInTheDocument()

    // Clicar no botão para expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Verificar se os filtros avançados estão visíveis agora
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Tipo de Crédito')).toBeInTheDocument()
    expect(screen.getByText('Valor (R$)')).toBeInTheDocument()
    expect(screen.getByText('Data de Criação')).toBeInTheDocument()
  })

  test('chama onApplyFilters quando o botão de busca é clicado', () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Digitar no campo de busca
    const searchInput = screen.getByPlaceholderText(
      'Buscar proposta por número, cliente ou email...'
    )
    fireEvent.change(searchInput, { target: { value: 'proposta teste' } })

    // Clicar no botão de busca
    fireEvent.click(screen.getByText('Buscar'))

    // Verificar se a função foi chamada com o valor correto
    expect(mockOnApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'proposta teste',
      })
    )
  })

  test('seleciona e aplica filtros de status', async () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Selecionar filtros de status
    fireEvent.click(screen.getByLabelText('Pendente'))
    fireEvent.click(screen.getByLabelText('Aprovada'))

    // Aplicar filtros
    fireEvent.click(screen.getByText('Aplicar Filtros'))

    // Verificar se a função foi chamada com os valores corretos
    expect(mockOnApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['pending', 'approved'],
      })
    )
  })

  test('seleciona e aplica filtros de tipo de crédito', async () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Selecionar filtros de tipo de crédito
    fireEvent.click(screen.getByLabelText('Pessoal'))
    fireEvent.click(screen.getByLabelText('Consignado'))

    // Aplicar filtros
    fireEvent.click(screen.getByText('Aplicar Filtros'))

    // Verificar se a função foi chamada com os valores corretos
    expect(mockOnApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        credit_type: ['personal', 'consignment'],
      })
    )
  })

  test('aplica filtros de valor', async () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Preencher valores mínimo e máximo
    const minInput = screen.getByPlaceholderText('Mínimo')
    const maxInput = screen.getByPlaceholderText('Máximo')

    fireEvent.change(minInput, { target: { value: '1000' } })
    fireEvent.change(maxInput, { target: { value: '5000' } })

    // Aplicar filtros
    fireEvent.click(screen.getByText('Aplicar Filtros'))

    // Verificar se a função foi chamada com os valores corretos
    expect(mockOnApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        min_value: 1000,
        max_value: 5000,
      })
    )
  })

  test('aplica filtros de data', async () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Obter inputs de data por seu atributo de tipo
    const dateInputs = screen
      .getAllByRole('textbox')
      .filter((input) => input.getAttribute('type') === 'date')

    // Preencher datas
    fireEvent.change(dateInputs[0], { target: { value: '2023-01-01' } })
    fireEvent.change(dateInputs[1], { target: { value: '2023-12-31' } })

    // Aplicar filtros
    fireEvent.click(screen.getByText('Aplicar Filtros'))

    // Verificar se a função foi chamada com os valores corretos
    expect(mockOnApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        date_from: '2023-01-01',
        date_to: '2023-12-31',
      })
    )
  })

  test('limpa todos os filtros quando o botão Limpar é clicado', async () => {
    render(<ProposalFilters onApplyFilters={mockOnApplyFilters} />)

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Adicionar alguns filtros
    fireEvent.change(
      screen.getByPlaceholderText(
        'Buscar proposta por número, cliente ou email...'
      ),
      {
        target: { value: 'teste' },
      }
    )

    fireEvent.click(screen.getByLabelText('Pendente'))

    // Clicar no botão de limpar
    fireEvent.click(screen.getByText('Limpar'))

    // Aplicar filtros vazios
    fireEvent.click(screen.getByText('Aplicar Filtros'))

    // Verificar se a função foi chamada com objeto vazio
    expect(mockOnApplyFilters).toHaveBeenCalledWith({})
  })

  test('renderiza corretamente com filtros iniciais', () => {
    const initialFilters = {
      search: 'proposta inicial',
      status: ['pending', 'rejected'],
      credit_type: ['personal'],
    }

    render(
      <ProposalFilters
        onApplyFilters={mockOnApplyFilters}
        initialFilters={initialFilters}
      />
    )

    // Verificar que o campo de busca tem o valor inicial
    expect(
      screen.getByPlaceholderText(
        'Buscar proposta por número, cliente ou email...'
      )
    ).toHaveValue('proposta inicial')

    // Expandir filtros
    fireEvent.click(screen.getByText('Mostrar Filtros Avançados'))

    // Verificar checkboxes que devem estar marcados
    expect(screen.getByLabelText('Pendente')).toBeChecked()
    expect(screen.getByLabelText('Rejeitada')).toBeChecked()
    expect(screen.getByLabelText('Pessoal')).toBeChecked()

    // Verificar checkboxes que não devem estar marcados
    expect(screen.getByLabelText('Aprovada')).not.toBeChecked()
  })
})
