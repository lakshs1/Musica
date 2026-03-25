const required = [
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_YOUTUBE_API_KEY'
] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}`);
  }
});

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  youtubeApiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? ''
};
