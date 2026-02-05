import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 删掉所有 rollupOptions，只保留 optimizeDeps
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react'
    ]
  }
})
