export default {
  // content is auto with @tailwindcss/vite, but it's fine to be explicit:
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0f5132',   // page background
          table: '#2d5a3d',   // panels/table felt
          yellow: '#ffc107',  // current turn highlight
          dealer: '#ff0000',  // dealer border
        },
      },
      boxShadow: {
        table: '0 8px 24px rgba(0,0,0,0.25)',
        soft: '0 4px 12px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}
