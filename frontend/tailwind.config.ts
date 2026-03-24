import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f1a',
        glass: 'rgba(255,255,255,0.08)'
      },
      boxShadow: {
        soft: '0 20px 45px rgba(10,12,20,0.2)'
      },
      backgroundImage: {
        'apple-gradient': 'linear-gradient(130deg, #111827 0%, #1f2937 45%, #312e81 100%)'
      }
    }
  },
  plugins: []
};

export default config;
