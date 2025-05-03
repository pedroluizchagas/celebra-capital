/**
 * Script para renomear os ícones gerados para os nomes esperados pelo verificador PWA
 */

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

// Diretório de ícones
const ICONS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'icons')

console.log(chalk.blue('🔄 Renomeando ícones para padrão PWA...'))

// Mapeamento de nomes de arquivos
const iconMappings = [
  { from: 'icon-72x72.png', to: 'pwa-72x72.png' },
  { from: 'icon-96x96.png', to: 'pwa-96x96.png' },
  { from: 'icon-128x128.png', to: 'pwa-128x128.png' },
  { from: 'icon-144x144.png', to: 'pwa-144x144.png' },
  { from: 'icon-152x152.png', to: 'pwa-152x152.png' },
  { from: 'icon-192x192.png', to: 'pwa-192x192.png' },
  { from: 'icon-384x384.png', to: 'pwa-384x384.png' },
  { from: 'icon-512x512.png', to: 'pwa-512x512.png' },
  // Se não tem os ícones pequenos, copie do icon mais próximo
  { from: 'icon-72x72.png', to: 'favicon-16x16.png' },
  { from: 'icon-72x72.png', to: 'favicon-32x32.png' },
  { from: 'icon-72x72.png', to: 'favicon-48x48.png' },
  // Cópias para ícones especiais
  { from: 'icon-512x512.png', to: 'maskable-icon.png' },
  { from: 'icon-152x152.png', to: 'apple-touch-icon.png' },
]

// Função para copiar arquivo
function copyFile(source, target) {
  try {
    const sourcePath = path.join(ICONS_DIR, source)
    const targetPath = path.join(ICONS_DIR, target)

    if (!fs.existsSync(sourcePath)) {
      console.log(chalk.yellow(`⚠️ Arquivo fonte não encontrado: ${source}`))
      return false
    }

    fs.copyFileSync(sourcePath, targetPath)
    console.log(chalk.green(`✅ Copiado: ${source} -> ${target}`))
    return true
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao copiar ${source}: ${error.message}`))
    return false
  }
}

// Verificar e criar diretório de ícones se não existir
if (!fs.existsSync(ICONS_DIR)) {
  console.log(
    chalk.yellow(`⚠️ Diretório de ícones não encontrado: ${ICONS_DIR}`)
  )
  fs.mkdirSync(ICONS_DIR, { recursive: true })
  console.log(chalk.green(`✅ Diretório de ícones criado: ${ICONS_DIR}`))
}

// Renomear/copiar cada ícone
let successCount = 0
for (const mapping of iconMappings) {
  if (copyFile(mapping.from, mapping.to)) {
    successCount++
  }
}

console.log(
  chalk.blue(
    `\n📊 Resumo: ${successCount}/${iconMappings.length} ícones processados`
  )
)

if (successCount === iconMappings.length) {
  console.log(chalk.green('✅ Todos os ícones foram renomeados com sucesso!'))
} else {
  console.log(
    chalk.yellow(
      `⚠️ Alguns ícones não puderam ser processados. Execute o gerador de ícones HTML para criar os ícones ausentes.`
    )
  )
}
