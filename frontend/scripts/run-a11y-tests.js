#!/usr/bin/env node

/**
 * Script para execução automatizada de testes de acessibilidade
 *
 * Este script executa testes de acessibilidade em todas as páginas principais
 * da aplicação, utilizando axe-core e gerando relatórios detalhados.
 */

const puppeteer = require('puppeteer')
const { AxePuppeteer } = require('@axe-core/puppeteer')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')

// Configurações
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: path.join(__dirname, '..', 'a11y-reports'),
  wcagStandard: ['wcag2a', 'wcag2aa'],
  windowSizes: [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],
  routes: [
    { name: 'Login', path: '/login' },
    { name: 'Registro', path: '/registro' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Nova Proposta', path: '/propostas/nova' },
    { name: 'Minha Conta', path: '/minha-conta' },
  ],
}

// Função para formatar data
function formatDate() {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-')
}

// Função para gerar relatório HTML
function generateHtmlReport(results) {
  const date = new Date().toLocaleDateString('pt-BR')
  const time = new Date().toLocaleTimeString('pt-BR')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Acessibilidade - ${date}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.5;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }
        .violations {
          margin-top: 2rem;
        }
        .violation {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .violation h3 {
          margin-top: 0;
          color: #dc3545;
        }
        .impact {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .impact-critical { background: #dc3545; color: white; }
        .impact-serious { background: #fd7e14; color: white; }
        .impact-moderate { background: #ffc107; color: black; }
        .impact-minor { background: #20c997; color: white; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          text-align: left;
        }
        th {
          background: #f8f9fa;
        }
        .pass {
          color: #198754;
        }
        .fail {
          color: #dc3545;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Acessibilidade</h1>
        <p>Data: ${date} ${time}</p>
      </div>

      <div class="summary">
        <div class="card">
          <h3>Total de Páginas</h3>
          <p>${results.length}</p>
        </div>
        <div class="card">
          <h3>Violações Críticas</h3>
          <p class="fail">${results.reduce(
            (acc, r) =>
              acc +
              (r.violations?.filter((v) => v.impact === 'critical').length ||
                0),
            0
          )}</p>
        </div>
        <div class="card">
          <h3>Violações Sérias</h3>
          <p class="fail">${results.reduce(
            (acc, r) =>
              acc +
              (r.violations?.filter((v) => v.impact === 'serious').length || 0),
            0
          )}</p>
        </div>
        <div class="card">
          <h3>Conformidade WCAG AA</h3>
          <p class="pass">${Math.round(
            (results.reduce((acc, r) => acc + (r.passes || 0), 0) /
              results.reduce(
                (acc, r) =>
                  acc + ((r.passes || 0) + (r.violations?.length || 0)),
                0
              )) *
              100
          )}%</p>
        </div>
      </div>

      <div class="violations">
        <h2>Violações Encontradas</h2>
        ${results
          .map(
            (result) => `
          <div class="violation">
            <h3>${result.name} (${result.screenSize})</h3>
            <p>URL: ${result.url}</p>
            ${
              result.violations
                ?.map(
                  (violation) => `
              <div class="violation-detail">
                <h4>
                  <span class="impact impact-${violation.impact}">${
                    violation.impact
                  }</span>
                  ${violation.help}
                </h4>
                <p>${violation.description}</p>
                <p><a href="${
                  violation.helpUrl
                }" target="_blank">Saiba mais</a></p>
                <table>
                  <tr>
                    <th>Elemento</th>
                    <th>HTML</th>
                  </tr>
                  ${violation.nodes
                    .map(
                      (node) => `
                    <tr>
                      <td>${node.target.join(' > ')}</td>
                      <td><code>${node.html}</code></td>
                    </tr>
                  `
                    )
                    .join('')}
                </table>
              </div>
            `
                )
                .join('') || '<p>Nenhuma violação encontrada</p>'
            }
          </div>
        `
          )
          .join('')}
      </div>
    </body>
    </html>
  `
}

// Função principal
async function runA11yTests() {
  console.log(chalk.blue('Iniciando testes de acessibilidade...'))

  // Criar diretório de relatórios se não existir
  await fs.mkdir(config.outputDir, { recursive: true })

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const allResults = []

  try {
    // Para cada tamanho de tela
    for (const screenSize of config.windowSizes) {
      console.log(
        chalk.yellow(
          `\nTestando em ${screenSize.name} (${screenSize.width}x${screenSize.height})`
        )
      )

      const page = await browser.newPage()
      await page.setViewport(screenSize)

      // Para cada rota
      for (const route of config.routes) {
        console.log(chalk.blue(`\nTestando ${route.name}...`))

        try {
          await page.goto(`${config.baseUrl}${route.path}`, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          })

          // Executar análise com axe-core
          const results = await new AxePuppeteer(page)
            .configure({
              reporter: 'v2',
              runOnly: config.wcagStandard,
            })
            .analyze()

          allResults.push({
            name: route.name,
            url: route.path,
            screenSize: screenSize.name,
            violations: results.violations,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            timestamp: new Date().toISOString(),
          })

          console.log(chalk.green(`✓ ${route.name} analisado`))
        } catch (error) {
          console.error(
            chalk.red(`Erro ao testar ${route.name}: ${error.message}`)
          )
          allResults.push({
            name: route.name,
            url: route.path,
            screenSize: screenSize.name,
            error: error.message,
            timestamp: new Date().toISOString(),
          })
        }
      }

      await page.close()
    }

    // Gerar relatórios
    const dateString = formatDate()
    const reportPath = path.join(
      config.outputDir,
      `a11y-report-${dateString}.html`
    )
    const jsonPath = path.join(
      config.outputDir,
      `a11y-report-${dateString}.json`
    )

    await fs.writeFile(reportPath, generateHtmlReport(allResults))
    await fs.writeFile(jsonPath, JSON.stringify(allResults, null, 2))

    console.log(chalk.green('\nTestes concluídos!'))
    console.log(chalk.blue(`Relatório HTML: ${reportPath}`))
    console.log(chalk.blue(`Relatório JSON: ${jsonPath}`))
  } catch (error) {
    console.error(chalk.red('Erro durante os testes:', error))
    process.exit(1)
  } finally {
    await browser.close()
  }
}

// Executar testes
runA11yTests().catch(console.error)
