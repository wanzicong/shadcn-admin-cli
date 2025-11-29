import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
     plugins: [
          tanstackRouter({
               target: 'react',
               autoCodeSplitting: true,
               // 路由文件夹配置（可选，优先使用 tsr.config.json）
               // 使用 ./src/develop
               // routesDirectory: './src/routes',
               // generatedRouteTree: './src/routeTree.gen.ts',
          }),
          react(),
          tailwindcss(),
     ],
     resolve: {
          alias: {
               '@': path.resolve(__dirname, './src'),
          },
     },
     server: {
          port: 3000,
          open: true,
          cors: true,
          proxy: {
               '/api': {
                    target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
               },
          },
     },
})
