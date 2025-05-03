#!/usr/bin/env node

/**
 * Este script é usado para verificar se a cobertura de testes atende ao requisito mínimo (80%)
 * Pode ser usado em ambiente de CI para falhar o build se a cobertura estiver abaixo do esperado
 */

const fs = require('fs')
const path = require('path')

// Caminho para o relatório de cobertura
const coverageSummaryPath = path.join(
  __dirname,
  '../coverage/coverage-summary.json'
)

// Verificar se o arquivo existe
if (!fs.existsSync(coverageSummaryPath)) {
  console.error(
    'Arquivo de cobertura não encontrado. Execute os testes com --coverage primeiro.'
  )
  process.exit(1)
}

// Ler o arquivo de cobertura
const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'))
const total = coverageSummary.total

// Limite mínimo de cobertura (80%)
const COVERAGE_THRESHOLD = 80

// Verificar cada métrica
const metrics = {
  lines: total.lines.pct,
  statements: total.statements.pct,
  functions: total.functions.pct,
  branches: total.branches.pct,
}

console.log('\n=== RELATÓRIO DE COBERTURA DE TESTES ===')
console.log(`\nLimite mínimo: ${COVERAGE_THRESHOLD}%\n`)

// Verificar cada métrica
let allPassed = true
Object.entries(metrics).forEach(([metric, value]) => {
  const passed = value >= COVERAGE_THRESHOLD
  const status = passed ? '✅ PASSOU' : '❌ FALHOU'
  const color = passed ? '\x1b[32m' : '\x1b[31m'

  console.log(`${color}${metric}: ${value.toFixed(2)}% ${status}\x1b[0m`)

  if (!passed) {
    allPassed = false
  }
})

// Saída final
if (allPassed) {
  console.log('\n\x1b[32m✅ COBERTURA DE TESTES APROVADA!\x1b[0m\n')
  process.exit(0)
} else {
  console.log(
    '\n\x1b[31m❌ COBERTURA DE TESTES ABAIXO DO LIMITE MÍNIMO!\x1b[0m'
  )
  console.log(
    `\x1b[31mAumente a cobertura para pelo menos ${COVERAGE_THRESHOLD}% em todas as métricas.\x1b[0m\n`
  )
  process.exit(1)
}
