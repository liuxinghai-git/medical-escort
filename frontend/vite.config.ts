import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⬇️⬇️⬇️ 注意：这里删除了所有的 rollupOptions 和 external 配置 ⬇️⬇️⬇️
  // 我们只保留最基础的配置，相信 Vite 能正确打包
  build: {
    outDir: 'dist',
  }
})
