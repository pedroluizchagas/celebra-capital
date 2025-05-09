// Script para auditoria de acessibilidade automatizada
import puppeteer from 'puppeteer'
import { AxePuppeteer } from '@axe-core/puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cores do Design System da Celebra Capital
const celebraColors = {
  blue: {
    base: '#0111a2', // Celebra Blue base
    50: '#ecf0ff',
    100: '#dce2ff',
    500: '#6860fa',
    700: '#473ad1',
    900: '#2f2d80',
  },
  orange: {
    base: '#d23a07', // Celebra Orange base
    300: '#ffb275',
    500: '#ff6f1b',
    700: '#c54104',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  feedback: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
}

// Configurações
const config = {
  baseUrl: 'http://localhost:5173', // URL base para testes locais
  outputDir: path.resolve(__dirname, '..', 'a11y-reports'),
  routes: [
    { path: '/', name: 'Login' },
    { path: '/register', name: 'Registro' },
    { path: '/form', name: 'Formulário Principal', auth: true },
    { path: '/upload-documents', name: 'Upload de Documentos', auth: true },
    { path: '/signature', name: 'Assinatura', auth: true },
    { path: '/success', name: 'Sucesso', auth: true },
    { path: '/admin/dashboard', name: 'Painel Admin', auth: true, admin: true },
    {
      path: '/admin/proposals',
      name: 'Lista de Propostas',
      auth: true,
      admin: true,
    },
    { path: '/admin/reports', name: 'Relatórios', auth: true, admin: true },
  ],
  authToken: process.env.TEST_AUTH_TOKEN || '',
  adminToken: process.env.TEST_ADMIN_TOKEN || '',
  wcagStandard: 'wcag2aa', // Padrão WCAG AA
  windowSizes: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' },
  ],
}

// Garantir que o diretório de saída exista
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true })
}

// Função para formatar a data
const formatDate = () => {
  const date = new Date()
  return date.toISOString().replace(/:/g, '-').slice(0, 19)
}

// Função para simular login
async function login(page, admin = false) {
  const token = admin ? config.adminToken : config.authToken

  // Armazenar token no localStorage para autenticação
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
    if (token.includes('admin')) {
      localStorage.setItem('user_role', 'admin')
    } else {
      localStorage.setItem('user_role', 'user')
    }
  }, token)

  await page.reload()
}

// Função para executar a análise axe em uma página
async function runAxeAnalysis(page, route, screenSize) {
  console.log(
    chalk.blue(`Analisando ${route.name} (${screenSize.name}) - ${route.path}`)
  )

  try {
    // Executa análise com axe-core
    const results = await new AxePuppeteer(page)
      .configure({
        reporter: 'v2',
        runOnly: config.wcagStandard,
      })
      .analyze()

    return {
      url: route.path,
      name: route.name,
      screenSize: screenSize.name,
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error(chalk.red(`Erro ao analisar ${route.name}: ${error.message}`))
    return {
      url: route.path,
      name: route.name,
      screenSize: screenSize.name,
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

// Função para gerar relatório HTML
function generateHtmlReport(allResults) {
  // Agregação de resultados para estatísticas
  const stats = {
    totalPages: config.routes.length * config.windowSizes.length,
    totalViolations: 0,
    totalPasses: 0,
    totalIncomplete: 0,
    violationsByImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    violationsByType: {},
    complianceScore: 0,
  }

  // Processar resultados para estatísticas
  allResults.forEach((result) => {
    if (result.violations) {
      stats.totalViolations += result.violations.length

      result.violations.forEach((violation) => {
        // Contar por impacto
        if (violation.impact) {
          stats.violationsByImpact[violation.impact]++
        }

        // Contar por tipo
        if (!stats.violationsByType[violation.id]) {
          stats.violationsByType[violation.id] = {
            name: violation.help,
            count: 0,
            description: violation.description,
            impact: violation.impact,
            helpUrl: violation.helpUrl,
          }
        }
        stats.violationsByType[violation.id].count++
      })
    }

    if (result.passes) {
      stats.totalPasses += result.passes
    }

    if (result.incomplete) {
      stats.totalIncomplete += result.incomplete
    }
  })

  // Calcular pontuação de conformidade (simplificada)
  const totalChecks =
    stats.totalPasses + stats.totalViolations + stats.totalIncomplete
  stats.complianceScore =
    totalChecks > 0 ? Math.round((stats.totalPasses / totalChecks) * 100) : 0

  // Ordenar violações por contagem (mais frequentes primeiro)
  const sortedViolations = Object.entries(stats.violationsByType)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)

  // Gerar HTML - Com as cores e estilo da Celebra Capital
  const dateString = formatDate()
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Conformidade WCAG AA - Celebra Capital</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Cores da Celebra Capital */
      --celebra-blue: ${celebraColors.blue.base};
      --celebra-blue-light: ${celebraColors.blue[100]};
      --celebra-blue-medium: ${celebraColors.blue[500]};
      --celebra-blue-dark: ${celebraColors.blue[700]};
      
      --celebra-orange: ${celebraColors.orange.base};
      --celebra-orange-light: ${celebraColors.orange[300]};
      --celebra-orange-medium: ${celebraColors.orange[500]};
      --celebra-orange-dark: ${celebraColors.orange[700]};
      
      --gray-50: ${celebraColors.gray[50]};
      --gray-100: ${celebraColors.gray[100]};
      --gray-200: ${celebraColors.gray[200]};
      --gray-300: ${celebraColors.gray[300]};
      --gray-400: ${celebraColors.gray[400]};
      --gray-500: ${celebraColors.gray[500]};
      --gray-700: ${celebraColors.gray[700]};
      --gray-800: ${celebraColors.gray[800]};
      --gray-900: ${celebraColors.gray[900]};
      
      --success: ${celebraColors.feedback.success};
      --error: ${celebraColors.feedback.error};
      --warning: ${celebraColors.feedback.warning};
      --info: ${celebraColors.feedback.info};
      
      /* Variáveis semânticas */
      --color-primary: var(--celebra-blue);
      --color-secondary: var(--celebra-orange);
      --color-background: var(--gray-50);
      --color-paper: white;
      --color-text-primary: var(--gray-900);
      --color-text-secondary: var(--gray-700);
      --color-border: var(--gray-200);
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      line-height: 1.6;
      color: var(--color-text-primary);
      background-color: var(--color-background);
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background-color: var(--color-primary);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h1, h2, h3 {
      margin-top: 0;
      font-weight: 600;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background-color: var(--color-paper);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid var(--color-border);
    }
    
    .score {
      font-size: 3rem;
      font-weight: bold;
      color: var(--color-primary);
    }
    
    .violations-by-impact {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .impact-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.85rem;
    }
    
    .impact-critical {
      background-color: var(--error);
      color: white;
    }
    
    .impact-serious {
      background-color: #ef4444;
      color: white;
    }
    
    .impact-moderate {
      background-color: var(--warning);
      color: #333;
    }
    
    .impact-minor {
      background-color: #fef08a;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background-color: var(--color-paper);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }
    
    th {
      background-color: var(--celebra-blue-light);
      color: var(--celebra-blue-dark);
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: var(--gray-50);
    }
    
    .accordion {
      background-color: var(--color-paper);
      color: var(--color-text-primary);
      cursor: pointer;
      padding: 18px;
      width: 100%;
      text-align: left;
      border: 1px solid var(--color-border);
      outline: none;
      transition: 0.4s;
      font-weight: 600;
      border-radius: 8px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .active, .accordion:hover {
      background-color: var(--gray-100);
    }
    
    .panel {
      padding: 0 18px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s ease-out;
      background-color: var(--color-paper);
      border-radius: 0 0 8px 8px;
      border: 1px solid var(--color-border);
      border-top: none;
      margin-top: -5px;
      margin-bottom: 5px;
    }

    .badge {
      font-size: 0.85rem;
      padding: 4px 8px;
      border-radius: 4px;
      margin-left: 10px;
      background-color: var(--celebra-blue-light);
      color: var(--celebra-blue-dark);
    }
    
    .url-link {
      color: var(--info);
      text-decoration: none;
      font-weight: 500;
    }
    
    .url-link:hover {
      text-decoration: underline;
    }
    
    .suggestion-list {
      padding-left: 20px;
    }
    
    .suggestion-list li {
      margin-bottom: 12px;
    }
    
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
      text-align: center;
      font-size: 0.9rem;
      color: var(--gray-500);
    }
    
    /* Logo da Celebra */
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-celebra {
      font-weight: 700;
      font-size: 1.5rem;
      color: white;
    }
    
    .logo-highlight {
      color: var(--celebra-orange-light);
    }
    
    /* Botão de ação */
    .btn {
      display: inline-block;
      background-color: var(--celebra-blue);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.2s;
      border: none;
      cursor: pointer;
      margin-top: 12px;
    }
    
    .btn:hover {
      background-color: var(--celebra-blue-dark);
    }
    
    .btn-secondary {
      background-color: var(--celebra-orange);
    }
    
    .btn-secondary:hover {
      background-color: var(--celebra-orange-dark);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span class="logo-celebra">Celebra <span class="logo-highlight">Capital</span></span>
    </div>
    <h1>Relatório de Conformidade WCAG AA</h1>
    <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</p>
  </header>
  
  <main>
    <section class="summary">
      <div class="metric-card">
        <h2>Pontuação de Conformidade</h2>
        <div class="score">${stats.complianceScore}%</div>
        <p>Baseado em ${
          stats.totalPasses + stats.totalViolations + stats.totalIncomplete
        } verificações de acessibilidade</p>
        <a href="#recomendacoes" class="btn">Ver Recomendações</a>
      </div>
      
      <div class="metric-card">
        <h2>Resumo dos Testes</h2>
        <p>✅ <strong>${stats.totalPasses}</strong> testes passaram</p>
        <p>❌ <strong>${
          stats.totalViolations
        }</strong> violações encontradas</p>
        <p>⚠️ <strong>${stats.totalIncomplete}</strong> testes inconclusivos</p>
        <p>📊 <strong>${stats.totalPages}</strong> páginas analisadas</p>
      </div>
      
      <div class="metric-card">
        <h2>Violações por Impacto</h2>
        <div class="violations-by-impact">
          <span class="impact-badge impact-critical">Crítico: ${
            stats.violationsByImpact.critical
          }</span>
          <span class="impact-badge impact-serious">Sério: ${
            stats.violationsByImpact.serious
          }</span>
          <span class="impact-badge impact-moderate">Moderado: ${
            stats.violationsByImpact.moderate
          }</span>
          <span class="impact-badge impact-minor">Menor: ${
            stats.violationsByImpact.minor
          }</span>
        </div>
      </div>
    </section>
    
    <section>
      <h2>Principais Problemas de Acessibilidade</h2>
      ${sortedViolations
        .map(
          (violation) => `
        <button class="accordion">
          ${violation.name} 
          <span class="badge impact-${violation.impact || 'moderate'}">${
            violation.count
          } ocorrências</span>
        </button>
        <div class="panel">
          <p>${violation.description}</p>
          <p><strong>Impacto:</strong> ${
            violation.impact || 'Não especificado'
          }</p>
          <p><a href="${
            violation.helpUrl
          }" target="_blank" class="url-link">Mais informações sobre esta regra</a></p>
        </div>
      `
        )
        .join('')}
    </section>
    
    <section>
      <h2>Detalhes por Página</h2>
      <table>
        <thead>
          <tr>
            <th>Página</th>
            <th>Tamanho de Tela</th>
            <th>Violações</th>
            <th>Testes Passados</th>
            <th>Inconclusivos</th>
          </tr>
        </thead>
        <tbody>
          ${allResults
            .map(
              (result) => `
            <tr>
              <td>${result.name}</td>
              <td>${result.screenSize}</td>
              <td>${result.violations ? result.violations.length : 'Erro'}</td>
              <td>${result.passes || '-'}</td>
              <td>${result.incomplete || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </section>
    
    <section id="recomendacoes">
      <h2>Recomendações</h2>
      <p>Com base na análise automatizada, recomendamos focar nas seguintes áreas para melhorar a conformidade WCAG AA:</p>
      <ol class="suggestion-list">
        ${sortedViolations
          .slice(0, 5)
          .map(
            (violation) => `
          <li>
            <strong>${violation.name}</strong>: ${violation.description}
            <br>
            <a href="${violation.helpUrl}" target="_blank" class="url-link">Saiba como corrigir</a>
          </li>
        `
          )
          .join('')}
      </ol>
      <p>Lembre-se que os testes automatizados identificam aproximadamente 30% dos problemas de acessibilidade. Testes manuais com leitores de tela e outros dispositivos de tecnologia assistiva são essenciais para uma avaliação completa.</p>
      
      <div style="margin-top: 20px;">
        <a href="#" class="btn btn-secondary" onclick="window.print(); return false;">Imprimir Relatório</a>
      </div>
    </section>
  </main>
  
  <footer>
    <p>Este relatório foi gerado automaticamente como parte do processo de auditoria de acessibilidade da Celebra Capital.</p>
    <p>Padrão de conformidade: WCAG 2.1 AA</p>
  </footer>

  <script>
    var acc = document.getElementsByClassName("accordion");
    for (var i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  </script>
</body>
</html>
  `

  return html
}

// Função principal para executar a auditoria
async function runAccessibilityAudit() {
  console.log(chalk.green('Iniciando auditoria de acessibilidade WCAG AA...'))

  const dateString = formatDate()
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const allResults = []

  // Para cada tamanho de tela
  for (const screenSize of config.windowSizes) {
    console.log(
      chalk.yellow(
        `\nTestando em ${screenSize.name} (${screenSize.width}x${screenSize.height})`
      )
    )

    const page = await browser.newPage()
    await page.setViewport({
      width: screenSize.width,
      height: screenSize.height,
    })

    // Para cada rota
    for (const route of config.routes) {
      try {
        // Navegar para a URL
        await page.goto(`${config.baseUrl}${route.path}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        })

        // Se a rota precisa de autenticação
        if (route.auth) {
          await login(page, route.admin)

          // Navegar novamente para a rota após o login
          await page.goto(`${config.baseUrl}${route.path}`, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          })
        }

        // Esperar pela estabilidade da página
        await page.waitForTimeout(1000)

        // Executar análise
        const result = await runAxeAnalysis(page, route, screenSize)
        allResults.push(result)

        // Exibir resumo
        if (result.violations) {
          console.log(
            chalk.yellow(
              `  → ${result.violations.length} violações encontradas`
            )
          )

          // Mostrar as violações críticas e sérias
          const criticalViolations = result.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
          )

          if (criticalViolations.length > 0) {
            console.log(chalk.red('  Violações críticas/sérias:'))
            criticalViolations.forEach((v) => {
              console.log(chalk.red(`    - ${v.help} (${v.impact})`))
            })
          }
        } else if (result.error) {
          console.log(chalk.red(`  → Erro: ${result.error}`))
        } else {
          console.log(chalk.green('  → Nenhuma violação encontrada'))
        }
      } catch (error) {
        console.error(
          chalk.red(`Erro ao processar ${route.name}: ${error.message}`)
        )
        allResults.push({
          url: route.path,
          name: route.name,
          screenSize: screenSize.name,
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  // Fechar o navegador
  await browser.close()

  // Salvar resultados JSON
  const jsonOutput = path.join(
    config.outputDir,
    `a11y-results-${dateString}.json`
  )
  fs.writeFileSync(jsonOutput, JSON.stringify(allResults, null, 2))

  // Gerar e salvar relatório HTML
  const htmlReport = generateHtmlReport(allResults)
  const htmlOutput = path.join(
    config.outputDir,
    `a11y-report-${dateString}.html`
  )
  fs.writeFileSync(htmlOutput, htmlReport)

  // Salvar também como relatório mais recente
  const latestOutput = path.join(config.outputDir, 'a11y-report-latest.html')
  fs.writeFileSync(latestOutput, htmlReport)

  console.log(chalk.green('\nAuditoria de acessibilidade concluída!'))
  console.log(chalk.blue(`Relatório JSON salvo em: ${jsonOutput}`))
  console.log(chalk.blue(`Relatório HTML salvo em: ${htmlOutput}`))
  console.log(chalk.blue(`Relatório HTML (último) salvo em: ${latestOutput}`))
  console.log(
    chalk.yellow(
      `\nExecute 'npm run a11y:report' para abrir o relatório no navegador.\n`
    )
  )
}

// Executar a auditoria
runAccessibilityAudit().catch((error) => {
  console.error(chalk.red('Erro na auditoria de acessibilidade:'), error)
  process.exit(1)
})
