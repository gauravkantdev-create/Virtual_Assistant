import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'block-service-worker',
      configureServer(server) {
        server.middlewares.use('/sw.js', (req, res) => {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Service Worker blocked');
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    // Fix dependency optimization issues
    force: false,
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'axios', 
      'framer-motion',
      'react-icons/io5'
    ],
    exclude: []
  },
  esbuild: {
    // Ensure proper target for modern browsers
    target: 'es2020'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'framer-motion']
        },
      },
    },
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false
  },
  clearScreen: false,
  logLevel: 'info'
})
