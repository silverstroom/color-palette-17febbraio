'use client';
import { useRef, useState } from 'react';

export default function PaletteCard({ palette, clientName, logo, onDownload }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(cardRef.current, `Palette_${palette.label}_${clientName.replace(/\s+/g, '_')}`);
    } finally {
      setDownloading(false);
    }
  };

  const isDarkCard = palette.type === 'promo';

  return (
    <div className="group">
      {/* Exportable card area */}
      <div
        ref={cardRef}
        data-palette-export={palette.label}
        className="rounded-2xl overflow-hidden shadow-sm border border-black/[0.04] transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ background: palette.headerBg }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {logo && (
              <img
                src={logo}
                alt=""
                className="h-[36px] max-w-[120px] object-contain flex-shrink-0"
                style={{
                  filter: palette.type === 'promo' || palette.type === 'rubrica'
                    ? 'brightness(0) invert(1)' : 'none'
                }}
              />
            )}
            <span
              className="text-[22px] font-extrabold tracking-tight truncate"
              style={{ color: palette.headerText }}
            >
              {clientName}
            </span>
          </div>
          <span
            className="font-mono text-[13px] font-bold uppercase tracking-wider px-5 py-1.5 rounded-lg flex-shrink-0 ml-3"
            style={{ background: palette.badgeBg, color: palette.badgeText }}
          >
            {palette.label}
          </span>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2">
          {/* Left */}
          <div className="p-8" style={{ background: palette.leftBg, color: palette.leftText }}>
            <div className="font-mono text-[12px] font-bold uppercase tracking-[2.5px] opacity-50 mb-2">
              Sfondo dominante
            </div>
            <div className="text-[20px] font-extrabold tracking-tight mb-4">
              {palette.bgName}
            </div>
            <div className="text-[15px] leading-relaxed opacity-80 font-medium">
              {palette.bgDesc}
            </div>
          </div>

          {/* Right */}
          <div className="p-6 flex flex-col gap-4" style={{ background: palette.rightBg }}>
            {palette.accents.map((acc, i) => (
              <div
                key={i}
                className="rounded-xl p-6 flex-1 flex flex-col justify-center"
                style={{ background: acc.bg, color: acc.text }}
              >
                <div className="text-[17px] font-extrabold tracking-tight mb-2">
                  {acc.name}
                </div>
                <div className="text-[14px] leading-relaxed opacity-85 font-medium">
                  {acc.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download bar - outside exportable area */}
      <div
        className={`
          flex items-center justify-between px-8 py-3 rounded-b-2xl -mt-1
          ${isDarkCard
            ? 'bg-slate-800/60 border border-white/[0.06]'
            : 'bg-white/60 border border-black/[0.04]'
          }
          backdrop-blur-sm
        `}
      >
        <span className={`text-[13px] font-semibold ${isDarkCard ? 'text-white/40' : 'text-slate-400'}`}>
          Esporta questa palette
        </span>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`
            inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold
            transition-all duration-150 cursor-pointer disabled:opacity-50
            ${isDarkCard
              ? 'bg-sky-500 text-white hover:bg-sky-400'
              : 'bg-slate-800 text-white hover:bg-slate-700'
            }
          `}
        >
          {downloading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              PNG 3×
            </>
          )}
        </button>
      </div>
    </div>
  );
}
