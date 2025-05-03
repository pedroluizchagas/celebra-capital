/**
 * Script para gerar uma imagem de compartilhamento social para a Celebra Capital
 * Esta imagem será usada quando o site for compartilhado em redes sociais
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const chalk = require('chalk')

// Diretório de saída
const OUTPUT_DIR = path.resolve(__dirname, '..', 'frontend', 'public')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'social-image.jpg')

// Dimensões recomendadas para imagem de compartilhamento social (1200x630)
const WIDTH = 1200
const HEIGHT = 630

console.log(chalk.blue('🖼️ Gerando imagem para compartilhamento social...'))

// Criar canvas
const canvas = createCanvas(WIDTH, HEIGHT)
const ctx = canvas.getContext('2d')

// Desenhar fundo
ctx.fillStyle = '#005CA9' // Azul Celebra Capital
ctx.fillRect(0, 0, WIDTH, HEIGHT)

// Desenhar área central
const centerWidth = WIDTH * 0.9
const centerHeight = HEIGHT * 0.8
const centerX = (WIDTH - centerWidth) / 2
const centerY = (HEIGHT - centerHeight) / 2

ctx.fillStyle = '#ffffff'
ctx.fillRect(centerX, centerY, centerWidth, centerHeight)

// Adicionar título
ctx.fillStyle = '#005CA9'
ctx.font = 'bold 60px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('Celebra Capital', WIDTH / 2, HEIGHT * 0.3)

// Adicionar subtítulo
ctx.font = '40px Arial'
ctx.fillText('Plataforma de Pré-Análise de Crédito', WIDTH / 2, HEIGHT * 0.45)

// Adicionar logo (simulado como um círculo)
ctx.beginPath()
ctx.arc(WIDTH / 2, HEIGHT * 0.65, 100, 0, Math.PI * 2)
ctx.fillStyle = '#005CA9'
ctx.fill()

// Adicionar texto no logo
ctx.fillStyle = '#ffffff'
ctx.font = 'bold 80px Arial'
ctx.fillText('CC', WIDTH / 2, HEIGHT * 0.65)

// Salvar imagem
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
fs.writeFileSync(OUTPUT_FILE, buffer)

console.log(chalk.green(`✅ Imagem social gerada: ${OUTPUT_FILE}`))
console.log(
  chalk.green('✅ Dimensões: 1200x630 pixels (recomendado para redes sociais)')
)
