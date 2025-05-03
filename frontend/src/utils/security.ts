/**
 * Utilitários de segurança para o frontend
 * Implementa boas práticas de segurança para proteção contra ataques comuns
 */

/**
 * Sanitiza uma string para prevenir ataques XSS
 * @param unsafeText Texto não sanitizado
 * @returns Texto sanitizado
 */
export function sanitizeText(unsafeText: string): string {
  if (!unsafeText) return ''

  const element = document.createElement('div')
  element.innerText = unsafeText
  return element.innerHTML
}

/**
 * Extrair token CSRF de cookies ou meta tags
 * @returns Token CSRF
 */
export function getCsrfToken(): string | null {
  // Primeiro tenta obter do meta tag (recomendado)
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  if (metaTag && metaTag.getAttribute('content')) {
    return metaTag.getAttribute('content')
  }

  // Se não encontrar, tenta extrair dos cookies
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find(
    (cookie) =>
      cookie.trim().startsWith('csrftoken=') ||
      cookie.trim().startsWith('csrf=') ||
      cookie.trim().startsWith('XSRF-TOKEN=')
  )

  if (csrfCookie) {
    return csrfCookie.split('=')[1]
  }

  console.error('Token CSRF não encontrado. A requisição pode falhar.')
  return null
}

/**
 * Adiciona headers de segurança a requisições fetch
 * @param options Opções atuais do fetch
 * @returns Opções com headers de segurança
 */
export function addSecurityHeaders(options: RequestInit = {}): RequestInit {
  const csrfToken = getCsrfToken()
  const headers = new Headers(options.headers || {})

  // Adicionar CSRF token
  if (csrfToken) {
    headers.append('X-CSRFToken', csrfToken)
    headers.append('X-XSRF-TOKEN', csrfToken)
  }

  // Prevenir MIME sniffing
  headers.append('X-Content-Type-Options', 'nosniff')

  return {
    ...options,
    credentials: 'include', // Inclui cookies nas requisições
    headers,
  }
}

/**
 * Verifica se um CPF é válido
 * @param cpf CPF a ser validado
 * @returns true se o CPF for válido
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false

  // Calcula o primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  // Calcula o segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }

  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  // Verifica se os dígitos verificadores estão corretos
  return (
    parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2
  )
}

/**
 * Verifica se um CNPJ é válido
 * @param cnpj CNPJ a ser validado
 * @returns true se o CNPJ for válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '')

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false

  // Calcula o primeiro dígito verificador
  let sum = 0
  let weight = 5

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  // Calcula o segundo dígito verificador
  sum = 0
  weight = 6

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }

  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  // Verifica se os dígitos verificadores estão corretos
  return (
    parseInt(cnpj.charAt(12)) === digit1 && parseInt(cnpj.charAt(13)) === digit2
  )
}

/**
 * Cliente HTTP seguro que inclui CSRF tokens e outras medidas de segurança
 */
export const secureClient = {
  /**
   * Fetch com headers de segurança
   */
  fetch: (url: string, options: RequestInit = {}) => {
    return fetch(url, addSecurityHeaders(options))
  },

  /**
   * GET com headers de segurança
   */
  get: (url: string, options: RequestInit = {}) => {
    return secureClient.fetch(url, {
      ...options,
      method: 'GET',
    })
  },

  /**
   * POST com headers de segurança e Content-Type JSON
   */
  post: (url: string, data: any, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {})
    headers.append('Content-Type', 'application/json')

    return secureClient.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  },

  /**
   * PUT com headers de segurança e Content-Type JSON
   */
  put: (url: string, data: any, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {})
    headers.append('Content-Type', 'application/json')

    return secureClient.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    })
  },

  /**
   * DELETE com headers de segurança
   */
  delete: (url: string, options: RequestInit = {}) => {
    return secureClient.fetch(url, {
      ...options,
      method: 'DELETE',
    })
  },
}

/**
 * Verifica força da senha (deve ter pelo menos 8 caracteres,
 * incluindo maiúsculas, minúsculas, números e caracteres especiais)
 * @param password Senha a ser verificada
 * @returns Pontuação de 0 a 4, sendo 0 mais fraca e 4 mais forte
 */
export function getBasicPasswordStrength(password: string): number {
  let score = 0

  // Comprimento mínimo
  if (password.length >= 8) score++

  // Letras maiúsculas e minúsculas
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++

  // Números
  if (/\d/.test(password)) score++

  // Caracteres especiais
  if (/[^a-zA-Z0-9]/.test(password)) score++

  return score
}

/**
 * Obter mensagem de força de senha baseada na pontuação
 * @param score Pontuação de 0 a 4
 * @returns Mensagem descritiva da força da senha
 */
export function getPasswordStrengthMessage(score: number): string {
  switch (score) {
    case 0:
      return 'Muito fraca'
    case 1:
      return 'Fraca'
    case 2:
      return 'Média'
    case 3:
      return 'Forte'
    case 4:
      return 'Muito forte'
    default:
      return 'Inválida'
  }
}

// CSP - Content Security Policy
export function setupCSP(): void {
  if (typeof document === 'undefined') return

  // Verificar se já existe uma meta tag CSP
  let cspMetaTag = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]'
  )

  if (!cspMetaTag) {
    cspMetaTag = document.createElement('meta')
    cspMetaTag.setAttribute('http-equiv', 'Content-Security-Policy')

    // Definir política CSP
    const cspContent = [
      // Fontes de scripts permitidas
      "script-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com",
      // Fontes de estilos permitidas
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fontes de fontes permitidas
      "font-src 'self' https://fonts.gstatic.com",
      // Fontes de imagens permitidas
      "img-src 'self' data: https://storage.googleapis.com",
      // Fontes de conexão permitidas (para WebSockets, etc.)
      "connect-src 'self' https://*.celebracapital.com.br",
      // Bloquear objetos incorporados
      "object-src 'none'",
      // Fontes de frames permitidas
      "frame-src 'self' https://clicksign.com",
      // Política de recursos
      "base-uri 'self'",
      // Política de manifesto
      "manifest-src 'self'",
    ].join('; ')

    cspMetaTag.setAttribute('content', cspContent)
    document.head.appendChild(cspMetaTag)
  }
}

// Sanitização de entrada de dados
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Sanitização para uso em HTML (mais seguro que a função acima)
export function sanitizeHTML(input: string): string {
  if (!input) return ''

  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// Verificação de força de senha
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4,
}

export interface PasswordStrengthResult {
  score: PasswordStrength
  feedback: string
  hasSufficientLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSpecialChars: boolean
}

// Implementação avançada da verificação de força de senha
export function checkPasswordStrength(
  password: string
): PasswordStrengthResult {
  const result: PasswordStrengthResult = {
    score: PasswordStrength.VERY_WEAK,
    feedback: 'Senha muito fraca',
    hasSufficientLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumbers: false,
    hasSpecialChars: false,
  }

  if (!password) return result

  // Verificar comprimento
  result.hasSufficientLength = password.length >= 8

  // Verificar caracteres maiúsculos
  result.hasUppercase = /[A-Z]/.test(password)

  // Verificar caracteres minúsculos
  result.hasLowercase = /[a-z]/.test(password)

  // Verificar números
  result.hasNumbers = /\d/.test(password)

  // Verificar caracteres especiais
  result.hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  // Calcular pontuação
  let score = 0
  if (result.hasSufficientLength) score++
  if (result.hasUppercase) score++
  if (result.hasLowercase) score++
  if (result.hasNumbers) score++
  if (result.hasSpecialChars) score++

  // Ajustar pontuação final
  if (password.length >= 12) score++ // Bônus para senhas longas
  if (password.length < 6) score = Math.max(0, score - 2) // Penalidade para senhas curtas

  // Limitar a pontuação ao intervalo 0-4
  result.score = Math.min(
    PasswordStrength.VERY_STRONG,
    Math.max(
      PasswordStrength.VERY_WEAK,
      score > 5 ? PasswordStrength.VERY_STRONG : score - 1
    )
  ) as PasswordStrength

  // Adicionar feedback
  switch (result.score) {
    case PasswordStrength.VERY_WEAK:
      result.feedback =
        'Senha muito fraca. Considere uma senha mais longa com caracteres variados.'
      break
    case PasswordStrength.WEAK:
      result.feedback = 'Senha fraca. Adicione números e caracteres especiais.'
      break
    case PasswordStrength.MEDIUM:
      result.feedback = 'Senha média. Adicione mais variação de caracteres.'
      break
    case PasswordStrength.STRONG:
      result.feedback = 'Senha forte!'
      break
    case PasswordStrength.VERY_STRONG:
      result.feedback = 'Senha muito forte!'
      break
  }

  return result
}

// Proteção contra CSRF
export function addCSRFTokenToRequest(
  headers: Record<string, string>
): Record<string, string> {
  const csrfToken = localStorage.getItem('csrf_token')

  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    }
  }

  return headers
}

// Armazenamento seguro no localStorage
export const secureStorage = {
  // Salvar dados com expiração
  setItem(key: string, value: any, expiresInMinutes?: number): void {
    const item = {
      value,
      expiry: expiresInMinutes
        ? new Date().getTime() + expiresInMinutes * 60 * 1000
        : null,
    }

    localStorage.setItem(key, JSON.stringify(item))
  },

  // Obter dados, verificando expiração
  getItem<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key)

    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)

      // Verificar se o item expirou
      if (item.expiry && new Date().getTime() > item.expiry) {
        localStorage.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      // Se ocorrer um erro na análise, retornar null
      return null
    }
  },

  // Remover item
  removeItem(key: string): void {
    localStorage.removeItem(key)
  },

  // Limpar todos os itens
  clear(): void {
    localStorage.clear()
  },
}

// Proteção contra XSS em valores de entrada/saída
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// HOC (Higher Order Component) para prevenção de cliques em iframes
export function preventClickjacking(): void {
  if (typeof window === 'undefined') return

  // Verificar se estamos em um iframe
  if (window.self !== window.top) {
    // Estamos em um iframe
    const allowedParents = [
      'celebracapital.com.br',
      'app.celebracapital.com.br',
      'localhost',
    ]

    try {
      const parentDomain = new URL(document.referrer).hostname
      const isAllowed = allowedParents.some((domain) =>
        parentDomain.includes(domain)
      )

      if (!isAllowed && window.top) {
        // Redirecionar para a página principal se o iframe não for de domínio confiável
        window.top.location.href = window.self.location.href
      }
    } catch (e) {
      // Se não conseguirmos verificar o domínio pai (por exemplo, por política de mesma origem)
      // redirecionamos por segurança
      if (window.top) {
        window.top.location.href = window.self.location.href
      }
    }
  }
}

// Inicializar medidas de segurança
export function initializeSecurity(): void {
  // Configurar CSP
  setupCSP()

  // Prevenir clickjacking
  preventClickjacking()

  // Adicionar outros cabeçalhos de segurança
  if (typeof document !== 'undefined') {
    // Adicionar meta tag para X-Frame-Options
    let xFrameOptionsMetaTag = document.querySelector(
      'meta[http-equiv="X-Frame-Options"]'
    )
    if (!xFrameOptionsMetaTag) {
      xFrameOptionsMetaTag = document.createElement('meta')
      xFrameOptionsMetaTag.setAttribute('http-equiv', 'X-Frame-Options')
      xFrameOptionsMetaTag.setAttribute('content', 'SAMEORIGIN')
      document.head.appendChild(xFrameOptionsMetaTag)
    }

    // Adicionar meta tag para X-XSS-Protection
    let xssProtectionMetaTag = document.querySelector(
      'meta[http-equiv="X-XSS-Protection"]'
    )
    if (!xssProtectionMetaTag) {
      xssProtectionMetaTag = document.createElement('meta')
      xssProtectionMetaTag.setAttribute('http-equiv', 'X-XSS-Protection')
      xssProtectionMetaTag.setAttribute('content', '1; mode=block')
      document.head.appendChild(xssProtectionMetaTag)
    }

    // Adicionar meta tag para X-Content-Type-Options
    let contentTypeOptionsMetaTag = document.querySelector(
      'meta[http-equiv="X-Content-Type-Options"]'
    )
    if (!contentTypeOptionsMetaTag) {
      contentTypeOptionsMetaTag = document.createElement('meta')
      contentTypeOptionsMetaTag.setAttribute(
        'http-equiv',
        'X-Content-Type-Options'
      )
      contentTypeOptionsMetaTag.setAttribute('content', 'nosniff')
      document.head.appendChild(contentTypeOptionsMetaTag)
    }

    // Adicionar meta tag para Referrer-Policy
    let referrerPolicyMetaTag = document.querySelector('meta[name="referrer"]')
    if (!referrerPolicyMetaTag) {
      referrerPolicyMetaTag = document.createElement('meta')
      referrerPolicyMetaTag.setAttribute('name', 'referrer')
      referrerPolicyMetaTag.setAttribute(
        'content',
        'strict-origin-when-cross-origin'
      )
      document.head.appendChild(referrerPolicyMetaTag)
    }
  }
}

// Exportar função para verificar permissões
export function hasPermission(
  userRole: string,
  requiredPermission: string
): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 100,
    manager: 80,
    analyst: 60,
    agent: 40,
    client: 20,
    guest: 10,
  }

  const permissionRequirements: Record<string, number> = {
    manage_users: 100,
    approve_proposals: 80,
    review_proposals: 60,
    create_proposals: 40,
    view_proposals: 20,
    public_access: 10,
  }

  const userRoleLevel = roleHierarchy[userRole] || 0
  const requiredPermissionLevel =
    permissionRequirements[requiredPermission] || 0

  return userRoleLevel >= requiredPermissionLevel
}
