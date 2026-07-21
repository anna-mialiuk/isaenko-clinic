import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { directionRoutes } from '../src/data/directionRoutes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')
const publicDir = resolve(rootDir, 'public')

const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://dr-isaenko.com'

const staticRoutes = ['/', '/about', '/team', '/hospital', '/contacts', '/multimodal']
const cityPrefixes = ['', '/kyiv']

const uniqueRoutes = Array.from(
  new Set(
    cityPrefixes.flatMap((prefix) => [
      ...staticRoutes.map((route) => (prefix ? `${prefix}${route === '/' ? '' : route}` : route)),
      ...directionRoutes.map((route) => `${prefix}${route.path}`),
    ]),
  ),
).sort((a, b) => a.localeCompare(b))

const today = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map((route) => {
    const loc = `${siteUrl}${route === '/' ? '' : route}`
    const priority = route === '/' || route === '/kyiv' ? '1.0' : '0.8'

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>
`

mkdirSync(distDir, { recursive: true })
writeFileSync(resolve(distDir, 'sitemap.xml'), xml)
writeFileSync(resolve(publicDir, 'sitemap.xml'), xml)

console.log(`Generated sitemap.xml with ${uniqueRoutes.length} URLs`)
