<script setup lang="ts">
import type { Snapshots } from 'retypewriter'

const { snaps } = defineProps<{
  snaps: Snapshots
}>()

const mode = ref<'editor' | 'raw'>('editor')
const raw = computed<string>({
  get() {
    return snaps.toString()
  },
  set(v) {
    snaps.fromString(v)
  },
})
</script>

<template>
  <div h-screen grid="~ rows-[max-content_1fr]">
    <div border="b base" h-10 flex="~ gap-2 center">
      <button
        px4 py2 :class="mode === 'editor' ? '': 'op50'"
        @click="mode = 'editor'"
      >
        Editor
      </button>
      <button
        px4 py2 :class="mode === 'raw' ? '': 'op50'"
        @click="mode = 'raw'"
      >
        Plain
      </button>
    </div>
    <div overflow-y-auto>
      <div
        v-if="mode === 'editor'"
        flex="~ col" p2
      >
        <Snap
          v-for="(snap, idx) of snaps"
          :key="idx"
          :snaps="snaps"
          :snap="snap"
          :index="idx"
        />
      </div>
      <div v-else>
        <CodeMirror
          v-model="raw"
          mode="js"
          bg-code px3 py2
        />
      </div>
    </div>
  </div>
</template>
