// Generates 192x192 and 512x512 PNG icons for PWA using canvas
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  const r = size * 0.22
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fillStyle = '#0d0d0d'
  ctx.fill()

  // Gold sparkle ✦
  ctx.font = `bold ${size * 0.52}px Georgia, serif`
  ctx.fillStyle = '#c49a5a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', size / 2, size / 2 + size * 0.03)

  return canvas.toBuffer('image/png')
}

const outDir = join(__dirname, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192))
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512))

console.log('Icons generated successfully.')
