import { fileURLToPath, URL } from 'node:url'
import squooshPlugin from 'vite-plugin-squoosh'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), squooshPlugin({
    codecs: {
      mozjpeg: {
        quality: 10
      },
      webp: {
        quality: 10
      },
    },
    encodeTo: [
      { from: /.(png)$/, to: "webp"}
    ],
    includeDirs: [
      { from: "./public", to: "./compressed"}
    ],
    cacheLevel: "Persistent"
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
