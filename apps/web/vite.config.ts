import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/** Loads `mindcare/.env` so web + API ports stay in one file. */
export default defineConfig(({ mode }) => {
  const monorepoRoot = path.resolve(__dirname, "../..");
  const env = loadEnv(mode, monorepoRoot, "");
  const webPort = Number(env.VITE_DEV_PORT || 5173);
  const apiPort = env.PORT || "4000";
  const proxyTarget = env.VITE_PROXY_API || `http://127.0.0.1:${apiPort}`;

  return {
    envDir: monorepoRoot,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '127.0.0.1',
      allowedHosts: true,
      cors: true,
      port: webPort,
      strictPort: false,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
