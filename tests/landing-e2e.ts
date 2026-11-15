import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const widths = [2560, 1920, 1440, 1024, 768, 375, 320]

async function loadImages(page: Page) {
  // Include images below the fold, so a full-page screenshot never records lazy placeholders.
  await page.locator('img').evaluateAll(elements => {
    for (const element of elements) (element as HTMLImageElement).loading = 'eager'
  })
  // A viewport change selects another srcset candidate; wait for that request before decoding.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.waitForFunction(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0))
  await page.locator('img').evaluateAll(async elements => {
    await Promise.all(elements.map(element => (element as HTMLImageElement).decode()))
  })
  const images = await page.locator('img').evaluateAll(elements => elements.map(element => {
    const image = element as HTMLImageElement
    return { alt: image.alt, src: image.currentSrc, complete: image.complete, width: image.naturalWidth }
  }))
  assert.deepEqual(images.filter(image => !image.complete || image.width === 0), [], 'All landing images load')
  return images.length
}

async function assertAccessible(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  assert.deepEqual(result.violations.map(violation => ({
    id: violation.id,
    nodes: violation.nodes.map(node => node.target),
  })), [], `Axe ${label}`)
}

async function assertNoOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    elements: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
      .filter(element => {
        const bounds = element.getBoundingClientRect()
        return getComputedStyle(element).position !== 'absolute' && bounds.width > 0 && bounds.right > innerWidth + 1
      })
      .slice(0, 15)
      .map(element => {
        const bounds = element.getBoundingClientRect()
        return { tag: element.tagName, class: element.className, left: bounds.left, right: bounds.right, width: bounds.width }
      }),
  }))
  assert.ok(overflow.document <= overflow.viewport, `Overflow ${label}: ${JSON.stringify(overflow)}`)
}

async function assertFullWidthSections(page: Page, label: string) {
  const sections = await page.locator('main > section').evaluateAll(elements => elements.map(element => {
    const { left, right } = element.getBoundingClientRect()
    return { section: element.id || element.getAttribute('aria-labelledby'), left, right, viewport: innerWidth }
  }))
  assert.ok(sections.length > 0, 'Landing contains direct sections in main')
  assert.deepEqual(sections.filter(section => Math.abs(section.left) > 1 || Math.abs(section.right - section.viewport) > 1), [],
    `Sections span the viewport ${label}`)
}

async function main() {
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
  const out = 'test-results/local/website-publico'
  await mkdir(out, { recursive: true })
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const errors: string[] = []
    const privateReads: string[] = []
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) privateReads.push(request.url()) })
    const failures: string[] = []
    const captureFailure = async (check: () => Promise<void>) => {
      try { await check() } catch (error) { failures.push(error instanceof Error ? error.message : String(error)) }
    }
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('h1').count(), 1)
    assert.match(await page.title(), /Performance, lifestyle/)
    assert.equal(await page.locator('img[src*="hero-bodybuilder-magenta"]').count(), 1, 'Hero uses the photograph supplied by the owner')
    assert.equal(await page.locator('img[src*="nomelogo"]').count(), 2, 'Header and footer use the original wordmark')
    assert.equal(await page.locator('img[src*="nomelogo"]').evaluateAll(images => images.every(image => getComputedStyle(image).maskImage === 'none' && getComputedStyle(image).filter === 'none')), true, 'Official wordmarks are not recolored')
    assert.equal((await page.request.get(base + '/images/nomelogo.png')).status(), 200, 'Existing brand asset loads')

    const loadedImages: Record<number, number> = {}
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      loadedImages[width] = await loadImages(page)
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: `${out}/landing-${width}.png`, fullPage: true, style: 'nextjs-portal { display: none !important; }' })
      await captureFailure(() => assertNoOverflow(page, `${width}px`))
      await captureFailure(() => assertFullWidthSections(page, `${width}px`))
      await captureFailure(() => assertAccessible(page, `${width}px`))
      for (const tab of ['Treinos', 'Agenda']) {
        await page.getByRole('tab', { name: tab, exact: true }).click()
        await loadImages(page)
        await captureFailure(() => assertNoOverflow(page, `${width}px ${tab}`))
        await captureFailure(() => assertAccessible(page, `${width}px ${tab}`))
      }
      await page.getByRole('tab', { name: 'Alunos', exact: true }).click()
    }

    const navigation = page.getByRole('navigation', { name: 'Navegação principal' })
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    assert.equal(await page.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded'), 'true')
    await navigation.getByRole('link', { name: 'Studio', exact: true }).click()
    assert.equal(new URL(page.url()).hash, '#studio')
    assert.equal(await page.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded'), 'false')
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await page.keyboard.press('Escape')
    const menu = page.getByRole('button', { name: 'Abrir menu' })
    assert.equal(await menu.getAttribute('aria-expanded'), 'false')
    assert.equal(await menu.evaluate(element => element === document.activeElement), true)

    const broken = await page.locator('a[href^="#"]').evaluateAll(links => links
      .map(link => link.getAttribute('href')!)
      .filter(href => !document.getElementById(href.slice(1))))
    assert.deepEqual(broken, [], 'Every local anchor has a destination')
    assert.equal(await page.getByRole('link', { name: 'Começar meu teste do FormFisik Pro' }).getAttribute('href'), '/cadastro')
    assert.equal(await page.getByRole('link', { name: 'Já tem conta? Consulte sua assinatura' }).getAttribute('href'), '/assinatura')
    const firstTab = page.getByRole('tab', { name: 'Alunos', exact: true })
    await firstTab.focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.getByRole('tab', { name: 'Treinos', exact: true }).getAttribute('aria-selected'), 'true')
    assert.ok(await page.getByRole('tabpanel').getByRole('img', { name: /^Tela de Treinos/ }).isVisible())
    await page.keyboard.press('End')
    assert.ok(await page.getByRole('tabpanel').getByRole('img', { name: /^Agenda semanal/ }).isVisible())
    await page.keyboard.press('Home')
    assert.equal(await firstTab.getAttribute('aria-selected'), 'true')
    assert.equal(await firstTab.evaluate(element => element === document.activeElement), true)
    await page.keyboard.press('ArrowDown')
    assert.equal(await page.getByRole('tab', { name: 'Treinos', exact: true }).getAttribute('aria-selected'), 'true')
    await page.keyboard.press('ArrowUp')
    assert.equal(await firstTab.getAttribute('aria-selected'), 'true')
    assert.equal(await page.getByRole('button', { name: /^Ampliar tela/ }).count(), 0)
    const enlarge = page.getByRole('button', { name: 'Ver a plataforma', exact: true })
    await enlarge.click()
    const previewDialog = page.getByRole('dialog', { name: 'Tela de Alunos' })
    assert.ok(await previewDialog.isVisible())
    await captureFailure(() => assertAccessible(page, 'ampliar captura'))
    await page.keyboard.press('Escape')
    assert.equal(await previewDialog.isVisible(), false)
    assert.equal(await enlarge.evaluate(element => element === document.activeElement), true)
    await enlarge.click()
    await page.getByRole('button', { name: 'Fechar imagem ampliada' }).click()
    assert.equal(await previewDialog.isVisible(), false)
    for (const item of ['Oversized', 'Compressão', 'Acessórios']) {
      const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: item, exact: true }) })
      await card.locator('summary').click()
      assert.ok(await card.getByText('Coleção em preparação. Vendas ainda não abertas.').isVisible())
      await card.locator('summary').click()
    }
    await page.locator('#studio summary').click()
    assert.ok(await page.getByText(/Ainda não há unidades, preços ou reservas disponíveis/).isVisible())
    await page.locator('#studio summary').click()
    await page.locator('#duvidas summary').filter({ hasText: 'Como funciona o período de teste?' }).click()
    assert.ok(await page.locator('#duvidas details[open]').getByText(/cartão obrigatório/).isVisible())
    await page.locator('#duvidas summary').filter({ hasText: 'Como funciona o período de teste?' }).click()
    assert.deepEqual(privateReads, [], 'Public showcase never requests private API data')

    await page.setViewportSize({ width: 320, height: 500 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const resizedHeading = await page.evaluate(() => {
      const heading = document.querySelector('h1')!
      const before = Number.parseFloat(getComputedStyle(heading).fontSize)
      // Snapshot every computed size first: root-only scaling misses typography specified in px.
      const typography = Array.from(document.querySelectorAll<HTMLElement>('*'))
        .filter(element => element instanceof HTMLElement)
        .map(element => {
          const style = getComputedStyle(element)
          return { element, fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight) }
        })
      for (const { element, fontSize, lineHeight } of typography) {
        element.style.fontSize = `${fontSize * 2}px`
        if (Number.isFinite(lineHeight)) element.style.lineHeight = `${lineHeight * 2}px`
      }
      return { before, after: Number.parseFloat(getComputedStyle(heading).fontSize) }
    })
    assert.equal(resizedHeading.after, resizedHeading.before * 2, 'Text actually renders at 200%')
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: `${out}/landing-320-text200.png`, fullPage: true, style: 'nextjs-portal { display: none !important; }' })
    await captureFailure(() => assertNoOverflow(page, '320px, 500px height, text 200%'))
    await captureFailure(() => assertFullWidthSections(page, '320px, 500px height, text 200%'))
    await captureFailure(() => assertAccessible(page, 'text 200%'))
    assert.deepEqual(errors, [])
    await writeFile(`${out}/results.json`, JSON.stringify({
      status: failures.length === 0 ? 'PASS' : 'FAIL', failures, widths, loadedImages, axe: 'WCAG A/AA at all widths and text 200%',
      menu: 'anchors, Escape, focus', preview: 'owner-provided Alunos, Treinos, Agenda captures; click, keyboard, enlarge, Escape and focus return', collections: 'three disclosures', faq: 'trial terms', studio: 'project status', privateReads, fullWidthSections: 'viewport edges within 1px at all widths and text 200%', text200: resizedHeading, reducedMotion: true, errors,
    }, null, 2))
    assert.deepEqual(failures, [], 'Landing validation failures (screenshots and results.json saved)')
    console.log('Landing responsive, images, Axe, navigation, text 200% and metadata PASS')
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
