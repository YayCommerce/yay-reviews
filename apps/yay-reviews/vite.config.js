import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
const rootpath = "./src";

// https://vitejs.dev/config/
export default defineConfig({
  root: rootpath,
  plugins: [react(), mkcert()],
  build: {
    manifest: true,
    cssCodeSplit: false,
    emptyOutDir: true,
    assetsDir: "",
    outDir: path.resolve("../../assets/admin", "dist"),
    rollupOptions: {
      input: {
        "main.jsx": path.resolve(__dirname, rootpath, "main.jsx")
      },
      output: {
        assetFileNames: "[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: true,
    cors: true,
    strictPort: true,
    port: 3000,
    hmr: {
      port: 3000,
      host: "localhost",
      // Add line if we don't use https
      // protocol: "ws",
    },
  },
});
