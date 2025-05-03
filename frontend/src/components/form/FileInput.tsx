import React, {
  InputHTMLAttributes,
  useState,
  ChangeEvent,
  useRef,
} from 'react'

interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string
  error?: string
  helperText?: string
  accept?: string
  buttonText?: string
  onChange?: (files: FileList | null) => void
  showFileName?: boolean
  maxFileSize?: number // em bytes
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  error,
  helperText,
  id,
  required,
  accept,
  className,
  buttonText = 'Selecionar arquivo',
  onChange,
  showFileName = true,
  maxFileSize,
  disabled,
  ...props
}) => {
  const [fileName, setFileName] = useState<string>('')
  const [fileError, setFileError] = useState<string>('')
  const [isOverDragArea, setIsOverDragArea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const validateFileSize = (file: File): boolean => {
    if (maxFileSize && file.size > maxFileSize) {
      const sizeMB = Math.round(maxFileSize / 1024 / 1024)
      setFileError(`O arquivo excede o tamanho máximo de ${sizeMB} MB.`)
      return false
    }

    setFileError('')
    return true
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length > 0) {
      const file = files[0]
      setFileName(file.name)

      const isValid = validateFileSize(file)

      if (isValid && onChange) {
        onChange(files)
      } else if (!isValid) {
        e.target.value = ''
        setFileName('')
        if (onChange) {
          onChange(null)
        }
      }
    } else {
      setFileName('')
      setFileError('')
      if (onChange) {
        onChange(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsOverDragArea(true)
    }
  }

  const handleDragLeave = () => {
    setIsOverDragArea(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOverDragArea(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      setFileName(file.name)

      const isValid = validateFileSize(file)

      if (isValid && onChange) {
        onChange(files)
      } else if (!isValid) {
        setFileName('')
        if (onChange) {
          onChange(null)
        }
      }
    }
  }

  const errorId = error || fileError ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const fileNameId = showFileName && fileName ? `${id}-filename` : undefined
  const describedBy = [errorId, helperId, fileNameId].filter(Boolean).join(' ')

  return (
    <div className="form-field">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <div
        className={`
          mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
          ${
            isOverDragArea
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300'
          }
          ${error || fileError ? 'border-red-500' : ''}
          ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed opacity-60'
              : 'cursor-pointer'
          }
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            handleClick()
            e.preventDefault()
          }
        }}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <span className="relative rounded-md font-medium text-primary-600 hover:text-primary-700 focus:outline-none">
              {buttonText}
            </span>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept
              ?.split(',')
              .map((type) => type.trim().replace('*', '').toUpperCase())
              .join(', ') || 'Todos os formatos aceitos'}
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        aria-required={required}
        aria-invalid={!!(error || fileError)}
        aria-describedby={describedBy || undefined}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />

      {showFileName && fileName && (
        <p
          id={fileNameId}
          className="mt-2 text-sm text-gray-500"
          aria-live="polite"
        >
          <span className="sr-only">Arquivo selecionado: </span>
          {fileName}
        </p>
      )}

      <div className="mt-1">
        {helperText && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {(error || fileError) && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error || fileError}
          </p>
        )}
      </div>
    </div>
  )
}
