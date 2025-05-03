import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Typography, Paper, Box, Button, Alert } from '@mui/material'
import ClickSignComponent from '../components/ClickSignComponent'
import * as analyticsService from '../services/analytics'
import proposalService from '../services/proposalService'

interface ProposalData {
  id: number
  proposal_number: string
  credit_type: string
  credit_value: number
  status: string
}

const Signature: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) {
        setError('ID da proposta não fornecido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const proposalData = await proposalService.getProposalDetails(
          parseInt(proposalId)
        )
        setProposal(proposalData)
        setError(null)

        // Rastrear visualização da página
        analyticsService.trackPageView('Assinatura', window.location.pathname)
      } catch (err) {
        console.error('Erro ao carregar proposta:', err)
        setError(
          'Não foi possível carregar os detalhes da proposta. Tente novamente.'
        )
        analyticsService.trackError(
          'Erro ao carregar proposta',
          undefined,
          'SignaturePage'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [proposalId])

  const handleSignatureComplete = () => {
    // Atualizar o status da proposta localmente
    if (proposal) {
      setProposal({
        ...proposal,
        status: 'signed',
      })
    }

    // Rastrear conclusão de assinatura
    analyticsService.trackSignatureComplete()
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    analyticsService.trackError(errorMessage, undefined, 'SignaturePage')
  }

  const handleBackToProposal = () => {
    navigate(`/propostas/${proposalId}`)
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          Carregando informações de assinatura...
        </Typography>
      </Container>
    )
  }

  if (error || !proposal) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 4 }}>
          {error || 'Erro ao carregar proposta'}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Voltar para a página inicial
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assinatura Digital
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Proposta: #{proposal.proposal_number}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tipo de Crédito: {proposal.credit_type}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Valor: R${' '}
            {proposal.credit_value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <ClickSignComponent
            proposalId={proposal.id}
            onSignComplete={handleSignatureComplete}
            onError={handleError}
            trackEvent={(eventName, data) =>
              analyticsService.trackEvent(eventName as any, data)
            }
            trackSignatureComplete={analyticsService.trackSignatureComplete}
            trackError={analyticsService.trackError}
          />
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleBackToProposal}
            sx={{ mr: 2 }}
          >
            Voltar para Proposta
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Ir para Página Inicial
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          A assinatura digital tem validade jurídica garantida por lei. Em caso
          de dúvidas, entre em contato com nosso suporte.
        </Typography>
      </Box>
    </Container>
  )
}

export default Signature
