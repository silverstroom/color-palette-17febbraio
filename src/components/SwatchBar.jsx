'use client';
import { useState } from 'react';
import { isLight } from '@/lib/colorUtils';

export default function SwatchBar({ swatches, onDownload }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copy = (hex, idx) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/[0.04]" id="swatch-bar">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-[22px] font-extrabold tracking-tight text-slate-800">
          Palette completa del brand
        </h3>
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-slate-700 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Scarica PNG
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {swatches.map((s, i) => (
          <button
            key={i}
            onClick={() => copy(s.hex, i)}
            className="relative flex items-center gap-3 bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-all cursor-pointer text-left group"
          >
            <div
              className="w-11 h-11 rounded-xl flex-shrink-0 shadow-sm"
              style={{
                background: s.hex,
                border: isLight(s.hex) ? '2px solid #D0D5DD' : '2px solid transparent',
              }}
            />
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-slate-800 truncate">{s.name}</div>
              <div className="font-mono text-[13px] text-slate-400">{s.hex}</div>
            </div>
            {/* Copied toast */}
            <span
              className={`
                absolute -top-2 right-3 bg-slate-800 text-white text-[11px] font-bold
                px-2.5 py-1 rounded-md transition-all duration-200 pointer-events-none
                ${copiedIdx === i ? 'opacity-100 -translate-y-0' : 'opacity-0 translate-y-1'}
              `}
            >
              Copiato!
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
