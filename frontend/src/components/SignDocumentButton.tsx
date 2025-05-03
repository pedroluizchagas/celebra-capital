import React, { useState } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import proposalService from '../services/proposalService'

interface SignDocumentButtonProps {
  proposalId: number
  onSignatureInitiated?: () => void
}

const SignDocumentButton: React.FC<SignDocumentButtonProps> = ({
  proposalId,
  onSignatureInitiated,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignDocument = async () => {
    try {
      setLoading(true)
      setError(null)

      // Envia a solicitação de assinatura
      await proposalService.submitSignature(proposalId)

      setSuccess(true)
      if (onSignatureInitiated) {
        onSignatureInitiated()
      }
    } catch (err) {
      console.error('Erro ao iniciar assinatura:', err)
      setError(
        'Não foi possível iniciar o processo de assinatura. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(false)
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={
          loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <DriveFileRenameOutlineIcon />
          )
        }
        onClick={handleSignDocument}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Processando...' : 'Assinar Documento'}
      </Button>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Processo de assinatura iniciado com sucesso!
        </Alert>
      </Snackbar>
    </>
  )
}

export default SignDocumentButton
