import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material'
import SignaturePanel from '../components/SignaturePanel'
import SignDocumentButton from '../components/SignDocumentButton'
import proposalService from '../services/proposalService'

interface ProposalData {
  id: number
  proposal_number: string
  credit_type: string
  credit_value: number
  status: string
}

const SignatureDemo: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusPanel, setShowStatusPanel] = useState(false)

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
      } catch (err) {
        console.error('Erro ao carregar proposta:', err)
        setError(
          'Não foi possível carregar os detalhes da proposta. Tente novamente.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [proposalId])

  const handleSignatureInitiated = () => {
    setShowStatusPanel(true)
  }

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          Carregando detalhes da proposta...
        </Typography>
      </Container>
    )
  }

  if (error || !proposal) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center" sx={{ my: 4 }}>
          {error || 'Erro ao carregar proposta'}
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Assinatura Digital
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Assine seu contrato digitalmente para finalizar o processo de
        empréstimo.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detalhes da Proposta
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Número da Proposta
            </Typography>
            <Typography variant="body1">{proposal.proposal_number}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Tipo de Crédito
            </Typography>
            <Typography variant="body1">{proposal.credit_type}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Valor do Empréstimo
            </Typography>
            <Typography variant="body1">
              R${' '}
              {proposal.credit_value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">{proposal.status}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 4 }}>
        {showStatusPanel ? (
          <SignaturePanel proposalId={proposal.id} />
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Iniciar Processo de Assinatura
            </Typography>

            <Typography variant="body2" paragraph>
              Ao clicar no botão abaixo, você iniciará o processo de assinatura
              digital do seu contrato. Você receberá um link para assinar o
              documento usando a plataforma D4Sign.
            </Typography>

            <SignDocumentButton
              proposalId={proposal.id}
              onSignatureInitiated={handleSignatureInitiated}
            />
          </Paper>
        )}
      </Box>

      {showStatusPanel && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Você receberá um email com as instruções para assinar o documento.
            Verifique também sua caixa de spam.
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default SignatureDemo
