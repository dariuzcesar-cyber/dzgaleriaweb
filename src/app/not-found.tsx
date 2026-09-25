import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Image src="/dzlogo.png" alt="Dariuz Aceves" width={72} height={72} />
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-offwhite">
          Galería no encontrada
        </h1>
        <p className="text-sm text-white/55">
          El enlace que buscas no existe o ya no está disponible.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full border border-gold/40 bg-glass px-6 py-3 text-sm font-medium text-gold transition hover:border-gold hover:shadow-gold"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
