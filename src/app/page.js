'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { generatePalettes, PRESET_TERMITALIA, PRESET_BLANK } from '@/lib/paletteEngine';
import { extractColors, autoAssignRoles } from '@/lib/extractColors';
import PaletteCard from '@/components/PaletteCard';
import BrandEditor from '@/components/BrandEditor';
import SwatchBar from '@/components/SwatchBar';

const STORAGE_KEY = 'palette-studio-clients';

export default function Home() {
  const [brand, setBrand] = useState(PRESET_TERMITALIA);
  const [logo, setLogo] = useState(null);
  const [references, setReferences] = useState([]);
  const [savedClients, setSavedClients] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved clients
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedClients(JSON.parse(stored));
    } catch {}
  }, []);

  const persistClients = (clients) => {
    setSavedClients(clients);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)); } catch {}
  };

  const handleSave = () => {
    const toSave = { ...brand, logo: logo || null };
    const existing = savedClients.findIndex(c => c.clientName === brand.clientName);
    let updated;
    if (existing >= 0) {
      updated = [...savedClients];
      updated[existing] = { ...toSave, id: updated[existing].id };
    } else {
      updated = [...savedClients, { ...toSave, id: Date.now().toString() }];
    }
    persistClients(updated);
  };

  const handleLoad = (client) => {
    const { id, logo: savedLogo, ...rest } = client;
    setBrand(rest);
    setLogo(savedLogo || null);
    setReferences([]);
  };

  const handleDelete = (id) => {
    persistClients(savedClients.filter(c => c.id !== id));
  };

  const handleNewClient = () => {
    setBrand(PRESET_BLANK);
    setLogo(null);
    setReferences([]);
  };

  // ── IMAGE UPLOAD + AUTO-ANALYSIS ──

  const runAutoAssign = useCallback(async (refs) => {
    const colorSets = refs.map(r => r.colors).filter(c => c && c.length > 0);
    if (colorSets.length === 0) return;

    const result = autoAssignRoles(colorSets);
    if (result) {
      setBrand(prev => ({
        ...prev,
        primary: result.primary,
        primaryName: result.primaryName,
        secondary: result.secondary,
        secondaryName: result.secondaryName,
        accent: result.accent,
        accentName: result.accentName,
      }));
    }
  }, []);

  const handleAddReference = useCallback(async (src, name) => {
    setIsAnalyzing(true);
    try {
      const colors = await extractColors(src, 10);
      const newRef = { src, name, colors };

      setReferences(prev => {
        const updated = [...prev, newRef];
        // Auto-assign from all references
        setTimeout(() => runAutoAssign(updated), 50);
        return updated;
      });
    } catch (err) {
      console.error('Extraction error:', err);
      setReferences(prev => [...prev, { src, name, colors: [] }]);
    }
    setIsAnalyzing(false);
  }, [runAutoAssign]);

  const handleRemoveReference = useCallback((idx) => {
    setReferences(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length > 0) {
        setTimeout(() => runAutoAssign(updated), 50);
      }
      return updated;
    });
  }, [runAutoAssign]);

  const handleManualAutoGenerate = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Also re-extract from logo if present
      let allRefs = [...references];
      if (logo) {
        try {
          const logoColors = await extractColors(logo, 10);
          allRefs = [{ src: logo, name: 'logo', colors: logoColors }, ...allRefs];
        } catch {}
      }
      await runAutoAssign(allRefs);
    } finally {
      setIsAnalyzing(false);
    }
  }, [references, logo, runAutoAssign]);

  const handleColorPick = useCallback((key, hex) => {
    setBrand(prev => ({ ...prev, [key]: hex }));
  }, []);

  // ── PALETTE GENERATION ──

  const { palettes, swatches } = useMemo(() => {
    if (brand.primary?.length === 7 && brand.secondary?.length === 7 && brand.accent?.length === 7) {
      return generatePalettes(brand);
    }
    return { palettes: [], swatches: [] };
  }, [brand]);

  // ── DOWNLOADS ──

  const downloadCard = useCallback(async (element, filename) => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      scale: 3, useCORS: true, backgroundColor: null, logging: false,
    });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const downloadSwatchBar = useCallback(async () => {
    const el = document.getElementById('swatch-bar');
    if (el) await downloadCard(el, `Palette_Completa_${brand.clientName.replace(/\s+/g, '_')}`);
  }, [downloadCard, brand.clientName]);

  const downloadAll = useCallback(async () => {
    setDownloadingAll(true);
    try {
      const cards = document.querySelectorAll('[data-palette-export]');
      for (const card of cards) {
        const type = card.getAttribute('data-palette-export');
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(card, {
          scale: 3, useCORS: true, backgroundColor: null, logging: false,
        });
        const link = document.createElement('a');
        link.download = `Palette_${type}_${brand.clientName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(r => setTimeout(r, 600));
      }
      await downloadSwatchBar();
    } finally {
      setDownloadingAll(false);
    }
  }, [brand.clientName, downloadSwatchBar]);

  // ── RENDER ──

  return (
    <div className="flex min-h-screen">
      {/* ── SIDEBAR ── */}
      <aside className={`fixed top-0 left-0 h-full z-40 bg-slate-900 border-r border-slate-700/50 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-[360px]' : 'w-0 overflow-hidden'}`}>
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-extrabold text-white tracking-tight">Palette Studio</h1>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">Generatore palette social</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="11 17 6 12 11 7"/><line x1="6" y1="12" x2="18" y2="12"/>
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setBrand(PRESET_TERMITALIA); setLogo(null); setReferences([]); }}
              className="flex-1 text-[12px] font-bold bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 px-3 py-2 rounded-lg transition-all cursor-pointer border border-slate-700/40">
              Demo: Termitalia
            </button>
            <button onClick={handleNewClient}
              className="flex-1 text-[12px] font-bold bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 px-3 py-2 rounded-lg transition-all cursor-pointer border border-slate-700/40">
              + Nuovo cliente
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <BrandEditor
            brand={brand} onChange={setBrand}
            savedClients={savedClients} onSave={handleSave} onLoad={handleLoad} onDelete={handleDelete}
            logo={logo} onLogoChange={setLogo}
            references={references} onAddReference={handleAddReference} onRemoveReference={handleRemoveReference}
            onAutoGenerate={handleManualAutoGenerate} isAnalyzing={isAnalyzing}
          />
        </div>
      </aside>

      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all cursor-pointer border border-slate-700/50">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[360px]' : 'ml-0'}`}>
        {/* Hero */}
        <div className="bg-slate-900 px-8 py-8 lg:px-12">
          <div className="max-w-[1100px]">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                {logo && (
                  <div className="flex-shrink-0 bg-white/10 rounded-xl p-3">
                    <img src={logo} alt="" className="h-[48px] max-w-[160px] object-contain" />
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 mb-3">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"/>
                    <span className="text-[12px] font-bold text-sky-400 uppercase tracking-wider">Live preview</span>
                  </div>
                  <h2 className="text-[32px] lg:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                    {brand.clientName}
                  </h2>
                  <p className="text-slate-400 text-[16px] mt-1 font-medium">
                    4 palette · Post · Rubrica · Carosello · Promo
                  </p>
                </div>
              </div>
              <button onClick={downloadAll} disabled={downloadingAll}
                className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-[15px] px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20">
                {downloadingAll ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                    </svg>
                    Scaricando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Scarica tutte
                  </>
                )}
              </button>
            </div>

            {/* Color dots */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {[
                { hex: brand.primary, name: brand.primaryName },
                { hex: brand.secondary, name: brand.secondaryName },
                { hex: brand.accent, name: brand.accentName },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800/60 rounded-full pl-1.5 pr-4 py-1.5">
                  <div className="w-7 h-7 rounded-full border-2 border-slate-600/40" style={{ background: c.hex }}/>
                  <span className="text-[13px] font-semibold text-slate-300">{c.name}</span>
                </div>
              ))}
            </div>

            {/* Reference thumbnails */}
            {references.length > 0 && (
              <div className="mt-5">
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-2">Riferimenti caricati</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {references.map((ref, idx) => (
                    <img key={idx} src={ref.src} alt={ref.name}
                      className="h-[56px] w-[80px] object-cover rounded-lg border-2 border-slate-700/40 flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="px-8 py-10 lg:px-12">
          <div className="max-w-[1100px]">
            <div className="font-mono text-[12px] font-bold text-sky-500 uppercase tracking-[2.5px] mb-2">Tipologie di contenuto</div>
            <h3 className="text-[26px] font-extrabold text-slate-800 tracking-tight mb-8">Palette per formato</h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
              {palettes.map((p) => (
                <div key={p.type} data-palette-card={p.label}>
                  <PaletteCard palette={p} clientName={brand.clientName} logo={logo} onDownload={downloadCard} />
                </div>
              ))}
            </div>

            <div className="font-mono text-[12px] font-bold text-sky-500 uppercase tracking-[2.5px] mb-2">Riferimento rapido</div>
            <h3 className="text-[26px] font-extrabold text-slate-800 tracking-tight mb-8">Tutti i colori</h3>
            <SwatchBar swatches={swatches} onDownload={downloadSwatchBar} />
          </div>
        </div>
      </main>
    </div>
  );
}
