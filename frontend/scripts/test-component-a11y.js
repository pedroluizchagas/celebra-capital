// Script para testar acessibilidade de componentes individuais
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { axe } from '@axe-core/react'
import React from 'react'
import ReactDOM from 'react-dom'
import { configureToMatchImageSnapshot } from 'jest-image-snapshot'
import { toMatchImageSnapshot } from 'jest-image-snapshot'

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Diretório de saída para relatórios
const outputDir = path.resolve(__dirname, '..', 'a11y-reports/components')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

/**
 * Testa um componente React quanto à acessibilidade
 *
 * @param {React.ComponentType} Component - O componente React a ser testado
 * @param {Object} props - Propriedades para o componente
 * @param {string} componentName - Nome do componente para o relatório
 */
async function testComponentA11y(Component, props, componentName) {
  console.log(
    chalk.blue(`Testando acessibilidade do componente: ${componentName}...`)
  )

  // Criar elemento para montar o componente
  const container = document.createElement('div')
  document.body.appendChild(container)

  try {
    // Renderizar o componente
    ReactDOM.render(React.createElement(Component, props), container)

    // Executar análise de acessibilidade
    const results = await axe(container)

    // Salvar resultados
    const reportPath = path.join(outputDir, `${componentName}-a11y.json`)
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))

    // Exibir resultados no console
    if (results.violations.length === 0) {
      console.log(
        chalk.green(
          `✓ Nenhuma violação de acessibilidade encontrada em ${componentName}`
        )
      )
    } else {
      console.log(
        chalk.yellow(
          `⚠ ${results.violations.length} violações de acessibilidade encontradas em ${componentName}:`
        )
      )

      results.violations.forEach((violation, index) => {
        console.log(
          chalk.red(`${index + 1}. ${violation.help} - ${violation.impact}`)
        )
        console.log(chalk.gray(`   ${violation.helpUrl}`))

        violation.nodes.forEach((node) => {
          console.log(chalk.yellow(`   - ${node.html}`))
        })

        console.log()
      })
    }

    console.log(chalk.blue(`Relatório salvo em: ${reportPath}`))

    return {
      success: results.violations.length === 0,
      violations: results.violations,
      passes: results.passes,
    }
  } finally {
    // Limpar
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
  }
}

/**
 * Executa testes de acessibilidade em todos os componentes fornecidos
 *
 * @param {Array<{component: React.ComponentType, props: Object, name: string}>} components
 */
async function runComponentA11yTests(components) {
  console.log(
    chalk.green('Iniciando testes de acessibilidade em componentes...')
  )

  const results = []

  for (const { component, props, name } of components) {
    try {
      const result = await testComponentA11y(component, props, name)
      results.push({
        name,
        success: result.success,
        violations: result.violations.length,
        passes: result.passes.length,
      })
    } catch (error) {
      console.error(chalk.red(`Erro ao testar ${name}:`), error)
      results.push({
        name,
        success: false,
        error: error.message,
      })
    }
  }

  // Gerar relatório resumido
  const summaryPath = path.join(outputDir, 'summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2))

  // Exibir resumo
  console.log(chalk.green('\nResumo dos testes de acessibilidade:'))
  console.log(chalk.blue('---------------------------------'))

  const passedCount = results.filter((r) => r.success).length
  console.log(
    chalk.green(
      `✓ ${passedCount}/${results.length} componentes passaram nos testes`
    )
  )

  if (passedCount < results.length) {
    console.log(
      chalk.yellow(
        `⚠ ${
          results.length - passedCount
        } componentes têm problemas de acessibilidade`
      )
    )

    results
      .filter((r) => !r.success)
      .forEach((result) => {
        console.log(
          chalk.red(
            `- ${result.name}: ${result.violations || 'Erro durante o teste'}`
          )
        )
      })
  }

  console.log(chalk.blue('---------------------------------'))
  console.log(chalk.blue(`Relatório resumido salvo em: ${summaryPath}`))
}

// Exemplo de uso:
//
// import Button from '../src/components/Button';
// import Input from '../src/components/Input';
//
// runComponentA11yTests([
//   { component: Button, props: { children: 'Enviar' }, name: 'Button-Default' },
//   { component: Button, props: { children: 'Enviar', disabled: true }, name: 'Button-Disabled' },
//   { component: Input, props: { label: 'Nome' }, name: 'Input-WithLabel' },
//   { component: Input, props: {}, name: 'Input-NoLabel' }
// ]);

export { testComponentA11y, runComponentA11yTests }
