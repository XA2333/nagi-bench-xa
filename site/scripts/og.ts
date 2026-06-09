// Renders scripts/og.html to public/og.png (1200x630 Open Graph card).
// Run with: bun scripts/og.ts
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = `file://${join(here, 'og.html')}`
const out = join(here, '..', 'public', 'og.png')

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
await page.goto(src, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
await new Promise((r) => setTimeout(r, 300))
await page.screenshot({ path: out as `${string}.png` })
await browser.close()
console.log('wrote', out)
