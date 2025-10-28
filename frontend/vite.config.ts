import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true, // 在 WSL 环境下必须启用 polling
      interval: 100, // 检查文件变化的间隔（毫秒）
    },
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },
  },
  optimizeDeps: {
    exclude: [],
    include: ['react', 'react-dom', 'react-router'],
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
});
