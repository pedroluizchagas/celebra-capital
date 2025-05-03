/**
 * Script de Auditoria de SEO para Celebra Capital
 * Este script verifica e otimiza aspectos de SEO do site.
 */

const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const lighthouse = require('lighthouse')
const { URL } = require('url')
const chromeLauncher = require('chrome-launcher')

// URLs para testar
const urlsToTest = [
  'http://localhost:3000/',
  'http://localhost:3000/login',
  'http://localhost:3000/registro',
  'http://localhost:3000/propostas',
]

// Verificações de SEO on-page
async function checkOnPageSEO(page, url) {
  console.log(`\n📝 Verificando SEO on-page para: ${url}`)

  // Objeto para armazenar resultados
  const results = {
    url,
    title: null,
    metaDescription: null,
    h1Count: 0,
    headings: {
      h1: [],
      h2: [],
      h3: [],
    },
    images: {
      total: 0,
      withAlt: 0,
      withoutAlt: 0,
    },
    links: {
      total: 0,
      internalCount: 0,
      externalCount: 0,
      brokenCount: 0,
    },
    canonicalUrl: null,
    structuredData: [],
    wordCount: 0,
    mobile: null,
    pageSpeed: null,
  }

  // Título da página
  results.title = await page.title()
  console.log(`• Título: ${results.title}`)
  console.log(`  Tamanho: ${results.title.length} caracteres`)
  if (results.title.length < 30 || results.title.length > 60) {
    console.log('  ⚠️ O título está fora do tamanho ideal (30-60 caracteres)')
  }

  // Meta description
  results.metaDescription = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]')
    return meta ? meta.getAttribute('content') : null
  })

  if (results.metaDescription) {
    console.log(`• Meta description: ${results.metaDescription}`)
    console.log(`  Tamanho: ${results.metaDescription.length} caracteres`)
    if (
      results.metaDescription.length < 70 ||
      results.metaDescription.length > 160
    ) {
      console.log(
        '  ⚠️ A meta description está fora do tamanho ideal (70-160 caracteres)'
      )
    }
  } else {
    console.log('❌ Meta description não encontrada')
  }

  // Verificar headings
  results.headings = await page.evaluate(() => {
    const headings = {
      h1: Array.from(document.querySelectorAll('h1')).map((h) =>
        h.textContent.trim()
      ),
      h2: Array.from(document.querySelectorAll('h2')).map((h) =>
        h.textContent.trim()
      ),
      h3: Array.from(document.querySelectorAll('h3')).map((h) =>
        h.textContent.trim()
      ),
    }
    return headings
  })

  results.h1Count = results.headings.h1.length
  console.log(`• Headings:`)
  console.log(
    `  H1: ${results.h1Count} (${results.h1Count === 1 ? '✅' : '⚠️'})`
  )
  console.log(`  H2: ${results.headings.h2.length}`)
  console.log(`  H3: ${results.headings.h3.length}`)

  if (results.h1Count !== 1) {
    console.log('  ⚠️ A página deve ter exatamente um H1')
  }

  // Verificar imagens e atributos alt
  results.images = await page.evaluate(() => {
    const images = document.querySelectorAll('img')
    const total = images.length
    let withAlt = 0
    let withoutAlt = 0
    const imagesWithoutAlt = []

    images.forEach((img) => {
      if (img.hasAttribute('alt') && img.getAttribute('alt').trim() !== '') {
        withAlt++
      } else {
        withoutAlt++
        if (img.src) {
          imagesWithoutAlt.push(img.src)
        }
      }
    })

    return { total, withAlt, withoutAlt, imagesWithoutAlt }
  })

  console.log(`• Imagens:`)
  console.log(`  Total: ${results.images.total}`)
  console.log(`  Com alt: ${results.images.withAlt}`)
  console.log(`  Sem alt: ${results.images.withoutAlt}`)

  if (results.images.withoutAlt > 0) {
    console.log('  ⚠️ Existem imagens sem atributo alt')
    results.images.imagesWithoutAlt.slice(0, 5).forEach((src) => {
      console.log(`    - ${src}`)
    })
  }

  // Verificar links
  results.links = await page.evaluate(() => {
    const baseUrl = window.location.origin
    const links = document.querySelectorAll('a')
    let total = links.length
    let internalCount = 0
    let externalCount = 0

    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (!href) return

      if (href.startsWith(baseUrl) || href.startsWith('/')) {
        internalCount++
      } else if (href.startsWith('http')) {
        externalCount++
      }
    })

    return { total, internalCount, externalCount }
  })

  console.log(`• Links:`)
  console.log(`  Total: ${results.links.total}`)
  console.log(`  Internos: ${results.links.internalCount}`)
  console.log(`  Externos: ${results.links.externalCount}`)

  // Verificar canonical URL
  results.canonicalUrl = await page.evaluate(() => {
    const link = document.querySelector('link[rel="canonical"]')
    return link ? link.getAttribute('href') : null
  })

  if (results.canonicalUrl) {
    console.log(`• URL canônica: ${results.canonicalUrl}`)
  } else {
    console.log('❌ URL canônica não encontrada')
  }

  // Verificar dados estruturados
  results.structuredData = await page.evaluate(() => {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )
    const data = []

    scripts.forEach((script) => {
      try {
        const json = JSON.parse(script.textContent)
        data.push(json)
      } catch (e) {
        // Ignorar JSON inválido
      }
    })

    return data
  })

  console.log(
    `• Dados estruturados: ${results.structuredData.length > 0 ? '✅' : '❌'}`
  )
  if (results.structuredData.length > 0) {
    results.structuredData.forEach((data, i) => {
      console.log(`  - Tipo ${i + 1}: ${data['@type'] || 'Desconhecido'}`)
    })
  }

  // Contagem aproximada de palavras
  results.wordCount = await page.evaluate(() => {
    const bodyText = document.body.innerText
    return bodyText.split(/\s+/).filter((word) => word.trim() !== '').length
  })

  console.log(`• Contagem de palavras: ${results.wordCount}`)
  if (results.wordCount < 300) {
    console.log('  ⚠️ Conteúdo pode ser muito curto para SEO ideal')
  }

  return results
}

// Rodar Lighthouse para métricas de desempenho e SEO
async function runLighthouse(url) {
  console.log(`\n🚀 Executando Lighthouse para: ${url}`)

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  }

  const runnerResult = await lighthouse(url, options)
  const reportJson = runnerResult.report
  const report = JSON.parse(reportJson)

  await chrome.kill()

  const results = {
    performance: report.categories.performance.score * 100,
    accessibility: report.categories.accessibility.score * 100,
    bestPractices: report.categories['best-practices'].score * 100,
    seo: report.categories.seo.score * 100,
    metrics: {
      firstContentfulPaint:
        report.audits['first-contentful-paint'].displayValue,
      largestContentfulPaint:
        report.audits['largest-contentful-paint'].displayValue,
      totalBlockingTime: report.audits['total-blocking-time'].displayValue,
      cumulativeLayoutShift:
        report.audits['cumulative-layout-shift'].displayValue,
    },
  }

  console.log(`• Performance: ${results.performance.toFixed(0)}%`)
  console.log(`• Acessibilidade: ${results.accessibility.toFixed(0)}%`)
  console.log(`• Melhores Práticas: ${results.bestPractices.toFixed(0)}%`)
  console.log(`• SEO: ${results.seo.toFixed(0)}%`)

  console.log('\n• Métricas Core Web Vitals:')
  console.log(
    `  - First Contentful Paint: ${results.metrics.firstContentfulPaint}`
  )
  console.log(
    `  - Largest Contentful Paint: ${results.metrics.largestContentfulPaint}`
  )
  console.log(`  - Total Blocking Time: ${results.metrics.totalBlockingTime}`)
  console.log(
    `  - Cumulative Layout Shift: ${results.metrics.cumulativeLayoutShift}`
  )

  return results
}

// Função principal
async function runSEOAudit() {
  console.log('Iniciando auditoria de SEO...')
  const browser = await puppeteer.launch({ headless: true })
  const results = []

  try {
    for (const url of urlsToTest) {
      console.log(`\n==== Analisando ${url} ====`)
      const page = await browser.newPage()

      // Simular dispositivo móvel para algumas verificações
      await page.emulate(puppeteer.devices['Pixel 2'])

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

        // Verificações On-Page
        const seoResults = await checkOnPageSEO(page, url)

        // Lighthouse
        const lighthouseResults = await runLighthouse(url)

        results.push({
          url,
          seo: seoResults,
          lighthouse: lighthouseResults,
        })
      } catch (error) {
        console.error(`Erro ao analisar ${url}:`, error)
        results.push({
          url,
          error: error.message,
        })
      } finally {
        await page.close()
      }
    }

    // Salvar resultados
    const outputDir = path.join(__dirname, '../reports')
    await fs.mkdir(outputDir, { recursive: true })

    const reportPath = path.join(
      outputDir,
      `seo-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    )

    await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
    console.log(`\nRelatório salvo em ${reportPath}`)

    // Resumo dos resultados
    console.log('\n📊 Resumo da auditoria de SEO:')
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.url}: Erro - ${result.error}`)
        return
      }

      const { lighthouse } = result
      console.log(`🔍 ${result.url}:`)
      console.log(`  • Performance: ${lighthouse?.performance.toFixed(0)}%`)
      console.log(`  • SEO Score: ${lighthouse?.seo.toFixed(0)}%`)

      // Listar problemas críticos
      const issues = []

      const seo = result.seo
      if (!seo.metaDescription) issues.push('Meta description ausente')
      if (seo.h1Count !== 1)
        issues.push(`${seo.h1Count === 0 ? 'Sem tag H1' : 'Múltiplas tags H1'}`)
      if (seo.images.withoutAlt > 0)
        issues.push(`${seo.images.withoutAlt} imagens sem alt`)
      if (!seo.canonicalUrl) issues.push('URL canônica ausente')
      if (lighthouse && lighthouse.performance < 70)
        issues.push('Performance abaixo de 70%')
      if (lighthouse && lighthouse.seo < 90)
        issues.push('Score SEO abaixo de 90%')

      if (issues.length > 0) {
        console.log('  • Problemas críticos:')
        issues.forEach((issue) => console.log(`    - ${issue}`))
      } else {
        console.log('  • Sem problemas críticos! ✅')
      }
    })
  } catch (error) {
    console.error('Erro durante a auditoria de SEO:', error)
  } finally {
    await browser.close()
  }
}

// Executar a auditoria
runSEOAudit().catch(console.error)
