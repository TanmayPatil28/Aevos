import sharp from 'sharp';

async function extractVectors() {
  console.log("Extracting vectors...");

  // Dark Mode Logo: White 'A' on dark background.
  const darkMask = await sharp('public/brand/logo-dark.jpg')
    .grayscale()
    .normalize()
    .threshold(128)
    .extractChannel(0) // Ensure it's a single channel mask
    .toBuffer();

  const darkMeta = await sharp('public/brand/logo-dark.jpg').metadata();
  await sharp({
    create: {
      width: darkMeta.width,
      height: darkMeta.height,
      channels: 3, // Start with RGB (3 channels)
      background: { r: 255, g: 255, b: 255 } // pure white
    }
  })
  .joinChannel(darkMask) // Adds the 4th channel (Alpha)
  .png()
  .toFile('public/brand/vector-dark.png');


  // Light Mode Logo: Black 'A' on white background.
  const lightMask = await sharp('public/brand/logo-light.png')
    .grayscale()
    .normalize()
    .negate() // Invert so 'A' is white (opaque) and bg is black (transparent)
    .threshold(128)
    .extractChannel(0)
    .toBuffer();

  const lightMeta = await sharp('public/brand/logo-light.png').metadata();
  await sharp({
    create: {
      width: lightMeta.width,
      height: lightMeta.height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 } // pure black
    }
  })
  .joinChannel(lightMask)
  .png()
  .toFile('public/brand/vector-light.png');

  console.log("Extraction complete.");
}

extractVectors().catch(console.error);
