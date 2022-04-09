import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-[#121212]',
      'bg-code': 'bg-[#fdfdfd] dark:bg-[#222]',
      'border-base': 'border-gray-400:20',
    },
    [/^(flex|grid)-center/g, () => 'justify-center items-center'],
    [/^(flex|grid)-x-center/g, () => 'justify-center'],
    [/^(flex|grid)-y-center/g, () => 'items-center'],
  ],
  presets: [
    presetAttributify(),
    presetIcons(),
    presetUno(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'IBM Plex Mono',
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
