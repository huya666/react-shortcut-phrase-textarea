import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),dts()],
  build: {
    lib: {
      entry: path.resolve("src", 'components/TextareaCaret/index.tsx'),
      name: 'react-shortcut-phrase-textarea',
      fileName: (format) => `react-shortcut-phrase-textarea.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
})
