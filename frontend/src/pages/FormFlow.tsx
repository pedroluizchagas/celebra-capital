import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import proposalService from '../services/proposalService'
// Importar o componente Button quando disponível
// import Button from '../components/Button';

interface Question {
  id: string
  text: string
  options?: { value: string; label: string }[]
  type: 'text' | 'select' | 'radio' | 'number'
  validation?: (value: string) => boolean
  errorMessage?: string
}

const questions: Question[] = [
  {
    id: 'name',
    text: 'Qual é o seu nome completo?',
    type: 'text',
    validation: (value) => value.trim().length > 5,
    errorMessage: 'Por favor, digite seu nome completo',
  },
  {
    id: 'cpf',
    text: 'Qual é o seu CPF?',
    type: 'text',
    validation: (value) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value),
    errorMessage: 'CPF inválido. Use o formato: 123.456.789-00',
  },
  {
    id: 'employeeType',
    text: 'Qual é o seu tipo de vínculo?',
    type: 'radio',
    options: [
      { value: 'public_server', label: 'Servidor Público' },
      { value: 'retiree', label: 'Aposentado/Pensionista' },
      { value: 'police_military', label: 'Policial/Bombeiro/Militar' },
    ],
  },
  {
    id: 'income',
    text: 'Qual é a sua renda mensal?',
    type: 'number',
    validation: (value) => parseFloat(value) > 0,
    errorMessage: 'Por favor, informe um valor válido',
  },
]

const FormFlow: React.FC = () => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = async (value: string) => {
    // Validar resposta se houver validação
    if (currentQuestion.validation && !currentQuestion.validation(value)) {
      setError(currentQuestion.errorMessage || 'Resposta inválida')
      return
    }

    // Salvar resposta
    setError(null)
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    }
    setAnswers(updatedAnswers)

    // Avançar para próxima pergunta ou finalizar
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Enviar dados para o backend antes de navegar para a próxima etapa
      setIsLoading(true)
      try {
        // Preparar dados para simulação
        const simulationData = {
          monthly_income: parseFloat(updatedAnswers.income),
          credit_type: 'personal', // Tipo padrão para simulação inicial
          user_type: updatedAnswers.employeeType,
          installments: 60, // Valor padrão de parcelas
        }

        // Realizar simulação
        const simulationResult = await proposalService.simulate(simulationData)

        // Criar proposta
        const proposalData = {
          credit_type: 'personal',
          amount_requested: simulationResult.suggested_amount || 5000, // Valor sugerido ou padrão
          installments: 60,
          user_answers: updatedAnswers,
        }

        const proposal = await proposalService.create(proposalData)

        // Navegação para a próxima etapa (upload de documentos)
        navigate('/upload', {
          state: {
            answers: updatedAnswers,
            proposalId: proposal.id,
            simulationResult,
          },
        })
      } catch (error) {
        console.error('Erro ao processar formulário:', error)
        setError(
          'Ocorreu um erro ao processar seus dados. Por favor, tente novamente.'
        )
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = answers[currentQuestion.id] || ''
    handleAnswer(value)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
    setError(null)
  }

  return (
    <div className="card p-8 max-w-md mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </span>
          <span className="text-celebra-blue">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-celebra-blue h-2 rounded-full transition-all duration-500"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

      <form onSubmit={handleSubmit}>
        {currentQuestion.type === 'text' && (
          <input
            type="text"
            className="input-field"
            value={answers[currentQuestion.id] || ''}
            onChange={handleInputChange}
            placeholder="Digite sua resposta"
          />
        )}

        {currentQuestion.type === 'number' && (
          <input
            type="number"
            className="input-field"
            value={answers[currentQuestion.id] || ''}
            onChange={handleInputChange}
            placeholder="0,00"
            step="0.01"
          />
        )}

        {currentQuestion.type === 'select' && (
          <select
            className="input-field"
            value={answers[currentQuestion.id] || ''}
            onChange={handleInputChange}
          >
            <option value="">Selecione uma opção</option>
            {currentQuestion.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {currentQuestion.type === 'radio' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={() => {
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: option.value,
                    })
                    setError(null)
                  }}
                  className="h-5 w-5 text-celebra-blue"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0 || isLoading}
            className={`px-4 py-2 rounded ${
              currentQuestionIndex === 0 || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Anterior
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading
              ? 'Processando...'
              : currentQuestionIndex < questions.length - 1
              ? 'Próxima'
              : 'Finalizar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormFlow
