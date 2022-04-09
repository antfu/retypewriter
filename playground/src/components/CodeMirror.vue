<script setup lang="ts">
import { useCodeMirror } from '../logics/codemirror'

const emit = defineEmits<{ (input: any): void }>()
const props = withDefaults(
  defineProps<{
    modelValue: string
    mode?: string
    readOnly?: boolean
    scrollbarStyle?: 'native' | 'null'
  }>(),
  { scrollbarStyle: 'native' },
)

const modeMap: Record<string, any> = {
  html: 'htmlmixed',
  vue: 'htmlmixed',
  svelte: 'htmlmixed',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: { name: 'javascript', typescript: true },
  mts: { name: 'javascript', typescript: true },
  cts: { name: 'javascript', typescript: true },
  jsx: { name: 'javascript', jsx: true },
  tsx: { name: 'javascript', typescript: true, jsx: true },
}

const el = ref<HTMLTextAreaElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

const cm = ref<CodeMirror.Editor>()

defineExpose({ cm })

onMounted(async() => {
  cm.value = useCodeMirror(el, input, {
    ...props,
    mode: modeMap[props.mode || ''] || props.mode,
  })
  cm.value.setSize('100%', '100%')

  setTimeout(() => cm.value!.refresh(), 100)
})
</script>

<template>
  <div font-mono text-sm>
    <textarea ref="el" />
  </div>
</template>

<style>
.CodeMirror {
  height: 100% !important;
  width: 100% !important;
  font-family: inherit;
}

.cm-s-vars .cm-tag {
  color: var(--cm-keyword);
}

:root {
  --cm-font-family: 'Fira Code', monospace;
  --cm-foreground: #393a3480;
  --cm-background: transparent;
  --cm-comment: #a0ada0;
  --cm-string: #b56959;
  --cm-literal: #2f8a89;
  --cm-number: #296aa3;
  --cm-keyword: #1c6b48;
  --cm-function: #6c7834;
  --cm-boolean: #1c6b48;
  --cm-constant: #a65e2b;
  --cm-deleted: #a14f55;
  --cm-class: #2993a3;
  --cm-builtin: #ab5959;
  --cm-property: #b58451;
  --cm-namespace: #b05a78;
  --cm-punctuation: #8e8f8b;
  --cm-decorator: #b77171;
  --cm-regex: #ab5e3f;
  --cm-json-property: #698c96;
  --cm-selection-background: #88888820;
}

html.dark {
  --cm-scheme: dark;
  --cm-foreground: #d4cfbf80;
  --cm-background: transparent;
  --cm-comment: #758575;
  --cm-string: #d48372;
  --cm-literal: #429988;
  --cm-keyword: #4d9375;
  --cm-boolean: #1c6b48;
  --cm-number: #6394bf;
  --cm-variable: #c2b36e;
  --cm-function: #a1b567;
  --cm-deleted: #a14f55;
  --cm-class: #54b1bf;
  --cm-builtin: #e0a569;
  --cm-property: #dd8e6e;
  --cm-namespace: #db889a;
  --cm-punctuation: #858585;
  --cm-decorator: #bd8f8f;
  --cm-regex: #ab5e3f;
  --cm-json-property: #6b8b9e;
  --cm-line-number: #888888;
  --cm-line-number-gutter: #eeeeee;
  --cm-line-highlight-background: #444444;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #222;
  --cm-ttc-c-track: #111;
}
</style>
