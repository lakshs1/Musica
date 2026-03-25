const required = ['NEXT_PUBLIC_API_BASE_URL'] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}`);
  }
});

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://musica-5wdq.onrender.com/api/v1'
};
