import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Image src="/dzlogo.png" alt="Dariuz Aceves" width={120} height={120} priority />
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-offwhite sm:text-4xl">
          Portal Privado de Galerías
        </h1>
        <p className="mx-auto max-w-md text-sm text-white/60 sm:text-base">
          Este espacio está reservado para clientes con un enlace de galería y para el
          administrador del estudio.
        </p>
      </div>
      <Link
        href="/admin"
        className="rounded-full border border-gold/40 bg-glass px-6 py-3 text-sm font-medium text-gold transition hover:border-gold hover:shadow-gold"
      >
        Acceso Administrador
      </Link>
    </main>
  );
}
