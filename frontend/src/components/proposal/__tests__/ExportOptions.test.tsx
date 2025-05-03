import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportOptions from '../ExportOptions'
import proposalService from '../../../services/proposalService'

// Mock do serviço de propostas
jest.mock('../../../services/proposalService', () => ({
  exportProposals: jest.fn().mockResolvedValue(new Blob()),
}))

// Mock do objeto URL para testar o download
const createObjectURL = jest.fn().mockReturnValue('blob:mockurl')
const revokeObjectURL = jest.fn()
URL.createObjectURL = createObjectURL
URL.revokeObjectURL = revokeObjectURL

describe('ExportOptions Component', () => {
  const mockFilters = { status: ['pending'], date_from: '2023-01-01' }
  const originalCreateElement = document.createElement
  let appendChildMock: jest.Mock
  let removeChildMock: jest.Mock
  let clickMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock para o link de download
    clickMock = jest.fn()
    appendChildMock = jest.fn()
    removeChildMock = jest.fn()

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: jest.fn(),
          click: clickMock,
          href: '',
        }
      }
      return originalCreateElement.call(document, tag)
    })

    document.body.appendChild = appendChildMock
    document.body.removeChild = removeChildMock
  })

  afterEach(() => {
    document.createElement = originalCreateElement
  })

  test('renderiza os botões de exportação', () => {
    render(<ExportOptions currentFilters={mockFilters} />)

    expect(screen.getByText('Exportar como:')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('Excel')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  test('exporta em formato CSV quando o botão CSV é clicado', async () => {
    render(<ExportOptions currentFilters={mockFilters} />)

    fireEvent.click(screen.getByText('CSV'))

    await waitFor(() => {
      expect(proposalService.exportProposals).toHaveBeenCalledWith(mockFilters)
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(clickMock).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  test('exporta em formato Excel quando o botão Excel é clicado', async () => {
    render(<ExportOptions currentFilters={mockFilters} />)

    fireEvent.click(screen.getByText('Excel'))

    await waitFor(() => {
      expect(proposalService.exportProposals).toHaveBeenCalledWith(mockFilters)
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(clickMock).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  test('exporta em formato PDF quando o botão PDF é clicado', async () => {
    render(<ExportOptions currentFilters={mockFilters} />)

    fireEvent.click(screen.getByText('PDF'))

    await waitFor(() => {
      expect(proposalService.exportProposals).toHaveBeenCalledWith(mockFilters)
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(clickMock).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  test('desabilita os botões durante a exportação', async () => {
    // Mock para simular uma exportação que leva tempo
    ;(proposalService.exportProposals as jest.Mock).mockImplementationOnce(
      () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve(new Blob()), 100)
        )
      }
    )

    render(<ExportOptions currentFilters={mockFilters} />)

    // Clicar no botão de exportação
    fireEvent.click(screen.getByText('CSV'))

    // Verificar se todos os botões estão desabilitados durante a exportação
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    // Após a conclusão, os botões devem estar habilitados novamente
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  test('exibe o spinner de carregamento apenas no botão clicado', async () => {
    // Mock para simular uma exportação que leva tempo
    ;(proposalService.exportProposals as jest.Mock).mockImplementationOnce(
      () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve(new Blob()), 100)
        )
      }
    )

    render(<ExportOptions currentFilters={mockFilters} />)

    // Clicar no botão CSV
    fireEvent.click(screen.getByText('CSV'))

    // Verificar se o spinner aparece apenas no botão CSV
    await waitFor(() => {
      const loadingSpinner = screen.getByTestId('loading-spinner')
      expect(loadingSpinner).toBeInTheDocument()

      // O texto CSV não deve estar visível durante o carregamento
      expect(screen.queryByText('CSV')).not.toBeInTheDocument()

      // Os outros botões não devem ter spinner
      expect(screen.getByText('Excel')).toBeInTheDocument()
      expect(screen.getByText('PDF')).toBeInTheDocument()
    })
  })

  test('trata erros de exportação graciosamente', async () => {
    // Mock do console.error para evitar poluir os logs de teste
    const originalConsoleError = console.error
    console.error = jest.fn()

    // Mock de alerta para verificar a mensagem de erro
    const originalAlert = window.alert
    window.alert = jest
      .fn()
      (
        // Mock de falha na exportação
        proposalService.exportProposals as jest.Mock
      )
      .mockRejectedValueOnce(new Error('Erro de exportação'))

    render(<ExportOptions currentFilters={mockFilters} />)

    // Clicar no botão de exportação
    fireEvent.click(screen.getByText('CSV'))

    // Verificar se o erro é tratado e o alerta é exibido
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith(
        'Não foi possível exportar os dados. Tente novamente mais tarde.'
      )

      // Os botões devem estar habilitados novamente após o erro
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled()
      })
    })

    // Restaurar funções originais
    console.error = originalConsoleError
    window.alert = originalAlert
  })
})
