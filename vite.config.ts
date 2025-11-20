import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file from root directory (where .env is located)
  const rootDir = path.resolve(import.meta.dirname);
  const env = loadEnv(mode, rootDir, '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "client", "src"),
        "@shared": path.resolve(rootDir, "shared"),
        "@assets": path.resolve(rootDir, "attached_assets"),
      },
    },
    root: path.resolve(rootDir, "client"),
    publicDir: path.resolve(rootDir, "public"),
    build: {
      outDir: path.resolve(rootDir, "dist/public"),
      emptyOutDir: true,
    },
    // Explicitly define env vars to ensure they're available
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY || ''),
    },
  };
});
