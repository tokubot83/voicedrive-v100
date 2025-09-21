import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

// SVGコンテンツ
const svgContent = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#4F46E5"/>
  <g transform="translate(128, 128)">
    <path d="M128 32C110.3 32 96 46.3 96 64v160c0 35.3 28.7 64 64 64s64-28.7 64-64V64c0-17.7-14.3-32-32-32h-64zm0 288c-53 0-96-43-96-96V64c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v160c0 53-43 96-96 96z" fill="white"/>
    <path d="M256 224c0 70.7-57.3 128-128 128S0 294.7 0 224h32c0 53 43 96 96 96s96-43 96-96h32z" fill="white" opacity="0.9"/>
    <rect x="112" y="352" width="32" height="64" rx="8" fill="white" opacity="0.8"/>
  </g>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputFile = path.join(publicDir, `icon-${size}x${size}.png`);

    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputFile);

      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }

  // Apple Touch Icon
  try {
    await sharp(Buffer.from(svgContent))
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('✗ Failed to generate apple-touch-icon:', error.message);
  }

  // Favicon
  try {
    await sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    await sharp(Buffer.from(svgContent))
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