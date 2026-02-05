import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 强制指向 node_modules，防止 Cloudflare 找不到路径
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 强制预构建这些依赖，解决兼容性问题
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@supabase/auth-ui-react'],
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      // 允许 CommonJS 和 ESM 混合使用，增加容错率
      transformMixedEsModules: true,
    },
  }
})
