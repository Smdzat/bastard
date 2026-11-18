import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const output = new URL('../src/assets/', import.meta.url)
await mkdir(output, { recursive: true })

for (const name of ['mini-auftrag', 'mini-helfer', 'mini-chat']) {
  await sharp(fileURLToPath(new URL(`../Assets/${name}.png`, import.meta.url)))
    .trim({ threshold: 15 })
    .resize(384, 384, { fit: 'inside' })
    .webp({ quality: 92, effort: 5 })
    .toFile(fileURLToPath(new URL(`${name}.webp`, output)))
}
console.log('Three inline assets prepared. Original PNGs preserved.')
