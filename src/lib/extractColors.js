/**
 * Extract dominant colors from an image using canvas sampling + k-means-like clustering.
 * Returns an array of hex strings sorted by frequency.
 *
 * @param {string} imageSrc  – data URL or object URL
 * @param {number} count     – how many colors to return (default 8)
 * @returns {Promise<string[]>}
 */
export function extractColors(imageSrc, count = 8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Scale down for performance
        const MAX = 150;
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
          // Skip transparent / near-white / near-black pixels
          if (a < 128) continue;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 245 || lum < 10) continue;
          pixels.push([r, g, b]);
        }

        if (pixels.length === 0) {
          resolve([]);
          return;
        }

        // Quantize by rounding to buckets of 24
        const buckets = {};
        for (const [r, g, b] of pixels) {
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;
          if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
          buckets[key].r += r;
          buckets[key].g += g;
          buckets[key].b += b;
          buckets[key].count++;
        }

        // Sort by frequency, pick top N, compute average color per bucket
        const sorted = Object.values(buckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, count * 3); // take more, then deduplicate

        const colors = sorted.map(b => {
          const r = Math.round(b.r / b.count);
          const g = Math.round(b.g / b.count);
          const bl = Math.round(b.b / b.count);
          return {
            hex: '#' + [r, g, bl].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase(),
            count: b.count,
            r, g, b: bl,
          };
        });

        // Deduplicate colors that are too similar (distance < 40)
        const unique = [];
        for (const c of colors) {
          const tooClose = unique.some(u => {
            const dr = u.r - c.r, dg = u.g - c.g, db = u.b - c.b;
            return Math.sqrt(dr * dr + dg * dg + db * db) < 40;
          });
          if (!tooClose) unique.push(c);
          if (unique.length >= count) break;
        }

        resolve(unique.map(c => c.hex));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}
