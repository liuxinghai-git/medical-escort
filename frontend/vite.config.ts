import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodeResolve } from '@rollup/plugin-node-resolve'; // 引入这个库，解决 Node.js 模块导入问题

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ⬇️⬇️⬇️ 关键修改在这里 ⬇️⬇️⬇️
    rollupOptions: {
      plugins: [
        // 这行可以帮助 Rollup 找到 node_modules 里的路径
        nodeResolve({
          browser: true,
          preferBuiltins: false
        })
      ],
      // 告诉 Rollup 不要打包这两个库，让浏览器自己处理 (这是最终解决方案)
      external: [
        '@supabase/supabase-js', 
        '@supabase/auth-ui-react'
      ],
    },
    // ⬆️⬆️⬆️ 关键修改在这里 ⬆️⬆️⬆️
  },
})
