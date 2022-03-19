
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    includeSource: [
      'packages/core/src/**/*.ts',
    ],
  },
})
