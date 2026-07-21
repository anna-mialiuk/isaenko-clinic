import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const sourceDir = resolve(rootDir, 'src/assets')
const targetDir = resolve(rootDir, 'dist/src/assets')

if (!existsSync(sourceDir)) {
  console.warn('src/assets folder was not found. Nothing to copy.')
  process.exit(0)
}

mkdirSync(targetDir, { recursive: true })
cpSync(sourceDir, targetDir, { recursive: true })

console.log('Copied src/assets to dist/src/assets for static string-based asset URLs.')
