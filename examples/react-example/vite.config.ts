import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import multiDevice from 'vite-plugin-multi-device';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), multiDevice()]
})
