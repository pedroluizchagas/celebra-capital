/**
 * Script de Auditoria de Acessibilidade WCAG AA
 * Este script executa testes automáticos de acessibilidade em todas as páginas principais
 * do sistema, utilizando axe-core para verificar conformidade com WCAG 2.1 AA.
 */

const puppeteer = require('puppeteer')
const { AxePuppeteer } = require('@axe-core/puppeteer')
const fs = require('fs').promises
const path = require('path')

// URLs para testar no ambiente de desenvolvimento
const urlsToTest = [
  'http://localhost:3000/', // Página inicial
  'http://localhost:3000/login',
  'http://localhost:3000/registro',
  'http://localhost:3000/propostas',
  'http://localhost:3000/propostas/nova',
  'http://localhost:3000/minha-conta',
]

// Configuração do axe-core com regras do WCAG AA
const axeConfig = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa'],
  },
  reporter: 'v2',
  locale: 'pt_BR',
}

async function runA11yAudit() {
  console.log('Iniciando auditoria de acessibilidade WCAG AA...')
  const browser = await puppeteer.launch()
  const results = []

  try {
    for (const url of urlsToTest) {
      console.log(`\nTestando ${url}`)
      const page = await browser.newPage()

      // Configura viewport para desktop
      await page.setViewport({ width: 1280, height: 800 })

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

        // Executar axe
        const results = await new AxePuppeteer(page)
          .configure(axeConfig)
          .analyze()

        // Processar resultados
        const { violations } = results

        if (violations.length === 0) {
          console.log(`✅ Nenhuma violação encontrada para ${url}`)
        } else {
          console.log(
            `❌ Encontradas ${violations.length} violações para ${url}:`
          )

          violations.forEach((violation) => {
            console.log(
              `\n• Regra: ${violation.id} (Impacto: ${violation.impact})`
            )
            console.log(`  Descrição: ${violation.help}`)
            console.log(`  Referência: ${violation.helpUrl}`)
            console.log(`  Elementos afetados: ${violation.nodes.length}`)
          })
        }

        results.push({
          url,
          timestamp: new Date().toISOString(),
          violations,
          passes: results.passes,
          incomplete: results.incomplete,
          inapplicable: results.inapplicable,
        })
      } catch (error) {
        console.error(`Erro ao analisar ${url}:`, error)
        results.push({
          url,
          timestamp: new Date().toISOString(),
          error: error.message,
        })
      } finally {
        await page.close()
      }
    }

    // Salvar resultados em formato JSON
    const outputDir = path.join(__dirname, '../reports')
    await fs.mkdir(outputDir, { recursive: true })

    const reportPath = path.join(
      outputDir,
      `a11y-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    )

    await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
    console.log(`\nRelatório salvo em ${reportPath}`)

    // Gerar resumo de violações
    const allViolations = []
    results.forEach((result) => {
      if (result.violations) {
        result.violations.forEach((v) => {
          if (!allViolations.some((av) => av.id === v.id)) {
            allViolations.push({
              id: v.id,
              impact: v.impact,
              description: v.help,
              tags: v.tags,
              helpUrl: v.helpUrl,
            })
          }
        })
      }
    })

    console.log('\n📋 Resumo de todas as violações encontradas:')
    allViolations
      .sort((a, b) => {
        const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 }
        return impactOrder[a.impact] - impactOrder[b.impact]
      })
      .forEach((v) => {
        console.log(`- [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`)
      })
  } catch (error) {
    console.error('Erro durante a auditoria:', error)
  } finally {
    await browser.close()
  }
}

runA11yAudit().catch(console.error)
