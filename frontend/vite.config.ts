import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// 引入这个库，虽然这次不一定用它，但保证配置的完整性
import { nodeResolve } from '@rollup/plugin-node-resolve'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [
        nodeResolve({
          browser: true,
          preferBuiltins: false
        })
      ],
      // 仍然保持 external，告诉 Rollup 这是外部库
      external: [
        '@supabase/supabase-js', 
        '@supabase/auth-ui-react'
      ],
    },
  },
  // ⬇️⬇️⬇️ 关键新增：强制 Vite 预编译这些依赖 ⬇️⬇️⬇️
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react'
    ]
  }
  // ⬆️⬆️⬆️ 关键新增：强制 Vite 预编译这些依赖 ⬆️⬆️⬆️
});
