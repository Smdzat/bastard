import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const output = new URL('../src/assets/', import.meta.url)
const sources = new URL('../New-Assets/', import.meta.url)
const motifs = [
  'service-desk-overview',
  'hardware-procurement',
  'helpdesk-ai-chat',
  'device-inventory-fleet',
  'change-management',
  'knowledge-base',
  'vulnerability-security-monitoring',
]

await mkdir(output, { recursive: true })

for (const [index, name] of motifs.entries()) {
  const number = String(index + 1).padStart(2, '0')
  await sharp(fileURLToPath(new URL(`${number}-${name}.png`, sources)))
    .trim({ threshold: 8 })
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 5 })
    .toFile(fileURLToPath(new URL(`nevian-${name}.webp`, output)))
}
console.log('Prepared seven Nevian WebP illustrations.')
