<script setup lang="ts">
import type { Snapshots } from 'retypewriter'

const container = $ref<HTMLDivElement>(undefined!)
const { snaps } = defineProps<{
  snaps: Snapshots
}>()
</script>

<template>
  <div
    ref="container"
    flex="~ col" p4
  >
    <Snap
      v-for="(snap, idx) of snaps"
      :key="idx"
      :snaps="snaps"
      :snap="snap"
      :index="idx"
    />
  </div>
</template>
