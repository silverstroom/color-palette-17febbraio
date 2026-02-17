'use client';
import { useRef, useState } from 'react';
import { isLight } from '@/lib/colorUtils';

/* ─────────── LOGO UPLOADER ─────────── */
export function LogoUploader({ logo, onLogoChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLogoChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-[12px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">
        Logo del cliente
      </label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {logo ? (
        <div className="relative group">
          <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 flex items-center justify-center min-h-[80px]">
            <img src={logo} alt="Logo" className="max-h-[64px] max-w-full object-contain" />
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
              Sostituisci
            </button>
            <button onClick={() => onLogoChange(null)} className="bg-red-500/30 hover:bg-red-500/50 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
              Rimuovi
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full border-2 border-dashed border-slate-600/50 hover:border-sky-500/50 rounded-xl p-5 flex flex-col items-center gap-2 text-slate-400 hover:text-sky-400 transition-all cursor-pointer group">
          <svg className="w-8 h-8 opacity-50 group-hover:opacity-80 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span className="text-[13px] font-semibold">Carica logo</span>
          <span className="text-[11px] opacity-60">PNG, SVG, JPG</span>
        </button>
      )}
    </div>
  );
}


/* ─────────── REFERENCE IMAGES UPLOADER ─────────── */
export function ReferenceUploader({ references, onAddReference, onRemoveReference, onColorPick }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onAddReference(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-[12px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">
        Riferimenti visivi
      </label>
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
        Carica logo, post social, grafiche esistenti. I colori vengono estratti e la palette si rigenera automaticamente.
      </p>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

      {references.length > 0 && (
        <div className="space-y-3 mb-3">
          {references.map((ref, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-600/30 rounded-xl overflow-hidden">
              <div className="relative group/img">
                <img src={ref.src} alt={ref.name} className="w-full h-[120px] object-cover" />
                <button
                  onClick={() => onRemoveReference(idx)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <span className="text-[11px] text-white/80 font-medium truncate block">{ref.name}</span>
                </div>
              </div>

              {ref.colors && ref.colors.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500 mb-2">
                    Colori estratti — clicca per assegnare
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ref.colors.map((c, ci) => (
                      <ColorChip key={ci} hex={c.hex || c} onPick={onColorPick} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => inputRef.current?.click()} className="w-full border-2 border-dashed border-slate-600/50 hover:border-sky-500/50 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-sky-400 transition-all cursor-pointer text-[13px] font-semibold">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {references.length > 0 ? 'Aggiungi altri riferimenti' : 'Carica riferimenti'}
      </button>
    </div>
  );
}


/* ─────────── COLOR CHIP ─────────── */
function ColorChip({ hex, onPick }) {
  const [showMenu, setShowMenu] = useState(false);
  const actualHex = typeof hex === 'string' ? hex : hex?.hex || '#000000';
  const light = isLight(actualHex);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all cursor-pointer hover:scale-105 border"
        style={{
          background: actualHex,
          color: light ? '#1a1a2e' : '#ffffff',
          borderColor: light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
        }}
      >
        <span className="font-mono">{actualHex}</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600/50 rounded-xl shadow-2xl p-2 z-50 min-w-[160px]">
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 px-2 py-1 mb-1">
              Assegna a
            </div>
            {[
              { key: 'primary', label: 'Primario' },
              { key: 'secondary', label: 'Secondario' },
              { key: 'accent', label: 'Accento' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => { onPick(key, actualHex); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-200 hover:bg-slate-700/60 transition-all cursor-pointer flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: actualHex }}/>
                {label}
              </button>
            ))}
            <div className="border-t border-slate-700/50 mt-1 pt-1">
              <button onClick={() => { navigator.clipboard.writeText(actualHex); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-all cursor-pointer">
                Copia HEX
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
