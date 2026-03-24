import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return (
    <div className="rounded-3xl border border-white/10 bg-glass p-5 shadow-soft backdrop-blur-xl">{children}</div>
  );
}
