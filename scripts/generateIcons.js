const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

// Configurações
const ICONS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'icons')
const BACKGROUND_COLOR = '#005CA9' // Azul Celebra Capital
const TEXT_COLOR = '#FFFFFF'
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// Verifica se o diretório existe, se não, cria
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
  console.log(chalk.green(`✓ Diretório de ícones criado: ${ICONS_DIR}`))
}

/**
 * Gera um ícone simples com as iniciais "CC" para Celebra Capital
 */
function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Preenche o fundo
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, size, size)

  // Configuração do texto
  const fontSize = Math.floor(size * 0.5)
  ctx.fillStyle = TEXT_COLOR
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Desenha as iniciais "CC"
  ctx.fillText('CC', size / 2, size / 2)

  // Desenha um círculo ao redor (opcional)
  ctx.strokeStyle = TEXT_COLOR
  ctx.lineWidth = Math.max(size * 0.02, 1)
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2)
  ctx.stroke()

  return canvas
}

// Gera os ícones para todos os tamanhos
async function generateAllIcons() {
  console.log(chalk.blue('Gerando ícones para PWA Celebra Capital...'))

  for (const size of ICON_SIZES) {
    const canvas = generateIcon(size)
    const fileName = `icon-${size}x${size}.png`
    const filePath = path.join(ICONS_DIR, fileName)

    // Salva o arquivo
    const out = fs.createWriteStream(filePath)
    const stream = canvas.createPNGStream()
    stream.pipe(out)

    await new Promise((resolve) => {
      out.on('finish', () => {
        console.log(chalk.green(`✓ Ícone gerado: ${fileName}`))
        resolve()
      })
    })
  }

  // Cria também o favicon.ico (cópia do ícone de 32x32)
  const faviconCanvas = generateIcon(32)
  const faviconPath = path.join(
    __dirname,
    '..',
    'frontend',
    'public',
    'favicon.ico'
  )
  const faviconOut = fs.createWriteStream(faviconPath)
  const faviconStream = faviconCanvas.createPNGStream()
  faviconStream.pipe(faviconOut)

  await new Promise((resolve) => {
    faviconOut.on('finish', () => {
      console.log(chalk.green(`✓ Favicon gerado: favicon.ico`))
      resolve()
    })
  })

  console.log(chalk.blue.bold('Geração de ícones concluída com sucesso!'))
  console.log(
    chalk.yellow(
      'Nota: Estes são ícones temporários. Substitua-os pelos definitivos quando disponíveis.'
    )
  )
}

// Executa o gerador
generateAllIcons().catch((err) => {
  console.error(chalk.red('Erro ao gerar ícones:'), err)
  process.exit(1)
})
