import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

if (!existsSync('.git')) {
  console.log('Husky setup skipped: this folder is not a Git repository yet.')
  process.exit(0)
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(command, ['husky'], { stdio: 'inherit' })

if (result.error) {
  console.error('Unable to initialize Husky:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 0)
