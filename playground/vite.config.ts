import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import rootConfig from '../vitest.config'

export default defineConfig({
  ...rootConfig,
  plugins: [
    Vue({
      reactivityTransform: true,
    }),
    UnoCSS({
      configFile: resolve(__dirname, 'unocss.config.ts'),
    }),
    Inspect(),
    Components({
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        'vue/macros',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
})
