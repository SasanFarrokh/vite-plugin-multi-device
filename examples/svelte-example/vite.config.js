import { defineConfig } from 'vite'
import svelte from '@sveltejs/vite-plugin-svelte'
import multiDevice from 'vite-plugin-multi-device';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), multiDevice()]
})
