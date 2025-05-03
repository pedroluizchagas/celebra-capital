/**
 * Utilitário para gerenciar o ambiente da aplicação
 */

export type Environment = 'development' | 'staging' | 'production'

/**
 * Obtém o ambiente atual da aplicação
 * @returns O ambiente atual: 'development', 'staging' ou 'production'
 */
export function getEnvironment(): Environment {
  const env = import.meta.env.VITE_ENVIRONMENT || 'development'

  if (env === 'production' || env === 'staging' || env === 'development') {
    return env
  }

  return 'development'
}

/**
 * Verifica se o ambiente atual é de desenvolvimento
 * @returns true se o ambiente for 'development'
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development'
}

/**
 * Verifica se o ambiente atual é de produção
 * @returns true se o ambiente for 'production'
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production'
}

/**
 * Verifica se o ambiente atual é de staging
 * @returns true se o ambiente for 'staging'
 */
export function isStaging(): boolean {
  return getEnvironment() === 'staging'
}

/**
 * Executa uma função apenas em um ambiente específico
 * @param env O ambiente em que a função deve ser executada
 * @param callback A função a ser executada
 * @returns O resultado da função se o ambiente atual for o esperado, undefined caso contrário
 */
export function runInEnvironment<T>(
  env: Environment,
  callback: () => T
): T | undefined {
  if (getEnvironment() === env) {
    return callback()
  }
  return undefined
}

/**
 * Executa uma função apenas em ambiente de desenvolvimento
 * @param callback A função a ser executada
 * @returns O resultado da função se o ambiente for de desenvolvimento, undefined caso contrário
 */
export function runInDevelopment<T>(callback: () => T): T | undefined {
  return runInEnvironment('development', callback)
}

/**
 * Executa uma função apenas em ambiente de produção
 * @param callback A função a ser executada
 * @returns O resultado da função se o ambiente for de produção, undefined caso contrário
 */
export function runInProduction<T>(callback: () => T): T | undefined {
  return runInEnvironment('production', callback)
}
