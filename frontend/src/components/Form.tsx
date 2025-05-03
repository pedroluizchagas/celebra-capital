import React from 'react'
import {
  useForm,
  FormProvider,
  UseFormReturn,
  FieldValues,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useError } from '../contexts/ErrorContext'
import ErrorDisplay from './ErrorDisplay'

interface FormProps<T extends FieldValues> {
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode)
  onSubmit: (data: T) => void
  formId: string
  schema?: z.ZodSchema<T>
  defaultValues?: Partial<T>
  className?: string
  'data-testid'?: string
}

export const Form = <T extends FieldValues>({
  children,
  onSubmit,
  formId,
  schema,
  defaultValues,
  className,
  'data-testid': dataTestId,
  ...rest
}: FormProps<T>) => {
  const { clearFormErrors } = useError()

  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onTouched',
  })

  const handleSubmit = async (data: T) => {
    // Limpar erros antes de submeter
    clearFormErrors(formId)

    try {
      await onSubmit(data)
    } catch (error) {
      // Os erros serão tratados pelo ErrorContext via errorHandler
      console.error('Erro ao submeter formulário:', error)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        id={formId}
        className={className}
        onSubmit={methods.handleSubmit(handleSubmit)}
        noValidate
        data-testid={dataTestId}
        {...rest}
      >
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  )
}

interface FormFieldProps {
  name: string
  label?: string
  formId: string
  children: React.ReactNode
  tooltip?: string
  required?: boolean
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  formId,
  children,
  tooltip,
  required = false,
  className = 'mb-4',
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {tooltip && (
            <span className="ml-1 text-gray-500 cursor-help" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}
      {children}
      <ErrorDisplay formId={formId} fieldName={name} />
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  formId: string
  label?: string
  tooltip?: string
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  formId,
  label,
  tooltip,
  required,
  className = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white',
  ...props
}) => {
  const { register } = useForm()

  return (
    <FormField
      name={name}
      label={label}
      formId={formId}
      tooltip={tooltip}
      required={required}
    >
      <input id={name} {...register(name)} className={className} {...props} />
    </FormField>
  )
}

export default Form
