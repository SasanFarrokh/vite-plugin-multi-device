import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import multiDevice from 'vite-plugin-multi-device';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), multiDevice()]
})
