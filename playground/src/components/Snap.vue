<script setup lang="ts">
import type { Snapshot, Snapshots } from 'retypewriter'

const el = $ref<HTMLDivElement>(undefined!)
const props = defineProps<{
  snaps: Snapshots
  snap: Snapshot
  index: number
}>()

let dragHover = $ref<'up' | 'down' | null>()

function getHoverDirection(e: DragEvent) {
  const box = el.getBoundingClientRect()
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

  dragHover = null
}

function allowDrop(e: DragEvent) {
  e.preventDefault()
  dragHover = getHoverDirection(e)
}

function onDrag(e: DragEvent) {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', String(props.index))
}

function onDragExit() {
  dragHover = null
}

const classes = $computed(() => {
  if (!dragHover)
    return
  return [
    dragHover === 'up'
      ? 'border-t-red'
      : 'border-b-red',
  ]
})
</script>

<template>
  <div
    ref="el"
    grid="~ cols-[40px_1fr]"
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
    <div op50 py1>
      [ {{ index + 1 }} ]
    </div>
    <pre
      w-full
      :contenteditable="true"
      border="1 gray"
      p2 font-mono
      spellcheck="false"
      autocomplete="false"
      overflow-x-auto
      v-text="snap.content"
    />
  </div>
</template>
