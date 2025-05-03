import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Paper,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import ErrorIcon from '@mui/icons-material/Error'
import DownloadIcon from '@mui/icons-material/Download'
import proposalService from '../services/proposalService'
import { createCacheConfig } from '../services/api'

interface SignaturePanelProps {
  proposalId: number
}

const SignaturePanel: React.FC<SignaturePanelProps> = ({ proposalId }) => {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>(
    'pending'
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  // Configuração de cache de 30 segundos para verificações de status de assinatura
  const fetchSignatureStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar configuração de cache para evitar chamadas repetidas desnecessárias
      const cacheConfig = createCacheConfig(
        `signature_status_${proposalId}`,
        30,
        true
      )
      const response = await proposalService.getSignatureStatus(
        proposalId,
        cacheConfig
      )

      setStatus(response.status)
      if (response.document_url) {
        setDocumentUrl(response.document_url)
      }
    } catch (err) {
      setError(
        'Erro ao verificar status da assinatura. Tente novamente mais tarde.'
      )
      console.error('Erro ao verificar status de assinatura:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignatureStatus()

    // Verificar a cada 30 segundos se o status ainda é 'pending'
    const intervalId = setInterval(() => {
      if (status === 'pending') {
        fetchSignatureStatus()
      }
    }, 30000)

    return () => clearInterval(intervalId)
  }, [proposalId, status])

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank')
    } else {
      const url = proposalService.getSignedDocumentUrl(proposalId)
      window.open(url, '_blank')
    }
  }

  // Textos para leitores de tela baseados no status
  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Documento assinado com sucesso!'
      case 'pending':
        return 'Assinatura pendente. Aguardando processamento.'
      case 'failed':
        return 'Falha na assinatura do documento. Entre em contato com o suporte.'
      default:
        return 'Status de assinatura desconhecido.'
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, mb: 2 }}
      role="region"
      aria-label="Painel de status da assinatura digital"
    >
      <Typography
        variant="h6"
        gutterBottom
        component="h2"
        id="signature-panel-title"
      >
        Status da Assinatura Digital
      </Typography>

      {/* Área de status com atualização live para leitores de tela */}
      <div aria-live="polite" aria-atomic="true">
        {loading ? (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}
            role="status"
          >
            <CircularProgress size={20} aria-hidden="true" />
            <Typography>Verificando status da assinatura...</Typography>
          </Box>
        ) : (
          <Box sx={{ my: 2 }} role="status">
            {status === 'completed' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="success" aria-hidden="true" />
                <Typography>{getStatusText()}</Typography>
              </Box>
            )}

            {status === 'pending' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PendingIcon color="warning" aria-hidden="true" />
                <Typography>{getStatusText()}</Typography>
              </Box>
            )}

            {status === 'failed' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon color="error" aria-hidden="true" />
                <Typography>{getStatusText()}</Typography>
              </Box>
            )}
          </Box>
        )}
      </div>

      {error && (
        <Alert severity="error" sx={{ my: 2 }} role="alert">
          {error}
        </Alert>
      )}

      {status === 'completed' && (
        <Button
          variant="contained"
          startIcon={<DownloadIcon aria-hidden="true" />}
          onClick={handleDownload}
          sx={{ mt: 2 }}
          aria-label="Baixar documento assinado em formato PDF"
        >
          Baixar Documento Assinado
        </Button>
      )}

      {/* Instruções adicionais para acessibilidade */}
      {status === 'completed' && (
        <Typography
          variant="body2"
          sx={{ mt: 2, color: 'text.secondary' }}
          aria-live="polite"
        >
          O documento assinado está disponível para download em formato PDF. Se
          precisar de um formato alternativo, entre em contato com o suporte.
        </Typography>
      )}
    </Paper>
  )
}

export default SignaturePanel
