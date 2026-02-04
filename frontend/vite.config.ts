import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ⬇️⬇️⬇️ 关键修改在这里 ⬇️⬇️⬇️
    rollupOptions: {
      external: [
        '@supabase/supabase-js', // 告诉 Rollup 不要打包这个模块
      ],
    },
    // ⬆️⬆️⬆️ 关键修改在这里 ⬆️⬆️⬆️
  },
})
