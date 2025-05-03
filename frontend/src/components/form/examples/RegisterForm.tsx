import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormField,
  Select,
  Checkbox,
  Radio,
  Textarea,
  FileInput,
} from '../'

// Schema de validação com zod
const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .regex(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      'Telefone inválido, use o formato (XX) XXXXX-XXXX'
    ),
  cargo: z.string().min(1, 'Selecione um cargo'),
  experiencia: z.string().min(1, 'Selecione seu nível de experiência'),
  tecnologias: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma tecnologia'),
  observacoes: z
    .string()
    .max(500, 'Observações não podem exceder 500 caracteres')
    .optional(),
  curriculo: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Currículo é obrigatório')
    .refine(
      (files) => files[0].size <= 5 * 1024 * 1024,
      'Arquivo deve ter no máximo 5MB'
    ),
  termos: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
})

type RegisterFormData = z.infer<typeof registerSchema>

const cargoOptions = [
  { value: 'desenvolvedor', label: 'Desenvolvedor' },
  { value: 'designer', label: 'Designer' },
  { value: 'gerente', label: 'Gerente de Projeto' },
  { value: 'analista', label: 'Analista de Sistemas' },
]

const experienciaOptions = [
  { value: 'junior', label: 'Júnior (0-2 anos)' },
  { value: 'pleno', label: 'Pleno (2-5 anos)' },
  { value: 'senior', label: 'Sênior (5+ anos)' },
]

const tecnologiasOptions = [
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
]

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tecnologias: [],
      observacoes: '',
      termos: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    // Simular envio de dados para API
    console.log('Dados enviados:', data)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert('Formulário enviado com sucesso!')
  }

  // Observando o valor do campo de tecnologias para implementar o multi-select
  const tecnologiasValue = watch('tecnologias')

  const handleTecnologiaChange = (value: string) => {
    const currentValues = tecnologiasValue || []

    if (currentValues.includes(value)) {
      // Se já existe, remover
      setValue(
        'tecnologias',
        currentValues.filter((item) => item !== value)
      )
    } else {
      // Se não existe, adicionar
      setValue('tecnologias', [...currentValues, value])
    }
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        Cadastro de Profissional
      </h2>

      <FormField
        id="nome"
        label="Nome completo"
        {...register('nome')}
        error={errors.nome?.message}
        required
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <FormField
        id="telefone"
        label="Telefone"
        placeholder="(XX) XXXXX-XXXX"
        {...register('telefone')}
        error={errors.telefone?.message}
        required
      />

      <Controller
        name="cargo"
        control={control}
        render={({ field }) => (
          <Select
            id="cargo"
            label="Cargo pretendido"
            options={cargoOptions}
            error={errors.cargo?.message}
            required
            {...field}
          />
        )}
      />

      <Controller
        name="experiencia"
        control={control}
        render={({ field }) => (
          <Radio
            id="experiencia"
            label="Nível de experiência"
            options={experienciaOptions}
            error={errors.experiencia?.message}
            required
            {...field}
          />
        )}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tecnologias
          <span aria-hidden="true"> *</span>
        </label>
        <div className="space-y-2">
          {tecnologiasOptions.map((option) => (
            <Checkbox
              key={option.value}
              id={`tecnologia-${option.value}`}
              label={option.label}
              checked={tecnologiasValue?.includes(option.value)}
              onChange={() => handleTecnologiaChange(option.value)}
              error={
                tecnologiasValue?.length === 0
                  ? errors.tecnologias?.message
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <Controller
        name="observacoes"
        control={control}
        render={({ field }) => (
          <Textarea
            id="observacoes"
            label="Observações"
            rows={4}
            maxLength={500}
            showCharCount
            error={errors.observacoes?.message}
            helperText="Informações adicionais que julgar relevantes"
            {...field}
          />
        )}
      />

      <Controller
        name="curriculo"
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <FileInput
            id="curriculo"
            label="Currículo"
            accept=".pdf,.doc,.docx"
            error={errors.curriculo?.message}
            helperText="Formatos aceitos: PDF, DOC, DOCX (máx. 5MB)"
            required
            onChange={onChange}
            maxFileSize={5 * 1024 * 1024}
            {...field}
          />
        )}
      />

      <Controller
        name="termos"
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <Checkbox
            id="termos"
            label="Aceito os termos e condições"
            checked={value}
            onChange={onChange}
            error={errors.termos?.message}
            required
            {...field}
          />
        )}
      />

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar cadastro'}
        </button>
      </div>

      {isSubmitting && (
        <div
          className="text-center text-gray-500 mt-2"
          role="status"
          aria-live="polite"
        >
          Processando seu cadastro...
        </div>
      )}
    </Form>
  )
}
