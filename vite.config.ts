import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite only emits <link rel="modulepreload"> for statically imported chunks.
 * The 3D scene is a dynamic import so the overlay can paint first, which
 * means its chunks would not start downloading until the main bundle has
 * executed. This injects preload hints for every dynamic chunk and its
 * static dependencies, plus a fetch preload for the model, so all of it is
 * in flight from the moment the HTML parses.
 */
const preloadHeavyAssets = (): Plugin => ({
  name: 'preload-heavy-assets',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return [];
      const tags: { tag: string; attrs: Record<string, string | boolean>; injectTo: 'head' }[] = [];
      const seen = new Set<string>();
      const addChunk = (file: string) => {
        if (seen.has(file)) return;
        seen.add(file);
        tags.push({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, href: '/' + file }, injectTo: 'head' });
        const c = bundle[file];
        if (c && c.type === 'chunk') c.imports.forEach(addChunk);
      };
      for (const [file, out] of Object.entries(bundle)) {
        if (out.type === 'chunk' && out.isDynamicEntry) addChunk(file);
        if (out.type === 'asset' && file.endsWith('.glb')) {
          tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'fetch', crossorigin: 'anonymous', href: '/' + file }, injectTo: 'head' });
        }
      }
      return tags;
    },
  },
});

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss(), preloadHeavyAssets()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
