/**
 * Génère deux déclinaisons du logo à partir de public/images/logo.png :
 * - logo-light.png : traits crème sur fond transparent (hero, nav sur photo)
 * - logo-dark.png  : traits encre sur fond transparent (nav sur fond clair)
 *
 * Le tracé sombre du logo original sert de masque alpha.
 */
import sharp from "sharp";

const SRC = "public/images/logo.png";
const LIGHT = { file: "public/images/logo-light.png", color: "#f7f2ea" };
const DARK = { file: "public/images/logo-dark.png", color: "#21201c" };

const { width, height } = await sharp(SRC).metadata();

/* Fond beige → transparent, traits sombres → opaques */
const alphaMask = await sharp(SRC)
  .grayscale()
  .negate()
  .normalise()
  .linear(1.6, -60)
  .png()
  .toBuffer();

for (const { file, color } of [LIGHT, DARK]) {
  await sharp({ create: { width, height, channels: 3, background: color } })
    .joinChannel(alphaMask)
    .trim()
    .png()
    .toFile(file);
  console.log("→", file);
}
