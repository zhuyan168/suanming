const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const repoRoot = path.resolve(__dirname, '..');
const inputDir = path.join(repoRoot, 'public', 'assets', 'tarot-original');
const outputDir = path.join(
  repoRoot,
  'public',
  'assets',
  process.env.TAROT_WEBP_OUTPUT_DIR || 'tarot-webp'
);

const TARGET_WIDTH = Number(process.env.TAROT_WEBP_WIDTH || 1144);
const TARGET_HEIGHT = Number(process.env.TAROT_WEBP_HEIGHT || 1920);
const WEBP_QUALITY = Number(process.env.TAROT_WEBP_QUALITY || 82);

async function getPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => entry.name)
    .sort();
}

async function convertOne(fileName) {
  const inputPath = path.join(inputDir, fileName);
  const outputName = fileName.replace(/\.png$/i, '.webp');
  const outputPath = path.join(outputDir, outputName);

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  await image
    .resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath);

  const outputStat = await fs.stat(outputPath);
  return {
    fileName,
    outputName,
    inputWidth: metadata.width,
    inputHeight: metadata.height,
    outputBytes: outputStat.size,
  };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const files = await getPngFiles(inputDir);
  if (files.length === 0) {
    throw new Error(`No PNG files found in ${inputDir}`);
  }

  console.log(`Found ${files.length} PNG files.`);
  console.log(`Output: ${outputDir}`);
  console.log(`Target: ${TARGET_WIDTH}x${TARGET_HEIGHT}, WebP quality ${WEBP_QUALITY}`);

  let totalBytes = 0;
  const dimensions = new Map();

  for (const file of files) {
    const result = await convertOne(file);
    totalBytes += result.outputBytes;
    const dimensionKey = `${result.inputWidth}x${result.inputHeight}`;
    dimensions.set(dimensionKey, (dimensions.get(dimensionKey) || 0) + 1);
    console.log(
      `${result.outputName} ${Math.round(result.outputBytes / 1024)} KB ` +
        `(source ${result.inputWidth}x${result.inputHeight})`
    );
  }

  console.log('');
  console.log('Done.');
  console.log(`Converted: ${files.length}`);
  console.log(`Total WebP size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('Source dimensions:');
  for (const [dimension, count] of [...dimensions.entries()].sort()) {
    console.log(`- ${dimension}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
