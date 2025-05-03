/**
 * Handlers para o Mock Service Worker
 * Este arquivo define os interceptadores de requisições HTTP para os testes
 */

import { rest } from 'msw'

// Helpers para gerar dados
const generateProposal = (id, status = 'pending') => ({
  id,
  proposal_number: `P-2023-${id}`,
  client_name: `Cliente Teste ${id}`,
  company_name: `Empresa Teste ${id}`,
  credit_type: 'personal',
  amount: 50000,
  installments: 36,
  status,
  score: 750,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

const generateNotification = (id, isRead = false) => ({
  id: `${id}`,
  title: `Notificação ${id}`,
  message: `Mensagem da notificação ${id}`,
  type: ['info', 'success', 'warning', 'error'][id % 4],
  isRead,
  createdAt: new Date(Date.now() - id * 60 * 60 * 1000).toISOString(),
  link: id % 2 === 0 ? `/admin/proposals/${id}` : undefined,
})

// Base URL da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// Handlers de requisições
export const handlers = [
  // Auth
  rest.post(`${API_URL}/auth/login/`, (req, res, ctx) => {
    const { email, password } = req.body

    // Simulação de login
    if (email === 'admin@celebracapital.com.br' && password === 'senha123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: 1,
            email: 'admin@celebracapital.com.br',
            name: 'Administrador',
            role: 'admin',
          },
        })
      )
    }

    return res(
      ctx.status(401),
      ctx.json({
        detail: 'Credenciais inválidas',
      })
    )
  }),

  // Propostas
  rest.get(`${API_URL}/proposals/`, (req, res, ctx) => {
    const status = req.url.searchParams.get('status')
    const search = req.url.searchParams.get('search')

    // Gerar lista de propostas
    let proposals = Array.from({ length: 10 }, (_, i) =>
      generateProposal(i + 1, ['pending', 'approved', 'rejected'][i % 3])
    )

    // Filtrar por status se fornecido
    if (status) {
      const statusList = status.split(',')
      proposals = proposals.filter((p) => statusList.includes(p.status))
    }

    // Filtrar por termo de busca se fornecido
    if (search) {
      const searchLower = search.toLowerCase()
      proposals = proposals.filter(
        (p) =>
          p.proposal_number.toLowerCase().includes(searchLower) ||
          p.client_name.toLowerCase().includes(searchLower) ||
          p.company_name.toLowerCase().includes(searchLower)
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        results: proposals,
        count: proposals.length,
        total_pages: 1,
      })
    )
  }),

  // Detalhes da proposta
  rest.get(`${API_URL}/proposals/:id/`, (req, res, ctx) => {
    const { id } = req.params

    return res(ctx.status(200), ctx.json(generateProposal(id)))
  }),

  // Aprovar proposta
  rest.post(`${API_URL}/proposals/:id/approve/`, (req, res, ctx) => {
    const { id } = req.params
    const { comments } = req.body

    return res(
      ctx.status(200),
      ctx.json({
        ...generateProposal(id, 'approved'),
        comments,
      })
    )
  }),

  // Rejeitar proposta
  rest.post(`${API_URL}/proposals/:id/reject/`, (req, res, ctx) => {
    const { id } = req.params
    const { reason, comments } = req.body

    return res(
      ctx.status(200),
      ctx.json({
        ...generateProposal(id, 'rejected'),
        reject_reason: reason,
        comments,
      })
    )
  }),

  // Solicitar documentos
  rest.post(`${API_URL}/proposals/:id/request-documents/`, (req, res, ctx) => {
    const { id } = req.params
    const { document_types, message } = req.body

    return res(
      ctx.status(200),
      ctx.json({
        ...generateProposal(id, 'pending'),
        requested_documents: document_types,
        request_message: message,
      })
    )
  }),

  // Notificações
  rest.get(`${API_URL}/notifications/`, (req, res, ctx) => {
    const notifications = Array.from(
      { length: 5 },
      (_, i) => generateNotification(i + 1, i > 2) // Os primeiros 3 são não lidos
    )

    return res(
      ctx.status(200),
      ctx.json({
        results: notifications,
        count: notifications.length,
        unread_count: 3,
      })
    )
  }),

  // Marcar notificação como lida
  rest.patch(`${API_URL}/notifications/:id/read/`, (req, res, ctx) => {
    const { id } = req.params

    return res(
      ctx.status(200),
      ctx.json({
        ...generateNotification(id, true),
      })
    )
  }),

  // Marcar todas notificações como lidas
  rest.post(`${API_URL}/notifications/mark-all-read/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
      })
    )
  }),

  // Endpoint de perfil de usuário
  rest.get(`${API_URL}/users/me/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'admin@celebracapital.com.br',
        name: 'Administrador',
        role: 'admin',
        permissions: ['manage_users', 'approve_proposals', 'view_reports'],
      })
    )
  }),

  // Fallback para requisições não tratadas
  rest.all(`${API_URL}/*`, (req, res, ctx) => {
    console.warn(`Requisição não tratada: ${req.method} ${req.url.toString()}`)
    return res(
      ctx.status(404),
      ctx.json({
        detail: 'Endpoint não encontrado',
      })
    )
  }),
]
