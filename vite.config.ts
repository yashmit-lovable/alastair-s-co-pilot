// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // We serve this app as a plain static SPA from Express (express.static) in production —
  // there is no Node/Workers server for it, so we disable Nitro entirely and turn on
  // TanStack Start's SPA mode, which prerenders a single static HTML shell (client-side
  // routing only, no per-request SSR) instead of building a deployable server bundle.
  nitro: false,
  tanstackStart: {
    spa: { enabled: true, prerender: { outputPath: "/index.html" } },
  },
});
