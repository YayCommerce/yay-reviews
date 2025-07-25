import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import pluginExternal from 'vite-plugin-external';

process.env = { ...process.env, ...loadEnv(process.env.mode || 'development', process.cwd()) };

const terserOptions = {
  output: {
    comments: /translators:/i,
  },
  compress: {
    passes: 2,
  },
  mangle: {
    reserved: ['__', '_n', '_nx', '_x'],
  },
};

const externalOptions = {
  interop: 'auto',

  development: {
    externals: {
      '@wordpress/hooks': 'wp.hooks',
      '@wordpress/i18n': 'wp.i18n',
    },
  },

  production: {
    externals: {
      '@wordpress/hooks': 'wp.hooks',
      '@wordpress/i18n': 'wp.i18n',
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-dom/client': 'ReactDOM',
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  define: {
    __IS_PRO__: true,
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
    tailwindcss(),
    pluginExternal(externalOptions),
    // visualizer({ template: 'network', emitFile: true, filename: 'stats.html' }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: terserOptions,
    manifest: false,
    emptyOutDir: true,
    outDir: path.resolve('../../assets/admin', 'dist'),
    // assetsDir: 'assets',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'main.css';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
      plugins: [
        // analyze({ summaryOnly: true, limit:10 }),
      ],
    },
  },
  server: {
    cors: true,
    strictPort: true,
    port: 3001,
    origin: `${process.env.VITE_SERVER_ORIGIN}`,
    hmr: {
      port: 3001,
      host: 'localhost',
      protocol: 'ws',
    },
  },
});
