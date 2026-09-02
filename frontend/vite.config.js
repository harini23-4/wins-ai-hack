import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server to 0.0.0.0 for Codespaces
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
});