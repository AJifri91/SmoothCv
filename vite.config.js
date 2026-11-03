import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works under a GitHub Pages subpath.
export default defineConfig({ plugins: [react()], base: './' });
