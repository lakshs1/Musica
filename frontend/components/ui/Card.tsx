import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="minimal-card">{children}</div>;
}
