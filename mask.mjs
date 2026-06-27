import sharp from 'sharp';

async function run() {
  const meta = await sharp('public/brand/logo-light.png').metadata();
  const width = meta.width;
  const height = meta.height;
  const r = width / 2;
  
  const circleSvg = `<svg width="${width}" height="${height}"><circle cx="${r}" cy="${r}" r="${r}" fill="white" /></svg>`;
  
  await sharp('public/brand/logo-light.png')
    .composite([{
      input: Buffer.from(circleSvg),
      blend: 'dest-in'
    }])
    .toFile('public/favicon.png');
    
  console.log('Favicon created.');
}

run();
