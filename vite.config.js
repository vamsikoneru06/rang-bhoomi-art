import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Local library paths (machine-specific)
const GSAP_ESM = 'C:/Users/koner/Downloads/gsap-public/gsap-public/esm';
const THREE_MODULE = 'C:/Users/koner/Downloads/three.js-master/three.js-master/build/three.module.js';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // gsap/PluginName → local esm plugin file
      {
        find: /^gsap\/(.+)$/,
        replacement: `${GSAP_ESM}/$1.js`,
      },
      // gsap (bare) → local esm index
      {
        find: 'gsap',
        replacement: `${GSAP_ESM}/index.js`,
      },
      // three → local module build
      {
        find: 'three',
        replacement: THREE_MODULE,
      },
    ],
  },
  optimizeDeps: {
    // Tell Vite not to pre-bundle these local aliases
    exclude: ['gsap', 'three'],
  },
});
