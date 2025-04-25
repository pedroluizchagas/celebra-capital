import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Permitir testes em arquivos .ts, .tsx
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  // Mock de arquivos CSS e de imagem
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Configuração para importações absolutas
  moduleDirectories: ['node_modules', 'src'],
  // Pasta de testes e padrões de arquivos
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],
  // Configurações de cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/Button.tsx',
    'src/components/ErrorDisplay.tsx',
    'src/components/Form.tsx',
    'src/contexts/ErrorContext.tsx',
    'src/contexts/NotificationContext.tsx',
    'src/contexts/AuthContext.tsx',
    'src/services/errorHandler.ts',
    'src/services/api.ts',
    'src/services/notificationService.ts',
  ],
  // Configurar limites de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Configurar Jest DOM
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}

export default config
