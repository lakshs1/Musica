import Image from 'next/image';

export function AppLogo({ size = 40, showWordmark = false }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        style={{ width: size, height: size }}
      >
        <Image src="/icon.svg" alt="Musica logo" fill className="object-cover" priority />
      </div>
      {showWordmark ? <span className="text-2xl tracking-tight text-[#f6f8fc]">Musica</span> : null}
    </div>
  );
}
