import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      retypewriter: resolve(__dirname, './packages/core/src/index.ts'),
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  // test: {
  //   includeSource: [
  //     'packages/core/src/**/*.ts',
  //   ],
  // },
})
