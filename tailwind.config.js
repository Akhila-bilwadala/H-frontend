/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"IBM Plex Mono"', '"JetBrains Mono"', '"Courier New"', 'monospace'],
            },
            colors: {
                background: '#000000',
                stage: '#050505',
                borderDark: '#2a2a2a',
                borderLight: '#1c1c1c',
                textLight: '#e4e4e0',
                textMuted: '#999999',
                textDark: '#666666',
                primary: '#f2f2ef',
                critical: '#ff3b30',
                warning: '#ffb000',
                healthy: '#4ade80',
                info: '#4d9eff',
            }
        },
    },
    plugins: [],
}
