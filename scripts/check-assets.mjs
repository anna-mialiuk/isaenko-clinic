import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.sass', '.scss', '.css', '.html'])
const ignoredDirectories = new Set(['node_modules', 'dist', '.git'])
const assetRegex = /\/images\/[^"'`)\s]+/g
const missing = new Set()
const references = new Set()

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue

    const fullPath = join(directory, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!sourceExtensions.has(extname(fullPath))) continue

    const content = readFileSync(fullPath, 'utf8')
    const matches = content.match(assetRegex) || []

    matches.forEach((assetPath) => {
      references.add(assetPath)

      if (!existsSync(resolve(rootDir, `public${assetPath}`))) {
        missing.add(assetPath)
      }
    })
  }
}

walk(rootDir)

if (missing.size > 0) {
  console.error('Missing assets:')
  ;[...missing].sort().forEach((asset) => console.error(`- ${asset}`))
  process.exit(1)
}

console.log(`Checked ${references.size} static asset references. Missing assets: 0.`)
