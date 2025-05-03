import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, Select, Radio, Textarea, FileInput } from '../Form'
import { secureClient } from '../../utils/security'
import { useAuth } from '../../context/AuthContext'

// Definição do schema de validação
const analiseCreditoSchema = z.object({
  // Informações da empresa
  razaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  cnpj: z
    .string()
    .min(14, 'CNPJ inválido')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato de CNPJ inválido'),
  segmento: z.string().min(1, 'Segmento é obrigatório'),
  tempoExistencia: z.number().min(0, 'Informe o tempo de existência'),

  // Informações financeiras
  faturamentoAnual: z.number().min(1, 'Faturamento anual é obrigatório'),
  faturamentoMensal: z.number().min(1, 'Faturamento mensal é obrigatório'),
  margemLucro: z
    .number()
    .min(0, 'Margem de lucro é obrigatória')
    .max(100, 'Margem de lucro não pode exceder 100%'),
  endividamento: z.number().min(0, 'Endividamento é obrigatório'),

  // Informações do crédito
  valorSolicitado: z.number().min(10000, 'Valor mínimo de R$ 10.000,00'),
  finalidade: z.string().min(3, 'Finalidade é obrigatória'),
  prazo: z.number().int().min(1, 'Prazo é obrigatório'),
  garantias: z.array(z.string()).min(1, 'Selecione pelo menos uma garantia'),

  // Documentação
  documentosContabeis: z
    .instanceof(FileList)
    .refine(
      (files) => files.length > 0,
      'Documentos contábeis são obrigatórios'
    )
    .refine(
      (files) =>
        Array.from(files).every((file) => file.size <= 10 * 1024 * 1024),
      'Documentos devem ter no máximo 10MB'
    ),

  // Análise adicional
  historicoCredito: z.enum([
    'excelente',
    'bom',
    'regular',
    'ruim',
    'sem_historico',
  ]),
  observacoes: z.string().optional(),
})

type AnaliseCredito = z.infer<typeof analiseCreditoSchema>

// Opções para select e radio buttons
const segmentoOptions = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'outro', label: 'Outro' },
]

const finalidadeOptions = [
  { value: 'capital_giro', label: 'Capital de Giro' },
  { value: 'expansao', label: 'Expansão de Negócio' },
  { value: 'equipamentos', label: 'Compra de Equipamentos' },
  { value: 'refinanciamento', label: 'Refinanciamento de Dívidas' },
  { value: 'estoque', label: 'Reposição de Estoque' },
  { value: 'imovel', label: 'Aquisição de Imóvel' },
  { value: 'outro', label: 'Outro' },
]

const prazoOptions = [
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
  { value: 18, label: '18 meses' },
  { value: 24, label: '24 meses' },
  { value: 36, label: '36 meses' },
  { value: 48, label: '48 meses' },
  { value: 60, label: '60 meses' },
]

const garantiasOptions = [
  { value: 'imovel', label: 'Imóvel' },
  { value: 'veiculo', label: 'Veículo' },
  { value: 'recebivel', label: 'Recebíveis' },
  { value: 'equipamento', label: 'Equipamentos' },
  { value: 'aval', label: 'Aval de Sócios' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'sem_garantia', label: 'Sem Garantia' },
]

const historicoCreditoOptions = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'ruim', label: 'Ruim' },
  { value: 'sem_historico', label: 'Sem Histórico' },
]

interface AnaliseResultado {
  aprovado: boolean
  scoreCredito: number
  taxaJuros: number
  limiteAprovado: number
  mensagem: string
}

const AnaliseCreditoForm: React.FC = () => {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnaliseCredito>({
    resolver: zodResolver(analiseCreditoSchema),
    defaultValues: {
      tempoExistencia: 0,
      faturamentoAnual: 0,
      faturamentoMensal: 0,
      margemLucro: 0,
      endividamento: 0,
      valorSolicitado: 10000,
      prazo: 12,
      garantias: [],
      historicoCredito: 'sem_historico',
      observacoes: '',
    },
  })

  // Formatação de valores monetários
  const formatarMoeda = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    let formattedValue = (parseInt(value) / 100).toFixed(2)
    e.target.value = formattedValue
  }

  // Formatação de CNPJ
  const formatarCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length > 14) value = value.slice(0, 14)

    if (value.length > 12) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(
        5,
        8
      )}/${value.slice(8, 12)}-${value.slice(12)}`
    } else if (value.length > 8) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(
        5,
        8
      )}/${value.slice(8)}`
    } else if (value.length > 5) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}.${value.slice(2)}`
    }

    e.target.value = value
  }

  // Calcular capacidade de pagamento
  const calcularCapacidadePagamento = () => {
    const faturamentoMensal = watch('faturamentoMensal') || 0
    const margemLucro = watch('margemLucro') || 0
    const endividamento = watch('endividamento') || 0

    // Capacidade de pagamento = Faturamento Mensal * Margem de Lucro / 100 - Endividamento
    const lucroMensal = faturamentoMensal * (margemLucro / 100)
    const capacidade = lucroMensal - endividamento

    return capacidade > 0 ? capacidade : 0
  }

  // Simular valor da parcela
  const calcularParcela = () => {
    const valorSolicitado = watch('valorSolicitado') || 0
    const prazo = watch('prazo') || 1

    // Taxa de juros simulada (1.5% ao mês)
    const taxaJuros = 0.015

    // Cálculo de parcela com juros compostos: PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)
    const i = taxaJuros
    const n = prazo
    const pv = valorSolicitado

    const parcela = (pv * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1)

    return isNaN(parcela) ? 0 : parcela
  }

  // Verificar se o valor da parcela é compatível com a capacidade de pagamento
  const isParcelaViavel = () => {
    const capacidade = calcularCapacidadePagamento()
    const parcela = calcularParcela()

    // Considera viável se a parcela for de até 30% da capacidade de pagamento
    return parcela <= capacidade * 0.3
  }

  const onSubmit = async (data: AnaliseCredito) => {
    try {
      setSubmitting(true)
      setError(null)

      // Para a demo, calcularemos um score de crédito simulado
      const scoreCredito = calcularScoreCredito(data)

      // Simula o envio para API
      const formData = new FormData()

      // Adiciona os campos do formulário ao FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'documentosContabeis') {
          // Adiciona os arquivos
          const files = value as FileList
          for (let i = 0; i < files.length; i++) {
            formData.append('documentos[]', files[i])
          }
        } else if (key === 'garantias') {
          // Adiciona as garantias como um array
          ;(value as string[]).forEach((garantia, i) => {
            formData.append(`garantias[${i}]`, garantia)
          })
        } else {
          // Adiciona os demais campos
          formData.append(key, String(value))
        }
      })

      // Adiciona o usuário que está fazendo a solicitação
      formData.append('userId', user?.id || '')

      // Simulação de envio para API (comentado para a demo)
      /*
      const response = await secureClient.fetch('/api/analise-credito', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar análise de crédito');
      }
      
      const resultData = await response.json();
      setResultado(resultData);
      */

      // Para a demo, usaremos um resultado simulado baseado nos cálculos
      const aprovado = scoreCredito >= 60
      const limiteAprovado = aprovado
        ? Math.min(data.valorSolicitado, data.faturamentoAnual * 0.3)
        : 0

      const taxaJuros = calcularTaxaJuros(
        scoreCredito,
        data.garantias.includes('sem_garantia')
      )

      const resultado: AnaliseResultado = {
        aprovado,
        scoreCredito,
        taxaJuros,
        limiteAprovado,
        mensagem: aprovado
          ? 'Parabéns! Sua análise de crédito foi pré-aprovada.'
          : 'Infelizmente seu crédito não foi aprovado neste momento.',
      }

      setResultado(resultado)
    } catch (err: any) {
      console.error('Erro na análise de crédito:', err)
      setError(
        err.message || 'Ocorreu um erro ao processar a análise de crédito.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Cálculo de score de crédito (simplificado para demonstração)
  const calcularScoreCredito = (data: AnaliseCredito): number => {
    let score = 0

    // Tempo de existência
    if (data.tempoExistencia > 5) score += 20
    else if (data.tempoExistencia > 2) score += 15
    else if (data.tempoExistencia > 1) score += 10
    else score += 5

    // Faturamento
    if (data.faturamentoAnual > 1000000) score += 20
    else if (data.faturamentoAnual > 500000) score += 15
    else if (data.faturamentoAnual > 100000) score += 10
    else score += 5

    // Margem de lucro
    if (data.margemLucro > 30) score += 20
    else if (data.margemLucro > 20) score += 15
    else if (data.margemLucro > 10) score += 10
    else score += 5

    // Relação valor solicitado / faturamento
    const relacaoCredito = data.valorSolicitado / data.faturamentoAnual
    if (relacaoCredito < 0.1) score += 15
    else if (relacaoCredito < 0.2) score += 10
    else if (relacaoCredito < 0.3) score += 5

    // Histórico de crédito
    switch (data.historicoCredito) {
      case 'excelente':
        score += 25
        break
      case 'bom':
        score += 20
        break
      case 'regular':
        score += 10
        break
      case 'ruim':
        score += 0
        break
      case 'sem_historico':
        score += 5
        break
    }

    return Math.min(score, 100)
  }

  // Cálculo de taxa de juros (simplificado para demonstração)
  const calcularTaxaJuros = (score: number, semGarantia: boolean): number => {
    let taxaBase = 0

    if (score >= 80) taxaBase = 0.01 // 1.0% ao mês
    else if (score >= 70) taxaBase = 0.012 // 1.2% ao mês
    else if (score >= 60) taxaBase = 0.015 // 1.5% ao mês
    else taxaBase = 0.018 // 1.8% ao mês

    // Adicional se não tiver garantia
    const adicionalSemGarantia = semGarantia ? 0.005 : 0

    return taxaBase + adicionalSemGarantia
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {!resultado ? (
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Análise de Crédito para Empresas
          </h2>

          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-medium text-blue-800 mb-2">
              Informações da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="razaoSocial"
                label="Razão Social"
                {...register('razaoSocial')}
                error={errors.razaoSocial?.message}
                required
              />

              <FormField
                id="cnpj"
                label="CNPJ"
                {...register('cnpj')}
                onChange={formatarCNPJ}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj?.message}
                required
              />

              <Select
                id="segmento"
                label="Segmento de Atuação"
                options={segmentoOptions}
                {...register('segmento')}
                error={errors.segmento?.message}
                required
              />

              <FormField
                id="tempoExistencia"
                label="Tempo de Existência (anos)"
                type="number"
                min={0}
                step={0.5}
                {...register('tempoExistencia', { valueAsNumber: true })}
                error={errors.tempoExistencia?.message}
                required
              />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-medium text-green-800 mb-2">
              Informações Financeiras
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="faturamentoAnual"
                label="Faturamento Anual (R$)"
                type="number"
                min={0}
                step={1000}
                {...register('faturamentoAnual', { valueAsNumber: true })}
                error={errors.faturamentoAnual?.message}
                helperText="Faturamento bruto dos últimos 12 meses"
                required
              />

              <FormField
                id="faturamentoMensal"
                label="Faturamento Mensal Médio (R$)"
                type="number"
                min={0}
                step={100}
                {...register('faturamentoMensal', { valueAsNumber: true })}
                error={errors.faturamentoMensal?.message}
                helperText="Média mensal dos últimos 3 meses"
                required
              />

              <FormField
                id="margemLucro"
                label="Margem de Lucro (%)"
                type="number"
                min={0}
                max={100}
                step={0.1}
                {...register('margemLucro', { valueAsNumber: true })}
                error={errors.margemLucro?.message}
                helperText="Percentual de lucro sobre o faturamento"
                required
              />

              <FormField
                id="endividamento"
                label="Endividamento Atual (R$)"
                type="number"
                min={0}
                step={100}
                {...register('endividamento', { valueAsNumber: true })}
                error={errors.endividamento?.message}
                helperText="Valor total de dívidas atuais"
                required
              />
            </div>

            {/* Capacidade de pagamento calculada */}
            <div className="mt-4 p-3 bg-white rounded border border-green-200">
              <p className="text-sm font-semibold text-gray-700">
                Capacidade de Pagamento Estimada:
                <span className="ml-2 text-green-600">
                  R${' '}
                  {calcularCapacidadePagamento().toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                  /mês
                </span>
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-medium text-yellow-800 mb-2">
              Informações do Crédito
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="valorSolicitado"
                label="Valor Solicitado (R$)"
                type="number"
                min={10000}
                step={1000}
                {...register('valorSolicitado', { valueAsNumber: true })}
                error={errors.valorSolicitado?.message}
                helperText="Mínimo de R$ 10.000,00"
                required
              />

              <Select
                id="finalidade"
                label="Finalidade do Crédito"
                options={finalidadeOptions}
                {...register('finalidade')}
                error={errors.finalidade?.message}
                required
              />

              <Select
                id="prazo"
                label="Prazo para Pagamento (meses)"
                options={prazoOptions}
                {...register('prazo', { valueAsNumber: true })}
                error={errors.prazo?.message}
                required
              />

              <Controller
                name="garantias"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Garantias Oferecidas{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 mt-1">
                      {garantiasOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`garantia-${option.value}`}
                            value={option.value}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={field.value.includes(option.value)}
                            onChange={(e) => {
                              const value = option.value
                              const values = [...field.value]

                              if (e.target.checked) {
                                if (!values.includes(value)) {
                                  values.push(value)
                                }
                              } else {
                                const index = values.indexOf(value)
                                if (index !== -1) {
                                  values.splice(index, 1)
                                }
                              }

                              field.onChange(values)
                            }}
                          />
                          <label
                            htmlFor={`garantia-${option.value}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.garantias && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.garantias.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Simulação de parcela */}
            <div className="mt-4 p-3 bg-white rounded border border-yellow-200">
              <p className="text-sm font-semibold text-gray-700">
                Parcela Estimada:
                <span
                  className={`ml-2 ${
                    isParcelaViavel() ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  R${' '}
                  {calcularParcela().toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                  /mês
                </span>
              </p>
              {!isParcelaViavel() && (
                <p className="text-xs text-red-600 mt-1">
                  Atenção: O valor da parcela excede 30% da capacidade de
                  pagamento estimada.
                </p>
              )}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-md mb-6">
            <h3 className="text-md font-medium text-purple-800 mb-2">
              Documentação e Análise
            </h3>
            <div className="space-y-4">
              <Controller
                name="documentosContabeis"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <FileInput
                    id="documentosContabeis"
                    label="Documentos Contábeis"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    onChange={onChange}
                    error={errors.documentosContabeis?.message}
                    helperText="Balanço patrimonial, DRE, ou comprovantes de faturamento"
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    required
                    {...field}
                  />
                )}
              />

              <Controller
                name="historicoCredito"
                control={control}
                render={({ field }) => (
                  <Radio
                    id="historicoCredito"
                    label="Histórico de Crédito"
                    options={historicoCreditoOptions}
                    {...field}
                    error={errors.historicoCredito?.message}
                    required
                  />
                )}
              />

              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="observacoes"
                    label="Observações Adicionais"
                    rows={4}
                    placeholder="Informe detalhes adicionais que possam ser relevantes para a análise"
                    {...field}
                    error={errors.observacoes?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              {submitting ? 'Analisando...' : 'Enviar para Análise'}
            </button>
          </div>
        </Form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Resultado da Análise</h2>

          <div
            className={`p-4 mb-4 rounded-md ${
              resultado.aprovado ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center mb-2">
              {resultado.aprovado ? (
                <svg
                  className="h-8 w-8 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-red-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <h3
                className={`text-lg font-semibold ${
                  resultado.aprovado ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {resultado.aprovado
                  ? 'Crédito Pré-Aprovado'
                  : 'Crédito Não Aprovado'}
              </h3>
            </div>
            <p className="text-gray-700">{resultado.mensagem}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-base font-semibold text-gray-700 mb-2">
                Score de Crédito
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    resultado.scoreCredito >= 80
                      ? 'bg-green-600'
                      : resultado.scoreCredito >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${resultado.scoreCredito}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Pontuação:{' '}
                <span className="font-semibold">
                  {resultado.scoreCredito}/100
                </span>
              </p>
            </div>

            {resultado.aprovado && (
              <>
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-base font-semibold text-blue-700 mb-2">
                    Taxa de Juros
                  </h4>
                  <p className="text-2xl font-bold text-blue-800">
                    {(resultado.taxaJuros * 100).toFixed(2)}% a.m.
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Taxa anual:{' '}
                    {(
                      (Math.pow(1 + resultado.taxaJuros, 12) - 1) *
                      100
                    ).toFixed(2)}
                    % a.a.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-base font-semibold text-green-700 mb-2">
                    Limite Aprovado
                  </h4>
                  <p className="text-2xl font-bold text-green-800">
                    R${' '}
                    {resultado.limiteAprovado.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setResultado(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              Voltar ao Formulário
            </button>

            {resultado.aprovado && (
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
                onClick={() =>
                  alert('Esta funcionalidade estará disponível em breve!')
                }
              >
                Prosseguir com Proposta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnaliseCreditoForm
