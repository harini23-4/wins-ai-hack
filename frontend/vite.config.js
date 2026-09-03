import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',   // only works if C is in the SAME Codespace as you
        changeOrigin: true,
      }
    }
  }
}