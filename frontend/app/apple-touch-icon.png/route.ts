import { createPwaIconResponse } from '@/lib/pwa-icon';

export function GET() {
  return createPwaIconResponse(180);
}
