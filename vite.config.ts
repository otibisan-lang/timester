import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * vite-plugin-singlefile のあと、インライン JS が head に残ると
 * `createRoot(document.getElementById('root'))` が body より先に走り白画面になる。
 * `file://` で開く前提でも確実にマウントできるよう、`</body>` 直前へ移す。
 */
function singlefileInlineScriptToBody(): Plugin {
  return {
    name: 'singlefile-inline-script-to-body',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.html')) continue;
        let html = String(chunk.source);
        const open = '<script type="module">';
        const start = html.indexOf(open);
        if (start === -1) continue;
        const close = html.indexOf('</script>', start);
        if (close === -1) continue;
        let block = html.slice(start, close + '</script>'.length);
        // `file://` で開くと環境によっては type="module" のインラインが動かないことがある
        block = block.replace('<script type="module">', '<script>');
        html = html.slice(0, start) + html.slice(close + '</script>'.length);
        const bodyEnd = html.lastIndexOf('</body>');
        if (bodyEnd === -1) continue;
        html = html.slice(0, bodyEnd) + `    ${block}\n  ` + html.slice(bodyEnd);
        chunk.source = html;
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile({ removeViteModuleLoader: true }),
      singlefileInlineScriptToBody(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
