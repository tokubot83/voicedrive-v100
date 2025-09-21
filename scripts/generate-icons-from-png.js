import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPng = path.join(__dirname, '../docs/20250921_icon.png');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('Generating PWA icons from PNG...');

  // SVGとして保存（オプション - PNGの場合は不要）
  // const svgOutput = path.join(publicDir, 'icon.svg');

  for (const size of sizes) {
    const outputFile = path.join(publicDir, `icon-${size}x${size}.png`);

    try {
      await sharp(inputPng)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputFile);

      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }

  // Apple Touch Icon
  try {
    await sharp(inputPng)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('✗ Failed to generate apple-touch-icon:', error.message);
  }

  // Favicon
  try {
    await sharp(inputPng)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    await sharp(inputPng)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    console.log('✓ Generated favicon files');
  } catch (error) {
    console.error('✗ Failed to generate favicon files:', error.message);
  }

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);