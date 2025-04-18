import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import proposalService from '../services/proposalService'

interface SignatureProps {}

const Signature: React.FC<SignatureProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Receber dados das etapas anteriores
  const formAnswers = location.state?.answers || {}
  const documents = location.state?.documents || []
  const proposalId = location.state?.proposalId || null

  // Configurar o canvas quando o componente for montado
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Definir a largura e altura do canvas para corresponder ao tamanho do elemento
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Configurar o estilo do traço
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0111a2' // cor da Celebra
  }, [])

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)

    // Obter as coordenadas do mouse ou toque
    let clientX, clientY

    if ('touches' in e) {
      // É um evento de toque
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // É um evento de mouse
      clientX = e.clientX
      clientY = e.clientY
    }

    // Obter a posição relativa ao canvas
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Obter as coordenadas do mouse ou toque
    let clientX, clientY

    if ('touches' in e) {
      // É um evento de toque
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY

      // Evitar rolagem da tela enquanto desenha
      e.preventDefault()
    } else {
      // É um evento de mouse
      clientX = e.clientX
      clientY = e.clientY
    }

    // Obter a posição relativa ao canvas
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const getSignatureImage = (): string => {
    const canvas = canvasRef.current
    if (!canvas) return ''

    return canvas.toDataURL('image/png')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasSignature) {
      alert('Por favor, assine o documento antes de continuar.')
      return
    }

    if (!agreedToTerms) {
      alert('Por favor, aceite os termos e condições para continuar.')
      return
    }

    setIsLoading(true)

    try {
      // Obter a imagem da assinatura
      const signatureImage = getSignatureImage()

      if (proposalId) {
        // Enviar assinatura para o backend
        await proposalService.submitSignature(proposalId, signatureImage)
      }

      navigate('/success', {
        state: {
          answers: formAnswers,
          documents,
          proposalId,
          signed: true,
        },
      })
    } catch (error) {
      console.error('Erro ao enviar assinatura:', error)
      alert(
        'Ocorreu um erro ao enviar sua assinatura. Por favor, tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">Assinatura Digital</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Por favor, assine abaixo para confirmar sua solicitação de crédito.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="border-2 border-gray-300 rounded-lg p-1 mb-2">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full h-40 bg-white dark:bg-gray-800 touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearSignature}
              className="text-sm text-celebra-blue dark:text-celebra-blue"
            >
              Limpar assinatura
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
            <h3 className="font-semibold mb-2">Termos e Condições</h3>
            <p className="mb-2">
              Ao assinar este documento, você concorda com os seguintes termos:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>
                Autorizo a Celebra Capital a verificar meus dados financeiros.
              </li>
              <li>
                Confirmo que todas as informações fornecidas são verdadeiras.
              </li>
              <li>
                Entendo que a assinatura digital tem o mesmo valor legal que a
                assinatura física.
              </li>
              <li>
                Aceito receber comunicações sobre a minha solicitação de
                crédito.
              </li>
            </ul>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="termsCheckbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-celebra-blue focus:ring-celebra-blue rounded"
              />
              <label
                htmlFor="termsCheckbox"
                className="ml-2 text-gray-700 dark:text-gray-300"
              >
                Li e concordo com os termos e condições
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={isLoading || !hasSignature || !agreedToTerms}
            className={`btn-primary ${
              !hasSignature || !agreedToTerms
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isLoading ? 'Enviando...' : 'Finalizar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Signature
