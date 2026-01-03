/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                primary: '#062f96',
                secondary: '#ff7c11',
                accent: '#FF6B6B',
                dark: '#333333',
            },
            borderRadius: {
                'card': '20px',
                'btn': '50px',
            },
        },
    },
    plugins: [],
}
