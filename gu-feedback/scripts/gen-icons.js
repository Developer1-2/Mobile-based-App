#!/usr/bin/env node
// Script to generate PWA icons from the logo SVG
// Run: node scripts/gen-icons.js

const fs = require('fs')
const path = require('path')

// Since we can't run sharp in all envs, we create SVG-based placeholder icons
// Replace these with real PNG icons generated from logo.png

const iconSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#44A08D"/>
  <text x="50%" y="58%" font-family="Georgia,serif" font-size="${size * 0.42}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">GU</text>
</svg>`

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

;[192, 512].forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), iconSVG(size))
  console.log(`Generated icon-${size}.svg`)
})

console.log('Icon SVGs generated. Convert to PNG for production use.')
