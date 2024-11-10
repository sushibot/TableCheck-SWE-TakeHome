import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL, // Backend server URL
          changeOrgin: true,
          rewrite: (path) => path.replace(/^\/api/, ""), // Remove "/api" prefix
        },
      },
    },
  };
});
