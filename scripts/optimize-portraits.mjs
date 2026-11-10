import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'

const directory = new URL('../src/assets/portraits/', import.meta.url)
let before = 0
let after = 0
for (const name of (await readdir(directory)).filter(name => name.endsWith('.png'))) {
  const source = new URL(name, directory)
  const target = new URL(name.replace(/\.png$/, '.webp'), directory)
  await sharp(source.pathname).rotate().resize({ height: 480, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 }).toFile(target.pathname)
  before += (await stat(source)).size
  after += (await stat(target)).size
}
console.log(`Portraits: ${before} → ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller)`)
