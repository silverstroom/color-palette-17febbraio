import './globals.css';

export const metadata = {
  title: 'Palette Studio — Generatore Palette Social',
  description: 'Crea palette colore professionali per i social media dei tuoi clienti.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-100 min-h-screen">{children}</body>
    </html>
  );
}
