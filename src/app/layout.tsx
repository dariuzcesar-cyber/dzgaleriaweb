import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dariuz Aceves — Galerías Privadas',
  description: 'Portal privado de galerías virtuales para clientes de Dariuz Aceves.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-obsidian font-sans text-offwhite antialiased">
        {children}
      </body>
    </html>
  );
}
