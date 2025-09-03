import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path" // Make sure to import path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/src": path.resolve(__dirname, "./src"),
      "@/types": path.resolve(__dirname, "./@types")
    },
    server: {
      port: 5173,
      host: true
    }
  },
  optimizeDeps: {
    include: ["pdfjs-dist"]
  },
  assetsInclude: ["**/*.wasm"],
  define: {
    global: "globalThis"
  }
})
