import { AliasOptions, defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths"

const resolveOpts = {
    alias: {
      '@data': path.resolve(__dirname, 'data'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@custom_types': path.resolve(__dirname, 'src/types'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@file': path.resolve(__dirname, 'file'),
      '@file_readers': path.resolve(__dirname, 'file/filereaders'),
      '@file_writers': path.resolve(__dirname, 'file/filewriters'),
    }
  }

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          plugins: [],
          build: {
            rollupOptions: {
              external: ['better-sqlite3', 'tesseract.js']
            }
          },
          resolve: resolveOpts
        }
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          plugins: [],
          build: {
            rollupOptions: {
              external: ['better-sqlite3']
            }
          },
          resolve: resolveOpts
        }
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
    // tsconfigPaths()
    
  ],
  resolve: resolveOpts,
  // resolve: {
  //   extensions: [".ts", ".js", ".tsx", ".jsx"],
  //   alias: {
  //     '@components': path.resolve(__dirname, 'src/components'),
  //     '@data': path.resolve(__dirname, 'src/data'),
  //     '@custom_types': path.resolve(__dirname, 'src/types')
  //   } as AliasOptions
  // }
})
