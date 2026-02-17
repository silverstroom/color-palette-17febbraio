import { hexToHsl, hslToHex } from './colorUtils';

/**
 * Extract dominant colors from an image via canvas quantization.
 * Returns array of { hex, count, h, s, l } sorted by frequency.
 */
export function extractColors(imageSrc, count = 12) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const MAX = 200;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        const pixels = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 248 || lum < 7) continue;
          pixels.push([r, g, b]);
        }

        if (pixels.length === 0) { resolve([]); return; }

        const buckets = {};
        for (const [r, g, b] of pixels) {
          const qr = Math.round(r / 20) * 20;
          const qg = Math.round(g / 20) * 20;
          const qb = Math.round(b / 20) * 20;
          const key = `${qr},${qg},${qb}`;
          if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
          buckets[key].r += r;
          buckets[key].g += g;
          buckets[key].b += b;
          buckets[key].count++;
        }

        const sorted = Object.values(buckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, count * 4);

        const colors = sorted.map(b => {
          const r = Math.round(b.r / b.count);
          const g = Math.round(b.g / b.count);
          const bl = Math.round(b.b / b.count);
          const hex = '#' + [r, g, bl].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
          const hsl = hexToHsl(hex);
          return { hex, count: b.count, r, g, b: bl, ...hsl };
        });

        const unique = [];
        for (const c of colors) {
          const tooClose = unique.some(u => {
            const dr = u.r - c.r, dg = u.g - c.g, db = u.b - c.b;
            return Math.sqrt(dr * dr + dg * dg + db * db) < 35;
          });
          if (!tooClose) unique.push(c);
          if (unique.length >= count) break;
        }

        resolve(unique);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}


/**
 * Analyze all uploaded images and auto-assign primary/secondary/accent.
 *
 * @param {Array<Array<{hex,count,h,s,l}>>} colorSets - one array per image
 * @returns {{ primary, secondary, accent, primaryName, secondaryName, accentName } | null}
 */
export function autoAssignRoles(colorSets) {
  const merged = {};
  for (const set of colorSets) {
    for (const c of set) {
      const key = c.hex;
      if (!merged[key]) merged[key] = { ...c, totalCount: 0 };
      merged[key].totalCount += c.count;
    }
  }

  const all = Object.values(merged);
  if (all.length < 2) return null;

  const chromatic = all.filter(c => c.s > 12);
  if (chromatic.length < 2) return null;

  const hueDist = (h1, h2) => {
    const d = Math.abs(h1 - h2);
    return Math.min(d, 360 - d);
  };

  // ── PRIMARY: dark, saturated, frequent ──
  const darkCandidates = chromatic
    .filter(c => c.l < 55 && c.s > 20)
    .sort((a, b) => {
      const scoreA = a.totalCount * 2 + a.s * 0.5 + (100 - a.l) * 0.8;
      const scoreB = b.totalCount * 2 + b.s * 0.5 + (100 - b.l) * 0.8;
      return scoreB - scoreA;
    });

  const primary = darkCandidates[0] || chromatic.sort((a, b) => b.totalCount - a.totalCount)[0];

  // ── SECONDARY: bright/medium, same or adjacent family ──
  const secondaryCandidates = chromatic
    .filter(c => c.hex !== primary.hex)
    .sort((a, b) => {
      // Prefer: brighter, saturated, frequent, within 120° of primary
      const hDistA = hueDist(a.h, primary.h);
      const hDistB = hueDist(b.h, primary.h);
      const familyBonusA = hDistA < 120 ? 30 : 0;
      const familyBonusB = hDistB < 120 ? 30 : 0;
      const scoreA = a.totalCount * 1.5 + a.s * 0.8 + a.l * 0.4 + familyBonusA;
      const scoreB = b.totalCount * 1.5 + b.s * 0.8 + b.l * 0.4 + familyBonusB;
      return scoreB - scoreA;
    });

  const secondary = secondaryCandidates[0];
  if (!secondary) return null;

  // ── ACCENT: warm (orange/red/yellow) or most contrasting ──
  const warmCandidates = chromatic
    .filter(c => c.hex !== primary.hex && c.hex !== secondary.hex)
    .filter(c => ((c.h >= 0 && c.h <= 65) || c.h >= 330) && c.s > 30 && c.l > 30 && c.l < 75)
    .sort((a, b) => (b.totalCount + b.s * 1.2) - (a.totalCount + a.s * 1.2));

  let accent = warmCandidates[0];

  if (!accent) {
    accent = chromatic
      .filter(c => c.hex !== primary.hex && c.hex !== secondary.hex)
      .sort((a, b) => {
        const distA = hueDist(a.h, primary.h) + hueDist(a.h, secondary.h);
        const distB = hueDist(b.h, primary.h) + hueDist(b.h, secondary.h);
        return distB - distA;
      })[0];
  }

  if (!accent) {
    accent = { hex: hslToHex(30, 75, 55) };
  }

  return {
    primary: primary.hex,
    primaryName: suggestColorName(primary.hex),
    secondary: secondary.hex,
    secondaryName: suggestColorName(secondary.hex),
    accent: accent.hex,
    accentName: suggestColorName(accent.hex),
  };
}


/** Suggest an Italian color name based on HSL */
export function suggestColorName(hex) {
  const { h, s, l } = hexToHsl(hex);

  if (s < 10) {
    if (l > 90) return 'Bianco';
    if (l > 60) return 'Grigio chiaro';
    if (l > 30) return 'Grigio';
    return 'Nero';
  }

  let hue;
  if (h < 15 || h >= 345) hue = 'Rosso';
  else if (h < 40) hue = 'Arancione';
  else if (h < 65) hue = 'Giallo';
  else if (h < 160) hue = 'Verde';
  else if (h < 200) hue = 'Teal';
  else if (h < 260) hue = 'Blu';
  else if (h < 290) hue = 'Viola';
  else if (h < 330) hue = 'Magenta';
  else hue = 'Rosa';

  let mod = '';
  if (l < 25) mod = ' scuro';
  else if (l < 40) mod = ' profondo';
  else if (l > 80) mod = ' chiaro';

  return `${hue}${mod}`;
}
