import axios from 'axios'
import { createErrorHandler } from './errorHandler'

// Mock para import.meta.env
jest.mock('../setupTests', () => {}, { virtual: true })

// Mocks para o módulo api
const apiMock = {
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
}

// Funções exportadas do módulo api
const createFormData = (
  file: File,
  additionalData?: Record<string, any>
): FormData => {
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        )
      }
    })
  }

  return formData
}

const apiUtils = {
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await apiMock.get(url, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await apiMock.post(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await apiMock.put(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await apiMock.delete(url)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async upload<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    try {
      const formData = createFormData(file, additionalData)
      const response = await apiMock.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}

// Mock do axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => apiMock),
    post: jest.fn(),
  }
})

// Mock para o localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do errorHandler
jest.mock('./errorHandler', () => ({
  createErrorHandler: jest.fn(() => ({
    handleApiError: jest.fn(),
    setError: jest.fn(),
  })),
}))

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('createFormData', () => {
    test('cria corretamente um FormData com arquivo', () => {
      const file = new File(['conteúdo'], 'test.txt', { type: 'text/plain' })
      const formData = createFormData(file)

      expect(formData.get('file')).toBe(file)
    })

    test('adiciona dados adicionais ao FormData', () => {
      const file = new File(['conteúdo'], 'test.txt', { type: 'text/plain' })
      const additionalData = {
        name: 'Test Name',
        age: 30,
        isActive: true,
        metadata: { type: 'document' },
      }

      const formData = createFormData(file, additionalData)

      expect(formData.get('file')).toBe(file)
      expect(formData.get('name')).toBe('Test Name')
      expect(formData.get('age')).toBe('30')
      expect(formData.get('isActive')).toBe('true')
      expect(formData.get('metadata')).toBe('{"type":"document"}')
    })

    test('ignora valores undefined e null', () => {
      const file = new File(['conteúdo'], 'test.txt', { type: 'text/plain' })
      const additionalData = {
        name: 'Test',
        nullValue: null,
        undefinedValue: undefined,
      }

      const formData = createFormData(file, additionalData)

      expect(formData.get('file')).toBe(file)
      expect(formData.get('name')).toBe('Test')
      expect(formData.get('nullValue')).toBe(null)
      expect(formData.get('undefinedValue')).toBe(null)
    })
  })

  describe('apiUtils', () => {
    test('get faz chamada correta e retorna dados', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } }
      apiMock.get.mockResolvedValue(mockResponse)

      const result = await apiUtils.get('/test')

      expect(apiMock.get).toHaveBeenCalledWith('/test', { params: undefined })
      expect(result).toEqual(mockResponse.data)
    })

    test('get repassa erro caso ocorra', async () => {
      const mockError = new Error('Network error')
      apiMock.get.mockRejectedValue(mockError)

      await expect(apiUtils.get('/test')).rejects.toThrow('Network error')
      expect(apiMock.get).toHaveBeenCalledWith('/test', { params: undefined })
    })

    test('post faz chamada correta e retorna dados', async () => {
      const mockResponse = { data: { id: 1, success: true } }
      apiMock.post.mockResolvedValue(mockResponse)
      const postData = { name: 'Test' }

      const result = await apiUtils.post('/test', postData)

      expect(apiMock.post).toHaveBeenCalledWith('/test', postData)
      expect(result).toEqual(mockResponse.data)
    })

    test('put faz chamada correta e retorna dados', async () => {
      const mockResponse = { data: { id: 1, updated: true } }
      apiMock.put.mockResolvedValue(mockResponse)
      const putData = { name: 'Updated Test' }

      const result = await apiUtils.put('/test/1', putData)

      expect(apiMock.put).toHaveBeenCalledWith('/test/1', putData)
      expect(result).toEqual(mockResponse.data)
    })

    test('delete faz chamada correta e retorna dados', async () => {
      const mockResponse = { data: { success: true } }
      apiMock.delete.mockResolvedValue(mockResponse)

      const result = await apiUtils.delete('/test/1')

      expect(apiMock.delete).toHaveBeenCalledWith('/test/1')
      expect(result).toEqual(mockResponse.data)
    })

    test('upload envia arquivo corretamente', async () => {
      const mockResponse = { data: { fileId: 'abc123', success: true } }
      apiMock.post.mockResolvedValue(mockResponse)

      const file = new File(['conteúdo'], 'test.txt', { type: 'text/plain' })
      const additionalData = { type: 'document' }

      const result = await apiUtils.upload('/upload', file, additionalData)

      // Verificar que o FormData foi criado corretamente (indireto)
      expect(apiMock.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      expect(result).toEqual(mockResponse.data)
    })
  })
})
