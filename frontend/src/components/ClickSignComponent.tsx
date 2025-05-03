import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material'
import proposalService from '../services/proposalService'

// Estender a interface SignatureStatus do serviço para incluir signature_url
interface ExtendedSignatureStatus {
  status: 'pending' | 'completed' | 'failed'
  message?: string
  document_url?: string
  signature_url?: string
}

interface ClickSignComponentProps {
  proposalId: number
  onSignComplete?: () => void
  onError?: (error: string) => void
  // Funções de analytics opcionais
  trackEvent?: (eventName: string, data?: Record<string, any>) => void
  trackSignatureComplete?: () => void
  trackError?: (message: string, code?: string, component?: string) => void
}

/**
 * Componente para integração com a plataforma Clicksign
 * Permite a assinatura de documentos utilizando o Clicksign
 */
const ClickSignComponent: React.FC<ClickSignComponentProps> = ({
  proposalId,
  onSignComplete,
  onError,
  trackEvent,
  trackSignatureComplete,
  trackError,
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'not_started' | 'pending' | 'completed' | 'failed'
  >('not_started')

  useEffect(() => {
    const checkSignatureStatus = async () => {
      try {
        setLoading(true)
        const response = (await proposalService.getSignatureStatus(
          proposalId
        )) as ExtendedSignatureStatus
        setStatus(response.status)

        if (response.signature_url) {
          setSignatureUrl(response.signature_url)
        }

        if (response.status === 'completed' && onSignComplete) {
          onSignComplete()
          if (trackSignatureComplete) {
            trackSignatureComplete()
          }
        }

        setError(null)
      } catch (err) {
        console.error('Erro ao verificar status da assinatura:', err)
        if (err instanceof Error) {
          setError(err.message)
          if (onError) onError(err.message)
        } else {
          setError('Erro ao verificar status da assinatura')
          if (onError) onError('Erro ao verificar status da assinatura')
        }
        if (trackError) {
          trackError(
            'Erro ao verificar status da assinatura',
            undefined,
            'ClickSignComponent'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    checkSignatureStatus()

    // Verificar periodicamente o status da assinatura se estiver pendente
    const intervalId = setInterval(() => {
      if (status === 'pending') {
        checkSignatureStatus()
      }
    }, 20000) // A cada 20 segundos

    return () => clearInterval(intervalId)
  }, [
    proposalId,
    status,
    onSignComplete,
    onError,
    trackSignatureComplete,
    trackError,
  ])

  const handleRequestSignature = async () => {
    try {
      setLoading(true)

      // Solicitar assinatura
      await proposalService.submitSignature(proposalId)

      // Verificar status após solicitação
      const response = (await proposalService.getSignatureStatus(
        proposalId
      )) as ExtendedSignatureStatus
      setStatus(response.status)

      if (response.signature_url) {
        setSignatureUrl(response.signature_url)
      }

      setError(null)
      if (trackEvent) {
        trackEvent('SIGNATURE_REQUESTED', { proposal_id: proposalId })
      }
    } catch (err) {
      console.error('Erro ao solicitar assinatura:', err)
      if (err instanceof Error) {
        setError(err.message)
        if (onError) onError(err.message)
      } else {
        setError('Erro ao solicitar assinatura')
        if (onError) onError('Erro ao solicitar assinatura')
      }
      if (trackError) {
        trackError(
          'Erro ao solicitar assinatura',
          undefined,
          'ClickSignComponent'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const openSignaturePage = () => {
    if (signatureUrl) {
      // Abrir URL de assinatura em nova aba
      window.open(signatureUrl, '_blank')
      if (trackEvent) {
        trackEvent('SIGNATURE_PAGE_OPENED', { proposal_id: proposalId })
      }
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={40} />
        <Typography variant="body1" ml={2}>
          Carregando informações de assinatura...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    )
  }

  if (status === 'completed') {
    return (
      <Box>
        <Alert severity="success" sx={{ my: 2 }}>
          Documento assinado com sucesso!
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            window.open(
              proposalService.getSignedDocumentUrl(proposalId),
              '_blank'
            )
          }
          sx={{ mt: 2 }}
        >
          Visualizar Documento Assinado
        </Button>
      </Box>
    )
  }

  if (status === 'pending' && signatureUrl) {
    return (
      <Box>
        <Alert severity="info" sx={{ my: 2 }}>
          Seu documento está pronto para assinatura!
        </Alert>
        <Typography variant="body1" sx={{ my: 2 }}>
          Clique no botão abaixo para acessar a plataforma de assinatura. Você
          será redirecionado para o serviço seguro Clicksign.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={openSignaturePage}
          sx={{ mt: 2 }}
        >
          Assinar Documento Agora
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assinatura Digital
      </Typography>
      <Typography variant="body1" sx={{ my: 2 }}>
        Clique no botão abaixo para iniciar o processo de assinatura digital do
        seu contrato.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRequestSignature}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        Preparar Documento para Assinatura
      </Button>
    </Box>
  )
}

export default ClickSignComponent
