import { lighten, darken, setLightness, blend, textOn, hexToHsl } from './colorUtils';

/**
 * Generates 4 palette configurations from brand inputs.
 *
 * @param {Object} brand
 * @param {string} brand.clientName
 * @param {string} brand.primary      - hex (e.g. #2B1A54)
 * @param {string} brand.primaryName   - label (e.g. "Termitalia Purple")
 * @param {string} brand.secondary     - hex (e.g. #2AACE2)
 * @param {string} brand.secondaryName
 * @param {string} brand.accent        - hex (e.g. #F26522)
 * @param {string} brand.accentName
 * @returns {Object} { palettes, swatches }
 */
export function generatePalettes(brand) {
  const { primary, primaryName, secondary, secondaryName, accent, accentName, clientName } = brand;

  // ── Derived colors ──
  const secondaryVeryLight = setLightness(secondary, 94);
  const secondaryLight     = setLightness(secondary, 88);
  const secondaryDark      = darken(secondary, 25);
  const secondaryDarker    = darken(secondary, 35);
  const midTone            = blend(primary, secondary, 0.55);
  const midToneDark        = darken(midTone, 10);

  const { h: primaryH } = hexToHsl(primary);
  const warmBg = `#FFF5E0`;
  const techWhite = '#F5F5F7';
  const offBg = '#F0F1F4';

  // ── PALETTE DEFINITIONS ──

  const post = {
    type: 'post',
    label: 'Post',
    headerBg: warmBg,
    headerText: primary,
    badgeBg: primary,
    badgeText: '#FFFFFF',
    leftBg: techWhite,
    leftText: primary,
    rightBg: offBg,
    bgName: `Tech White (${techWhite})`,
    bgDesc: 'Ambiente pulito e professionale: fa leggere bene testi tecnici e numeri, senza "effetto volantino". Ideale per post informativi e istituzionali.',
    accents: [
      {
        bg: primary,
        text: '#FFFFFF',
        name: `${primaryName} (${primary})`,
        desc: 'Colore primario per titoli, headline e badge. Conferisce autorevolezza e riconoscibilità del brand.',
      },
      {
        bg: secondary,
        text: textOn(secondary),
        name: `${secondaryName} (${secondary})`,
        desc: 'Per icone, separatori, micro-CTA e dettagli grafici. Mantiene coerenza visiva con il brand.',
      },
    ],
  };

  const rubrica = {
    type: 'rubrica',
    label: 'Rubriche',
    headerBg: secondary,
    headerText: textOn(secondary),
    badgeBg: lighten(secondary, 10),
    badgeText: textOn(lighten(secondary, 10)),
    leftBg: secondaryVeryLight,
    leftText: darken(primary, 5),
    rightBg: secondaryLight,
    bgName: `Sky Light (${secondaryVeryLight})`,
    bgDesc: 'Evoca chiarezza e ordine: perfetto per contenuti "spiegati bene" e caroselli a più slide. Leggibilità massima.',
    accents: [
      {
        bg: primary,
        text: '#FFFFFF',
        name: `${primaryName} (${primary})`,
        desc: 'Testo principale: massima leggibilità e serietà su sfondo chiaro. Per titoli e body text.',
      },
      {
        bg: midToneDark,
        text: textOn(midToneDark),
        name: `Mid Tone (${midToneDark})`,
        desc: 'Solo per step, box informativi e highlight soft. Aggiunge profondità senza staccare dal tono.',
      },
    ],
  };

  const carosello = {
    type: 'carosello',
    label: 'Carosello',
    headerBg: warmBg,
    headerText: primary,
    badgeBg: secondary,
    badgeText: textOn(secondary),
    leftBg: '#F8F8FA',
    leftText: primary,
    rightBg: offBg,
    bgName: `Clean White (#F8F8FA)`,
    bgDesc: 'Lascia spazio a foto reali (installazioni, team, prodotti) e fa risultare il contenuto "vero" e pulito. Massima versatilità.',
    accents: [
      {
        bg: secondaryDark,
        text: textOn(secondaryDark),
        name: `Dark Secondary (${secondaryDark})`,
        desc: 'Dà autorevolezza a claim e messaggi di fiducia. Perfetto per headline su slide.',
      },
      {
        bg: secondary,
        text: textOn(secondary),
        name: `${secondaryName} (${secondary})`,
        desc: 'Firma e micro-CTA: "Scopri di più", "Contattaci". Richiamo cromatico del brand.',
      },
    ],
  };

  const promo = {
    type: 'promo',
    label: 'Promo',
    headerBg: primary,
    headerText: textOn(primary),
    badgeBg: accent,
    badgeText: textOn(accent),
    leftBg: secondaryDark,
    leftText: textOn(secondaryDark),
    rightBg: secondaryDarker,
    bgName: `Dark Brand (${secondaryDark})`,
    bgDesc: 'Massimo impatto e serietà. Perfetto per promo "brevi e chiare" con CTA diretta: incentivi, sconti, offerte.',
    accents: [
      {
        bg: '#FFFFFF',
        text: secondaryDark,
        name: 'Bianco Puro (#FFFFFF)',
        desc: 'Per claim e testo: leggibilità immediata su sfondo scuro. Headline e body text sempre in bianco.',
      },
      {
        bg: accent,
        text: textOn(accent),
        name: `${accentName} (${accent})`,
        desc: 'Attira attenzione su prezzo, numero, "Chiama ora". Colore d\'azione per conversioni.',
      },
    ],
  };

  // ── Full swatch list ──
  const swatches = [
    { name: primaryName, hex: primary },
    { name: 'Dark Secondary', hex: secondaryDark },
    { name: 'Mid Tone', hex: midToneDark },
    { name: secondaryName, hex: secondary },
    { name: 'Sky Light', hex: secondaryVeryLight },
    { name: accentName, hex: accent },
    { name: 'Tech White', hex: techWhite },
    { name: 'Bianco Puro', hex: '#FFFFFF' },
  ];

  return {
    palettes: [post, rubrica, carosello, promo],
    swatches,
  };
}

/** Default BR Termitalia preset */
export const PRESET_TERMITALIA = {
  clientName: 'BR Termitalia s.r.l.',
  primary: '#2B1A54',
  primaryName: 'Termitalia Purple',
  secondary: '#2AACE2',
  secondaryName: 'Wave Blue',
  accent: '#F26522',
  accentName: 'Flame Orange',
};

/** Blank starter */
export const PRESET_BLANK = {
  clientName: 'Nome Cliente',
  primary: '#1E3A5F',
  primaryName: 'Primary',
  secondary: '#3B82F6',
  secondaryName: 'Secondary',
  accent: '#F59E0B',
  accentName: 'Accent',
};
