import Image from 'next/image';

export default function GalleryFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 border-t border-glassborder px-4 py-10 text-center">
      <Image
        src="/perfildz.jpg"
        alt="Dariuz Aceves"
        width={48}
        height={48}
        className="rounded-full border border-glassborder object-cover"
      />
      <p className="font-display text-sm text-offwhite">Dariuz Aceves</p>
      <p className="text-xs text-white/40">Fotografía profesional · Galerías privadas</p>
    </footer>
  );
}
