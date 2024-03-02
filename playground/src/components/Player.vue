<script setup lang="ts">
import type { Snapshots } from 'retypewriter'

const { snaps } = defineProps<{
  snaps: Snapshots
}>()

const code = ref('')
const cm = ref()
const playing = ref(false)

async function play() {
  playing.value = true
  code.value = ''
  const setSelection: (index: number) => void = cm.value.cmSetSelection
  for await (const i of snaps.typewriter()) {
    if ('content' in i)
      code.value = i.content
    if ('cursor' in i) {
      nextTick(() => {
        setSelection(i.cursor)
      })
    }
  }
  playing.value = false
}
</script>

<template>
  <div h-screen grid="~ rows-[max-content_1fr]">
    <div border="b base" h-10 flex="~ gap-2 center">
      <button
        flex="~ gap1 center"
        :class="playing ? 'op30' : ''"
        :disabled="playing"
        @click="play"
      >
        <div i-carbon-play /> Play
      </button>
    </div>
    <div overflow-y-auto class="retypewriter-player">
      <CodeMirror
        ref="cm"
        v-model="code"
        :read-only="true"
        min-h-full
        mode="js"
        bg-code px3 py2
      />
    </div>
  </div>
</template>

<style>
.retypewriter-player .CodeMirror-cursors {
  visibility: visible;
}
</style>
