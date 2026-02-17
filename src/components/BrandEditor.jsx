'use client';
import { LogoUploader, ReferenceUploader } from './ImageUploader';

export default function BrandEditor({
  brand, onChange,
  savedClients, onSave, onLoad, onDelete,
  logo, onLogoChange,
  references, onAddReference, onRemoveReference,
  onAutoGenerate, isAnalyzing,
}) {
  const update = (key, value) => onChange({ ...brand, [key]: value });
  const handleColorPick = (key, hex) => update(key, hex);

  const colorFields = [
    { colorKey: 'primary', nameKey: 'primaryName', label: 'Primario' },
    { colorKey: 'secondary', nameKey: 'secondaryName', label: 'Secondario' },
    { colorKey: 'accent', nameKey: 'accentName', label: 'Accento' },
  ];

  return (
    <div className="space-y-6">
      <LogoUploader logo={logo} onLogoChange={onLogoChange} />

      <div>
        <label className="block text-[12px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">Nome cliente</label>
        <input type="text" value={brand.clientName} onChange={(e) => update('clientName', e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-600/40 rounded-xl px-4 py-3 text-white text-[16px] font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
          placeholder="Es. BR Termitalia s.r.l." />
      </div>

      {/* References */}
      <ReferenceUploader
        references={references}
        onAddReference={onAddReference}
        onRemoveReference={onRemoveReference}
        onColorPick={handleColorPick}
      />

      {/* Auto-generate button */}
      {references.length > 0 && (
        <button onClick={onAutoGenerate} disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-[14px] px-4 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-500/20">
          {isAnalyzing ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
              </svg>
              Analizzando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Rigenera palette dai riferimenti
            </>
          )}
        </button>
      )}

      {/* Color pickers */}
      <div className="space-y-4">
        <label className="block text-[12px] font-bold uppercase tracking-[2px] text-slate-400">Colori del brand</label>
        {colorFields.map(({ colorKey, nameKey, label }) => (
          <div key={colorKey} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <input type="color" value={brand[colorKey]}
                onChange={(e) => update(colorKey, e.target.value.toUpperCase())}
                className="w-12 h-12 rounded-xl border-2 border-slate-600/40 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none" />
            </div>
            <div className="flex-1 space-y-1.5">
              <input type="text" value={brand[nameKey]} onChange={(e) => update(nameKey, e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-600/30 rounded-lg px-3 py-1.5 text-white text-[14px] font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all"
                placeholder={label} />
              <input type="text" value={brand[colorKey]}
                onChange={(e) => {
                  let v = e.target.value.toUpperCase();
                  if (v && !v.startsWith('#')) v = '#' + v;
                  if (/^#[0-9A-F]{0,6}$/.test(v)) update(colorKey, v);
                }}
                className="w-full bg-slate-800/40 border border-slate-600/30 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-[13px] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all"
                placeholder="#000000" />
            </div>
          </div>
        ))}
      </div>

      {/* Save / Load */}
      <div className="pt-2 border-t border-slate-700/50 space-y-3">
        <button onClick={onSave}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-[14px] px-4 py-3 rounded-xl transition-all cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Salva configurazione
        </button>

        {savedClients.length > 0 && (
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-[2px] text-slate-500">Configurazioni salvate</label>
            {savedClients.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-slate-800/40 rounded-lg p-2 group/item">
                {c.logo && <img src={c.logo} alt="" className="w-6 h-6 rounded object-contain bg-white/10 flex-shrink-0" />}
                <button onClick={() => onLoad(c)}
                  className="flex-1 text-left px-2 py-1 text-[14px] text-slate-300 font-semibold hover:text-white transition-colors cursor-pointer truncate">
                  {c.clientName}
                </button>
                <div className="flex gap-1">
                  <div className="w-5 h-5 rounded-md border border-slate-600/40" style={{ background: c.primary }} />
                  <div className="w-5 h-5 rounded-md border border-slate-600/40" style={{ background: c.secondary }} />
                  <div className="w-5 h-5 rounded-md border border-slate-600/40" style={{ background: c.accent }} />
                </div>
                <button onClick={() => onDelete(c.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 cursor-pointer" title="Elimina">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
