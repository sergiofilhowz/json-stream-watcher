import fs from 'fs'
import path from 'path'

const origin = path.join(__dirname, 'dist', 'src')
const dest = path.join(__dirname, 'dist', 'publish')

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true })
}
fs.mkdirSync(dest, { recursive: true })

const files = fs.readdirSync(origin)
const publishFiles = files.filter((file) => !file.includes('.test') && !file.includes('.map'))

publishFiles.forEach((file) => {
  const srcFile = path.join(origin, file)
  const destFile = path.join(dest, file)
  fs.copyFileSync(srcFile, destFile)
})

const filesToTransfer = ['package.json', 'README.md', 'LICENSE']

filesToTransfer.forEach((file) => {
  const srcFile = path.join(__dirname, file)
  const destFile = path.join(dest, file)
  fs.copyFileSync(srcFile, destFile)
})
