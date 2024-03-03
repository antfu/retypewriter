<script setup lang="ts">
import type { Snapshot, Snapshots } from 'retypewriter'

const props = defineProps<{
  snaps: Snapshots
  snap: Snapshot
  index: number
}>()
const el = ref<HTMLDivElement>(undefined!)
let dragHover = ref<'up' | 'down' | null>()

function getHoverDirection(e: DragEvent) {
  const box = el.value.getBoundingClientRect()
  const y = e.clientY - box.top
  const h = box.height
  const mid = h / 2
  return y < mid ? 'up' : 'down'
}

function onDrop(e: DragEvent) {
  const from = +(e.dataTransfer!.getData('text/plain') || -1)
  const direction = getHoverDirection(e)
  const to = props.index + (direction === 'up' ? 0 : 1)
  props.snaps.move(from, to)

  dragHover.value = null
}

function allowDrop(e: DragEvent) {
  e.preventDefault()
  dragHover.value = getHoverDirection(e)
}

function onDrag(e: DragEvent) {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', String(props.index))
}

function onDragExit() {
  dragHover.value = null
}

const classes = computed(() => {
  if (!dragHover)
    return
  return [
    dragHover.value === 'up' ? 'border-t-red' : 'border-b-red',
  ]
})
</script>

<template>
  <div
    ref="el"
    grid="~ cols-[20px_1fr]"
    draggable="true"
    bg-base p2 mb--2px
    border="2 transparent"
    :class="classes"
    @dragstart="onDrag"
    @drag="onDrag"
    @dragover="allowDrop"
    @dragexit="onDragExit"
    @dragleave="onDragExit"
    @drop="onDrop"
  >
    <div op30 py1 text-sm cursor-grab>
      {{ index + 1 }}
    </div>
    <CodeMirror
      border="1 base rounded"
      bg-code p1
      :model-value="snap.content"
      scrollbar-style="null"
      mode="js"
    />
  </div>
</template>
