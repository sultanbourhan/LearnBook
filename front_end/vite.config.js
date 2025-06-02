import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Awesome App',
        short_name: 'AwesomeApp',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
theme_color: '#f0edf5',
        description: 'An interactive web application that works like a real application!',
        icons: [
          {
            src: 'icons/icon-256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    }
  },
});
