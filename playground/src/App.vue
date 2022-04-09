<script setup lang="ts">
import { snaps } from './logics/snaps'
</script>

<template>
  <div font-sans leading-1em grid="~ cols-2">
    <Snapshots :snaps="snaps" />
    <Player :snaps="snaps" border="l base" />
  </div>
</template>
