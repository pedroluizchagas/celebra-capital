/**
 * Script para gerar ícones de placeholder para o PWA da Celebra Capital
 * Este script cria ícones com diferentes dimensões necessárias para um PWA.
 * Os ícones gerados devem ser substituídos pelos ícones reais antes da produção.
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const chalk = require('chalk')

// Diretório para os ícones
const ICONS_DIR = path.join(__dirname, '../public/icons')

// Tamanhos de ícones necessários para PWA
const ICON_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512]

// Cores do tema da Celebra Capital (ajuste conforme necessário)
const COLORS = {
  primary: '#3366FF', // Azul (exemplo)
  secondary: '#FF9900', // Laranja (exemplo)
  text: '#FFFFFF', // Branco
}

// Função para criar o diretório de ícones se não existir
function createIconsDirectory() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true })
    console.log(chalk.green('✓ Diretório de ícones criado com sucesso'))
  }
}

// Função para gerar um ícone placeholder
function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Desenhar fundo
  ctx.fillStyle = COLORS.primary
  ctx.fillRect(0, 0, size, size)

  // Desenhar um círculo central
  ctx.fillStyle = COLORS.secondary
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2)
  ctx.fill()

  // Adicionar texto "CC" (iniciais de Celebra Capital)
  const fontSize = Math.floor(size / 3)
  ctx.font = `bold ${fontSize}px Arial`
  ctx.fillStyle = COLORS.text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CC', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

// Função principal
async function generateIcons() {
  try {
    console.log(chalk.blue('Gerando ícones para a PWA...'))

    // Criar diretório de ícones
    createIconsDirectory()

    // Gerar ícones para cada tamanho
    for (const size of ICON_SIZES) {
      const iconPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`)
      const iconBuffer = generateIcon(size)

      fs.writeFileSync(iconPath, iconBuffer)
      console.log(chalk.green(`✓ Ícone ${size}x${size}px gerado com sucesso`))
    }

    // Criar o arquivo manifest.json
    const manifestContent = {
      name: 'Celebra Capital - Pré-Análise de Crédito',
      short_name: 'Celebra Pré-Análise',
      description:
        'Plataforma de pré-análise de crédito para a Celebra Capital',
      icons: ICON_SIZES.map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any maskable',
      })),
      start_url: '/',
      display: 'standalone',
      theme_color: COLORS.primary,
      background_color: '#FFFFFF',
    }

    fs.writeFileSync(
      path.join(__dirname, '../public/manifest.json'),
      JSON.stringify(manifestContent, null, 2)
    )

    console.log(chalk.green('✓ Arquivo manifest.json gerado com sucesso'))
    console.log(
      chalk.blue('Processo de geração de ícones concluído com sucesso!')
    )
  } catch (error) {
    console.error(chalk.red('Erro ao gerar ícones:'), error)
    process.exit(1)
  }
}

// Executar a função principal
generateIcons()
