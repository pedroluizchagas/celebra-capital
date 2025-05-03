/**
 * Script para gerar relatórios de acessibilidade formatados
 * a partir dos resultados brutos dos testes do Jest
 */

const fs = require('fs')
const path = require('path')

// Diretórios
const REPORTS_DIR = path.join(__dirname, '../reports/accessibility')
const RAW_RESULTS_FILE = path.join(REPORTS_DIR, 'raw-results.json')
const SUMMARY_FILE = path.join(REPORTS_DIR, 'summary.md')

// Garante que o diretório de relatórios existe
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
}

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
}

// Principal função para gerar os relatórios
async function generateAccessibilityReports() {
  console.log(
    `${colors.cyan}${colors.bold}Gerando relatórios de acessibilidade...${colors.reset}`
  )

  try {
    // Lê os resultados brutos dos testes
    if (!fs.existsSync(RAW_RESULTS_FILE)) {
      console.error(
        `${colors.red}Arquivo de resultados não encontrado: ${RAW_RESULTS_FILE}${colors.reset}`
      )
      return
    }

    const rawResults = JSON.parse(fs.readFileSync(RAW_RESULTS_FILE, 'utf8'))

    // Extrai as violações das anotações dos testes
    const violations = []
    let passedTestsCount = 0
    let failedTestsCount = 0
    let skippedTestsCount = 0

    rawResults.testResults.forEach((testSuite) => {
      testSuite.assertionResults.forEach((test) => {
        if (test.status === 'passed') {
          passedTestsCount++
        } else if (test.status === 'failed') {
          failedTestsCount++

          // Busca por violações de acessibilidade nas mensagens de erro
          test.failureMessages.forEach((message) => {
            if (message.includes('Expected the HTML found at')) {
              try {
                // Tenta extrair o JSON da mensagem de erro
                const jsonStartIndex =
                  message.indexOf('to have no violations. Violations:') +
                  'to have no violations. Violations:'.length
                const jsonEndIndex = message.lastIndexOf('}') + 1
                const violationsJson = message
                  .substring(jsonStartIndex, jsonEndIndex)
                  .trim()

                // Parse do JSON e adiciona à lista de violações
                const violationData = JSON.parse(violationsJson)
                violations.push({
                  testName: test.title,
                  violations: violationData,
                })
              } catch (e) {
                console.error(
                  `${colors.red}Erro ao extrair violações: ${e.message}${colors.reset}`
                )
              }
            }
          })
        } else if (test.status === 'skipped') {
          skippedTestsCount++
        }
      })
    })

    // Gera relatório resumido em Markdown
    const timestamp = new Date()
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '')
    let summaryReport = `# Relatório de Acessibilidade\n\n`
    summaryReport += `**Data:** ${timestamp}\n\n`
    summaryReport += `## Resumo\n\n`
    summaryReport += `- ✅ **Testes passados:** ${passedTestsCount}\n`
    summaryReport += `- ❌ **Testes falhos:** ${failedTestsCount}\n`
    summaryReport += `- ⏭️ **Testes ignorados:** ${skippedTestsCount}\n\n`

    if (violations.length === 0) {
      summaryReport += `## Resultado\n\n`
      summaryReport += `✨ **Parabéns!** Nenhuma violação de acessibilidade foi encontrada.\n\n`
    } else {
      summaryReport += `## Violações encontradas\n\n`

      let violationsByImpact = {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
      }

      // Agrupar violações por impacto
      violations.forEach((v) => {
        if (Array.isArray(v.violations)) {
          v.violations.forEach((violation) => {
            const impact = violation.impact || 'minor'
            if (!violationsByImpact[impact]) {
              violationsByImpact[impact] = []
            }
            violationsByImpact[impact].push({
              ...violation,
              testName: v.testName,
            })
          })
        }
      })

      // Adicionar violações ao relatório por ordem de impacto
      const impactOrder = ['critical', 'serious', 'moderate', 'minor']
      let totalViolations = 0

      impactOrder.forEach((impact) => {
        const impactViolations = violationsByImpact[impact]
        if (impactViolations && impactViolations.length > 0) {
          totalViolations += impactViolations.length

          const impactEmoji = {
            critical: '🔴',
            serious: '🟠',
            moderate: '🟡',
            minor: '🔵',
          }[impact]

          summaryReport += `### ${impactEmoji} ${
            impact.charAt(0).toUpperCase() + impact.slice(1)
          } (${impactViolations.length})\n\n`

          impactViolations.forEach((violation, index) => {
            summaryReport += `#### ${index + 1}. ${violation.id}: ${
              violation.help
            }\n\n`
            summaryReport += `- **Teste:** ${violation.testName}\n`
            summaryReport += `- **Descrição:** ${violation.description}\n`
            summaryReport += `- **Link de ajuda:** ${violation.helpUrl}\n\n`

            if (violation.nodes && violation.nodes.length > 0) {
              summaryReport += `**Elementos afetados:** ${violation.nodes.length}\n\n`

              // Limitamos a 3 elementos para não tornar o relatório muito longo
              const nodesToShow = violation.nodes.slice(0, 3)
              nodesToShow.forEach((node, nodeIndex) => {
                let html = node.html || 'Elemento não disponível'
                // Trunca HTML muito longo
                if (html.length > 200) {
                  html = html.substring(0, 200) + '...'
                }

                summaryReport += `\`\`\`html\n${html}\n\`\`\`\n\n`

                if (node.failureSummary) {
                  summaryReport += `Problema: ${node.failureSummary.replace(
                    /\n/g,
                    '\n  '
                  )}\n\n`
                }
              })

              if (violation.nodes.length > 3) {
                summaryReport += `_... e mais ${
                  violation.nodes.length - 3
                } elementos._\n\n`
              }
            }

            summaryReport += `---\n\n`
          })
        }
      })

      // Adiciona sumário e dicas
      summaryReport += `## Sumário\n\n`
      summaryReport += `Total de violações: **${totalViolations}**\n\n`
      summaryReport += `## Próximos passos\n\n`
      summaryReport += `1. Corrija as violações de acessibilidade, começando pelas de maior impacto (critical e serious)\n`
      summaryReport += `2. Execute os testes novamente para verificar se todas as correções foram efetivas\n`
      summaryReport += `3. Considere adicionar mais testes para cobrir mais componentes da aplicação\n\n`
      summaryReport += `Para mais informações sobre como corrigir problemas de acessibilidade, consulte:\n`
      summaryReport += `- [Diretrizes WCAG 2.1](https://www.w3.org/TR/WCAG21/)\n`
      summaryReport += `- [Deque University](https://dequeuniversity.com/)\n`
      summaryReport += `- [Documentação do axe-core](https://github.com/dequelabs/axe-core/blob/master/doc/API.md)\n`
    }

    // Salva o relatório resumido
    fs.writeFileSync(SUMMARY_FILE, summaryReport)

    // Gera também um relatório HTML (opcional)
    // TODO: Implementar relatório HTML mais completo se necessário

    console.log(
      `${colors.green}${colors.bold}✅ Relatórios gerados com sucesso em:${colors.reset}`
    )
    console.log(`${colors.white}${REPORTS_DIR}${colors.reset}`)

    // Saída com estatísticas
    console.log(`\n${colors.cyan}${colors.bold}Estatísticas:${colors.reset}`)
    console.log(
      `${colors.green}✓ Testes passados: ${passedTestsCount}${colors.reset}`
    )
    console.log(
      `${colors.red}✗ Testes falhos: ${failedTestsCount}${colors.reset}`
    )
    console.log(
      `${colors.yellow}⚠ Testes ignorados: ${skippedTestsCount}${colors.reset}`
    )
  } catch (error) {
    console.error(
      `${colors.red}${colors.bold}❌ Erro ao gerar relatórios:${colors.reset}`,
      error
    )
  }
}

// Executa a geração de relatórios
generateAccessibilityReports().catch((error) => {
  console.error(
    `${colors.red}${colors.bold}❌ Erro fatal:${colors.reset}`,
    error
  )
  process.exit(1)
})
