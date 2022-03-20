<script setup lang="ts">
import { snaps } from './logics/snaps'
</script>

<template>
  <div font-sans leading-1em>
    <Snapshots :snaps="snaps" />
  </div>
</template>
