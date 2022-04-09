<script setup lang="ts">
import { snaps } from './logics/snaps'
</script>

<template>
  <div font-sans leading-1em grid="~ cols-2">
    <Snapshots :snaps="snaps" />
    <div border="l base" />
  </div>
</template>
