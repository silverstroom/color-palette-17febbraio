# Palette Studio

Generatore di palette colore professionali per post social. Crea configurazioni personalizzate per ogni cliente con anteprima live e download in alta definizione.

## Funzionalità

- **Generatore automatico** — Inserisci 3 colori brand e ottieni 4 palette (Post, Rubrica, Carosello, Promo)
- **Download HD** — Esporta ogni singola palette o tutte insieme in PNG 3×
- **Copia HEX** — Click su qualsiasi colore per copiare il codice
- **Salva clienti** — Salva e ricarica configurazioni per diversi clienti
- **Preset demo** — Configurazione BR Termitalia inclusa come esempio

## Deploy su Vercel

### Opzione 1: Da GitHub

1. Carica questa cartella su un nuovo repository GitHub
2. Vai su [vercel.com/new](https://vercel.com/new)
3. Importa il repository
4. Clicca **Deploy** — Vercel rileva automaticamente Next.js

### Opzione 2: Con Vercel CLI

```bash
npm i -g vercel
cd palette-studio
vercel
```

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## Stack

- **Next.js 14** — App Router
- **Tailwind CSS** — Styling
- **html2canvas** — Export PNG ad alta risoluzione

## Struttura

```
palette-studio/
├── src/
│   ├── app/
│   │   ├── layout.js        # Root layout
│   │   ├── page.js          # Pagina principale
│   │   └── globals.css      # Stili globali + Tailwind
│   ├── components/
│   │   ├── PaletteCard.jsx   # Card singola palette
│   │   ├── BrandEditor.jsx   # Editor colori brand
│   │   └── SwatchBar.jsx     # Barra swatches completa
│   └── lib/
│       ├── paletteEngine.js  # Logica generazione palette
│       └── colorUtils.js     # Utility colori HSL/HEX
├── package.json
├── next.config.mjs
├── tailwind.config.js
└── postcss.config.js
```
