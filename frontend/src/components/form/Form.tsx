import React, { FormEvent, ReactNode } from 'react'

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  className?: string
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
}) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      noValidate
      aria-label="Formulário"
    >
      {children}
    </form>
  )
}
