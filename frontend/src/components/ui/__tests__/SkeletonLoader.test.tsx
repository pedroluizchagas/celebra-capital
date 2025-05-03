import React from 'react'
import { render, screen } from '@testing-library/react'
import SkeletonLoader from '../SkeletonLoader'

describe('SkeletonLoader Component', () => {
  test('renderiza o tipo de skeleton "text" com configuração padrão', () => {
    render(<SkeletonLoader type="text" />)

    // Deve ter a classe base de animação
    const skeletonElement = screen.getByRole('generic')
    expect(skeletonElement).toHaveClass('animate-pulse')
    expect(skeletonElement).toHaveClass('bg-gray-200')

    // Com rows=1 por padrão, deve ter apenas um elemento
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBe(1)
  })

  test('renderiza múltiplas linhas quando a prop rows é maior que 1', () => {
    render(<SkeletonLoader type="text" rows={3} />)

    // Deve renderizar 3 elementos de skeleton
    const skeletonElements = document.querySelectorAll('.h-4')
    expect(skeletonElements.length).toBe(3)
  })

  test('aplica as classes corretas para o tipo "avatar"', () => {
    render(<SkeletonLoader type="avatar" />)

    const avatar = screen.getByRole('generic')
    expect(avatar).toHaveStyle({ borderRadius: '9999px' })
    expect(avatar).toHaveStyle({ width: '40px' })
    expect(avatar).toHaveStyle({ height: '40px' })
  })

  test('aplica corretamente as dimensões personalizadas', () => {
    render(<SkeletonLoader type="text" width="200px" height="30px" />)

    const element = screen.getByRole('generic')
    expect(element).toHaveStyle({ width: '200px' })
    expect(element).toHaveStyle({ height: '30px' })
  })

  test('aplica a classe circle quando a prop circle é true', () => {
    render(<SkeletonLoader type="text" circle={true} />)

    const element = screen.getByRole('generic')
    expect(element).toHaveStyle({ borderRadius: '9999px' })
  })

  test('renderiza tipo "card" com a estrutura correta', () => {
    render(<SkeletonLoader type="card" />)

    // Deve ter uma área de header e body
    const cardElements = document.querySelectorAll('.bg-gray-300')
    expect(cardElements.length).toBeGreaterThan(0)
  })

  test('renderiza tipo "table-row" com a quantidade correta de colunas', () => {
    render(<SkeletonLoader type="table-row" rows={2} />)

    // Cada linha deve ter 4 colunas
    const rowElements = document.querySelectorAll('.flex.space-x-4')
    expect(rowElements.length).toBe(2)

    // Deve ter 8 células no total (2 linhas * 4 colunas)
    const cellElements = document.querySelectorAll('.h-4')
    expect(cellElements.length).toBe(8)
  })

  test('renderiza tipo "button" com dimensões corretas', () => {
    render(<SkeletonLoader type="button" />)

    const buttonElement = screen.getByRole('generic')
    expect(buttonElement).toHaveStyle({ width: '100px' })
    expect(buttonElement).toHaveStyle({ height: '38px' })
  })

  test('renderiza tipo "image" com dimensões corretas', () => {
    render(<SkeletonLoader type="image" />)

    const imageElement = screen.getByRole('generic')
    expect(imageElement).toHaveStyle({ width: '100%' })
    expect(imageElement).toHaveStyle({ height: '200px' })
  })

  test('aplica classes personalizadas através da prop className', () => {
    render(<SkeletonLoader type="text" className="my-custom-class" />)

    const element = screen.getByRole('generic')
    expect(element).toHaveClass('my-custom-class')
  })
})
