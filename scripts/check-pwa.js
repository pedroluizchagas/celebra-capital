/**
 * Script para verificar a configuração e os requisitos do PWA
 * Celebra Capital
 */

const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const puppeteer = require('puppeteer')
const chalk = require('chalk')

// Caminhos base
const BASE_DIR = path.resolve(__dirname, '..')
const FRONTEND_DIR = path.join(BASE_DIR, 'frontend')
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public')

// Lista de arquivos essenciais para um PWA
const requiredPWAFiles = [
  'manifest.json',
  'service-worker.js',
  'offline.html',
  'pwa-utils.js',
  'pwa-install-banner.js',
  'cache-manager.js',
  'background-sync.js',
  'push-notifications.js',
  'meta-tags.html',
]

// Lista de diretórios a verificar
const requiredDirectories = ['icons', 'screenshots']

// Lista de ícones essenciais para um PWA
const requiredIcons = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'maskable-icon.png',
  'apple-touch-icon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
]

// Verificação do manifest.json
async function checkManifest() {
  console.log(chalk.blue.bold('\n🔍 Verificando manifest.json...'))
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json')

  try {
    const data = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(data)

    // Lista de campos obrigatórios para um PWA
    const requiredFields = [
      'name',
      'short_name',
      'description',
      'start_url',
      'display',
      'background_color',
      'theme_color',
      'icons',
    ]

    const missingFields = []

    requiredFields.forEach((field) => {
      if (!manifest[field]) {
        missingFields.push(field)
      }
    })

    if (missingFields.length > 0) {
      console.log(
        chalk.red(
          `❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`
        )
      )
    } else {
      console.log(
        chalk.green('✅ Todos os campos obrigatórios estão presentes')
      )
    }

    // Verificar ícones
    if (manifest.icons && Array.isArray(manifest.icons)) {
      console.log(
        chalk.green(`✅ ${manifest.icons.length} ícones definidos no manifest`)
      )

      // Verificar ícones necessários para instalação
      const iconSizes = manifest.icons.map((icon) => icon.sizes)
      const requiredSizes = ['192x192', '512x512']
      const missingSizes = requiredSizes.filter(
        (size) => !iconSizes.includes(size)
      )

      if (missingSizes.length > 0) {
        console.log(
          chalk.red(
            `❌ Tamanhos de ícones necessários ausentes: ${missingSizes.join(
              ', '
            )}`
          )
        )
      } else {
        console.log(
          chalk.green('✅ Ícones necessários para instalação estão presentes')
        )
      }

      // Verificar ícone mascarável
      const hasMaskableIcon = manifest.icons.some(
        (icon) => icon.purpose === 'maskable'
      )
      if (!hasMaskableIcon) {
        console.log(
          chalk.yellow(
            '⚠️ Recomendável incluir um ícone com purpose="maskable"'
          )
        )
      } else {
        console.log(chalk.green('✅ Ícone mascarável está presente'))
      }
    } else {
      console.log(chalk.red('❌ Propriedade "icons" ausente ou inválida'))
    }

    // Verificar screenshots
    if (manifest.screenshots && manifest.screenshots.length > 0) {
      console.log(
        chalk.green(
          `✅ ${manifest.screenshots.length} screenshots definidas no manifest`
        )
      )
    } else {
      console.log(
        chalk.yellow('⚠️ Recomendável incluir screenshots no manifest')
      )
    }

    // Verificar shortcuts
    if (manifest.shortcuts && manifest.shortcuts.length > 0) {
      console.log(
        chalk.green(
          `✅ ${manifest.shortcuts.length} atalhos definidos no manifest`
        )
      )
    } else {
      console.log(chalk.yellow('⚠️ Recomendável incluir atalhos no manifest'))
    }

    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(chalk.red('❌ manifest.json não encontrado'))
    } else {
      console.log(
        chalk.red(`❌ Erro ao verificar manifest.json: ${error.message}`)
      )
    }
    return false
  }
}

// Verificar service worker
async function checkServiceWorker() {
  console.log(chalk.blue.bold('\n🔍 Verificando service-worker.js...'))
  const swPath = path.join(PUBLIC_DIR, 'service-worker.js')

  try {
    const data = await fs.readFile(swPath, 'utf8')

    // Verificar funcionalidades essenciais no service worker
    const features = [
      { name: 'Cache API', pattern: /\.(?:open|put|match|delete)\(/i },
      { name: 'Fetch API', pattern: /fetch\(/i },
      {
        name: 'Cache estratégico',
        pattern: /(?:networkFirst|cacheFirst|staleWhileRevalidate)/i,
      },
      {
        name: 'Instalação',
        pattern: /self\.addEventListener\(['"]install['"]/i,
      },
      {
        name: 'Ativação',
        pattern: /self\.addEventListener\(['"]activate['"]/i,
      },
      {
        name: 'Interceptação de fetch',
        pattern: /self\.addEventListener\(['"]fetch['"]/i,
      },
      { name: 'Modo offline', pattern: /offline|fallback/i },
    ]

    const missingFeatures = []

    features.forEach((feature) => {
      if (!feature.pattern.test(data)) {
        missingFeatures.push(feature.name)
      }
    })

    if (missingFeatures.length > 0) {
      console.log(
        chalk.yellow(
          `⚠️ Funcionalidades potencialmente ausentes: ${missingFeatures.join(
            ', '
          )}`
        )
      )
    } else {
      console.log(
        chalk.green(
          '✅ O service worker parece implementar todas as funcionalidades essenciais'
        )
      )
    }

    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(chalk.red('❌ service-worker.js não encontrado'))
    } else {
      console.log(
        chalk.red(`❌ Erro ao verificar service-worker.js: ${error.message}`)
      )
    }
    return false
  }
}

// Verificar arquivos e pastas necessários
async function checkRequiredFiles() {
  console.log(
    chalk.blue.bold('\n🔍 Verificando arquivos necessários para PWA...')
  )

  // Verificar arquivos
  const missingFiles = []

  for (const file of requiredPWAFiles) {
    try {
      await fs.access(path.join(PUBLIC_DIR, file))
    } catch (error) {
      missingFiles.push(file)
    }
  }

  if (missingFiles.length > 0) {
    console.log(chalk.red(`❌ Arquivos ausentes: ${missingFiles.join(', ')}`))
  } else {
    console.log(chalk.green('✅ Todos os arquivos necessários estão presentes'))
  }

  // Verificar diretórios
  const missingDirs = []

  for (const dir of requiredDirectories) {
    try {
      await fs.access(path.join(PUBLIC_DIR, dir))
    } catch (error) {
      missingDirs.push(dir)
    }
  }

  if (missingDirs.length > 0) {
    console.log(chalk.red(`❌ Diretórios ausentes: ${missingDirs.join(', ')}`))
  } else {
    console.log(
      chalk.green('✅ Todos os diretórios necessários estão presentes')
    )
  }

  // Verificar ícones
  if (!missingDirs.includes('icons')) {
    console.log(chalk.blue.bold('\n🔍 Verificando ícones...'))

    const missingIcons = []

    for (const icon of requiredIcons) {
      try {
        await fs.access(path.join(PUBLIC_DIR, 'icons', icon))
      } catch (error) {
        missingIcons.push(icon)
      }
    }

    if (missingIcons.length > 0) {
      console.log(chalk.red(`❌ Ícones ausentes: ${missingIcons.join(', ')}`))
    } else {
      console.log(chalk.green('✅ Todos os ícones necessários estão presentes'))
    }
  }

  return missingFiles.length === 0 && missingDirs.length === 0
}

// Verificar a auditoria do Lighthouse para PWA
async function checkLighthousePWA(url = 'http://localhost:3000') {
  console.log(
    chalk.blue.bold('\n🔍 Executando auditoria Lighthouse para PWA...')
  )

  try {
    // Verificar se o site está rodando
    try {
      await execPromise(`curl -s -o /dev/null -w "%{http_code}" ${url}`)
    } catch (error) {
      console.log(
        chalk.yellow(
          `⚠️ Site não está acessível em ${url}. Pulando auditoria do Lighthouse.`
        )
      )
      return false
    }

    // Executar o Lighthouse com flags para PWA
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    console.log(
      chalk.yellow(
        '🔄 Iniciando auditoria do Lighthouse (pode levar alguns minutos)...'
      )
    )

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

      // Injetando Lighthouse diretamente
      const lighthouseResult = await page.evaluate(async () => {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/lighthouse@9.6.8/dist/lighthouse.js'
        document.head.appendChild(script)

        return new Promise((resolve) => {
          script.onload = async () => {
            const result = await lighthouse.startFlow(window.location.href, {
              config: {
                extends: 'lighthouse:default',
                settings: {
                  onlyCategories: ['pwa'],
                },
              },
            })
            resolve(result)
          }
        })
      })

      console.log(chalk.green('✅ Auditoria concluída'))

      // Analisar resultados
      const pwaScore = lighthouseResult?.categories?.pwa?.score * 100 || 0
      console.log(chalk.blue(`🏆 Pontuação PWA: ${pwaScore.toFixed(0)}%`))

      if (pwaScore >= 90) {
        console.log(chalk.green('✅ Excelente! Seu PWA está bem configurado.'))
      } else if (pwaScore >= 75) {
        console.log(chalk.yellow('⚠️ Bom, mas há espaço para melhorias.'))
      } else {
        console.log(chalk.red('❌ O PWA precisa de melhorias significativas.'))
      }

      // Listar recomendações
      if (lighthouseResult?.audits) {
        console.log(chalk.blue.bold('\nRecomendações:'))

        Object.values(lighthouseResult.audits)
          .filter((audit) => !audit.score || audit.score < 1)
          .forEach((audit) => {
            console.log(chalk.yellow(`• ${audit.title}: ${audit.description}`))
          })
      }
    } catch (error) {
      console.log(chalk.red(`❌ Erro ao executar auditoria: ${error.message}`))
    } finally {
      await browser.close()
    }

    return true
  } catch (error) {
    console.log(
      chalk.red(`❌ Erro ao verificar o Lighthouse: ${error.message}`)
    )
    return false
  }
}

// Função principal
async function runPWACheck() {
  console.log(
    chalk.green.bold('🚀 Iniciando verificação do PWA da Celebra Capital\n')
  )

  let success = true

  // Verificar arquivos e diretórios necessários
  success = (await checkRequiredFiles()) && success

  // Verificar manifest.json
  success = (await checkManifest()) && success

  // Verificar service worker
  success = (await checkServiceWorker()) && success

  // Verificar auditoria do Lighthouse (opcional, pois requer o site em execução)
  try {
    await checkLighthousePWA()
  } catch (error) {
    console.log(
      chalk.yellow(
        '⚠️ Não foi possível executar a auditoria do Lighthouse. Certifique-se de que o site está em execução.'
      )
    )
  }

  // Resumo final
  console.log(chalk.blue.bold('\n📋 Resumo da verificação:'))
  if (success) {
    console.log(
      chalk.green.bold('✅ O PWA parece estar configurado corretamente!')
    )
  } else {
    console.log(
      chalk.yellow.bold(
        '⚠️ Há problemas na configuração do PWA que precisam ser corrigidos.'
      )
    )
  }

  console.log(chalk.blue('\nPróximos passos recomendados:'))
  console.log('1. Corrija os problemas identificados acima')
  console.log('2. Teste o PWA em diferentes dispositivos e navegadores')
  console.log('3. Verifique a compatibilidade com diferentes tamanhos de tela')
  console.log('4. Teste o comportamento offline')
  console.log('5. Valide a instalação do aplicativo')

  return success
}

// Executar a verificação
runPWACheck().catch(console.error)
