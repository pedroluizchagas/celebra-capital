import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import proposalService from '../../services/proposalService'
import Button from '../../components/Button'
import ErrorDisplay from '../../components/ErrorDisplay'

// Definir o esquema de validação
const commentSchema = z.object({
  text: z.string().min(1, 'O comentário não pode estar vazio'),
  isInternal: z.boolean().default(false),
})

// Tipagem para os dados do formulário
type CommentFormData = z.infer<typeof commentSchema>

// Tipagem para os comentários
export interface Comment {
  id: string | number
  author: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
  }
  text: string
  is_internal: boolean
  created_at: string
  updated_at?: string
}

interface ProposalFeedbackProps {
  proposalId: number
  isAdmin: boolean
  onCommentAdded?: () => void
}

const ProposalFeedback: React.FC<ProposalFeedbackProps> = ({
  proposalId,
  isAdmin,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Configurar o formulário
  const { register, handleSubmit, reset, formState } = useForm<CommentFormData>(
    {
      resolver: zodResolver(commentSchema),
      defaultValues: {
        text: '',
        isInternal: false,
      },
    }
  )

  // Carregar comentários
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await proposalService.getProposalComments(proposalId)
        setComments(response)
      } catch (err) {
        console.error('Erro ao carregar comentários:', err)
        setError('Não foi possível carregar os comentários da proposta.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [proposalId])

  // Adicionar um novo comentário
  const onSubmit = async (data: CommentFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const newComment = await proposalService.addProposalComment(
        proposalId,
        data.text,
        data.isInternal
      )

      // Adicionar o novo comentário à lista
      setComments((prevComments) => [newComment, ...prevComments])

      // Limpar o formulário
      reset()

      // Notificar o componente pai
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err)
      setError('Não foi possível adicionar o comentário. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAuthorName = (author: Comment['author']) => {
    if (author.first_name || author.last_name) {
      return `${author.first_name} ${author.last_name}`.trim()
    }
    return author.username
  }

  return (
    <div className="proposal-feedback">
      <h3 className="text-xl font-semibold mb-4">Comentários</h3>

      {/* Formulário para adicionar comentário */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
      >
        <div className="mb-3">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Adicionar comentário
          </label>
          <textarea
            id="comment"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            {...register('text')}
          ></textarea>
          {formState.errors.text && (
            <p className="mt-1 text-sm text-red-600">
              {formState.errors.text.message}
            </p>
          )}
        </div>

        {/* Opção de comentário interno (apenas para admins) */}
        {isAdmin && (
          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('isInternal')}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Comentário interno (visível apenas para administradores)
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            className="px-4 py-2"
          >
            {submitting ? 'Enviando...' : 'Adicionar comentário'}
          </Button>
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/20 dark:border-red-700">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </form>

      {/* Lista de comentários */}
      <div className="comments-list space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Carregando comentários...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nenhum comentário disponível.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg ${
                comment.is_internal
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getAuthorName(comment.author)}
                  </span>
                  {comment.is_internal && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Interno
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProposalFeedback
