import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'src/assets')
await mkdir(output, { recursive: true })

for (const name of ['einkauf', 'transport', 'haushalt', 'handwerk', 'erledo-x', 'sonstiges']) {
  // Trim excess transparent padding, keeping the supplied artwork and its alpha channel.
  for (const size of [320, 720]) {
    await sharp(path.join(root, 'Assets', `${name}.png`))
      .trim({ threshold: 15 })
      .resize(size, size, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 5 })
      .toFile(path.join(output, `${name}-${size}.webp`))
  }
}
for (const width of [1000, 2000]) {
  await sharp(path.join(root, 'Assets/helfer-banner.png'))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(output, `helfer-banner-${width}.webp`))
}
console.log('14 optimized WebP derivatives created; all supplied Assets/ originals preserved.')
