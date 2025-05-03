import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { imagetools } from 'vite-imagetools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: new URLSearchParams([
        ['format', 'webp;avif;jpg'], // Tenta gerar imagens em formatos modernos
        ['quality', '80'], // Qualidade moderada
        ['progressive', 'true'], // JPEG progressivo
        ['stripExif', 'true'], // Remove metadados EXIF
      ]),
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Celebra Capital',
        short_name: 'Celebra',
        description: 'Plataforma de Pré-Análise de Crédito',
        theme_color: '#0111a2',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Configurações de otimização para build
    cssCodeSplit: true, // Separa o CSS por chunk
    sourcemap: false, // Desabilita para produção
    minify: 'terser', // Usar terser para minificação mais agressiva
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true, // Remove debugger statements
      },
    },
    // Estratégia de chunking para melhor cache e carregamento
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa bibliotecas principais em chunks próprios
          react: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'date-fns'],
          zustand: ['zustand'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          ui: ['@headlessui/react'],
        },
      },
    },
  },
})
