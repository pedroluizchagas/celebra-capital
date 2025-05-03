/**
 * Script para gerar screenshots de exemplo para o PWA da Celebra Capital
 * Este script cria imagens de placeholder que podem ser usadas como screenshots
 * no manifest.json até que screenshots reais estejam disponíveis.
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const chalk = require('chalk')

// Diretório de saída
const OUTPUT_DIR = path.resolve(
  __dirname,
  '..',
  'frontend',
  'public',
  'screenshots'
)

// Configurações de screenshots
const screenshots = [
  {
    width: 1280,
    height: 720,
    filename: 'desktop-1280x720.jpg',
    type: 'desktop',
    color: '#5E72E4',
  },
  {
    width: 1920,
    height: 1080,
    filename: 'desktop-1920x1080.jpg',
    type: 'desktop',
    color: '#172B4D',
  },
  {
    width: 414,
    height: 896,
    filename: 'mobile-414x896.jpg',
    type: 'mobile',
    color: '#11CDEF',
  },
  {
    width: 390,
    height: 844,
    filename: 'mobile-390x844.jpg',
    type: 'mobile',
    color: '#FB6340',
  },
]

// Criar diretório de saída se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(chalk.green(`✅ Diretório criado: ${OUTPUT_DIR}`))
}

// Função para gerar uma screenshot
function generateScreenshot(config) {
  console.log(
    chalk.blue(`🖼️ Gerando screenshot ${config.type}: ${config.filename}...`)
  )

  const canvas = createCanvas(config.width, config.height)
  const ctx = canvas.getContext('2d')

  // Preencher o background
  ctx.fillStyle = config.color
  ctx.fillRect(0, 0, config.width, config.height)

  // Desenhar um retângulo central
  const centerWidth = config.width * 0.8
  const centerHeight = config.height * 0.7
  const centerX = (config.width - centerWidth) / 2
  const centerY = (config.height - centerHeight) / 2

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(centerX, centerY, centerWidth, centerHeight)

  // Adicionar texto
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${config.width * 0.05}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Celebra Capital', config.width / 2, config.height * 0.2)

  ctx.font = `${config.width * 0.03}px Arial`
  ctx.fillText(
    `Screenshot ${config.type}`,
    config.width / 2,
    config.height * 0.3
  )
  ctx.fillText(
    `${config.width} x ${config.height}`,
    config.width / 2,
    config.height * 0.4
  )

  // Adicionar um logotipo simulado
  ctx.beginPath()
  ctx.arc(
    config.width / 2,
    config.height * 0.6,
    config.width * 0.1,
    0,
    Math.PI * 2
  )
  ctx.fillStyle = config.color
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${config.width * 0.06}px Arial`
  ctx.fillText('CC', config.width / 2, config.height * 0.6)

  // Desenhar uma barra de navegação
  ctx.fillStyle = '#333333'
  ctx.fillRect(0, 0, config.width, config.height * 0.08)

  // Salvar a imagem
  const outputPath = path.join(OUTPUT_DIR, config.filename)
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
  fs.writeFileSync(outputPath, buffer)

  console.log(chalk.green(`✅ Screenshot gerada: ${outputPath}`))

  return {
    src: `/screenshots/${config.filename}`,
    sizes: `${config.width}x${config.height}`,
    type: 'image/jpeg',
    form_factor: config.type,
    label: `Celebra Capital - ${config.type} ${config.width}x${config.height}`,
  }
}

// Gerar todas as screenshots
function generateAllScreenshots() {
  console.log(
    chalk.blue(
      '🚀 Iniciando geração de screenshots para PWA da Celebra Capital\n'
    )
  )

  const manifestEntries = []

  screenshots.forEach((screenshot) => {
    const entry = generateScreenshot(screenshot)
    manifestEntries.push(entry)
  })

  // Exibir entradas para o manifest.json
  console.log(chalk.blue('\n📋 Entradas para incluir no manifest.json:'))
  console.log(JSON.stringify({ screenshots: manifestEntries }, null, 2))

  // Atualizar manifest.json se possível
  const manifestPath = path.resolve(
    __dirname,
    '..',
    'frontend',
    'public',
    'manifest.json'
  )

  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      manifest.screenshots = manifestEntries

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      console.log(
        chalk.green('✅ manifest.json atualizado com as novas screenshots!')
      )
    } catch (err) {
      console.error(
        chalk.red(`❌ Erro ao atualizar manifest.json: ${err.message}`)
      )
      console.log(
        chalk.yellow(
          '⚠️ Por favor, atualize o manifest.json manualmente com as entradas acima.'
        )
      )
    }
  } else {
    console.log(
      chalk.yellow(
        '⚠️ manifest.json não encontrado. Por favor, adicione as entradas acima manualmente.'
      )
    )
  }

  console.log(chalk.green('\n✅ Geração de screenshots concluída!'))
}

// Executar o script
generateAllScreenshots()
