import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set base to your repository name for GitHub Pages
    // Change 'f-calculator' to match your actual repository name
    base: '/f-calculator/',
})
