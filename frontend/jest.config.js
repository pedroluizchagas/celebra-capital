module.exports = {
  // Diretórios onde o Jest procura por testes
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    '<rootDir>/tests/integration/**/*.test.js',
  ],

  // Configuração de cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/serviceWorker.ts',
  ],

  // Diretório de saída dos relatórios de cobertura
  coverageDirectory: 'coverage',

  // Transformações de arquivos
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Módulos a serem ignorados na transformação
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Extensões de módulos
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Configurações de ambiente para diferentes tipos de testes
  projects: [
    {
      // Configuração para testes unitários
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.+(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)+(spec|test).+(ts|tsx|js)',
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    },
    {
      // Configuração para testes de integração
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.js'],
      testTimeout: 15000,
    },
  ],

  // Configurações para todos os projetos
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Relatório de teste
  verbose: true,

  // Ambiente de teste
  testEnvironment: 'jsdom',
}
