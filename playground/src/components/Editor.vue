<script setup lang="ts">
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
import { isDark } from '../logics/dark'
import { version } from '../../../package.json'

const loading = ref(true)
const TITLE_HEIGHT = 34
const { height: vh } = useWindowSize()
const titleHeightPercent = computed(() => TITLE_HEIGHT / vh.value * 100)

const inputHTML = ref('')
const panel = ref()

const panelSizes = useStorage<number[]>('unocss-panel-sizes', [
  100 - titleHeightPercent.value * 2,
  titleHeightPercent.value,
  titleHeightPercent.value,
], localStorage, { listenToStorageChanges: false })

function handleResize(event: ({ size: number })[]) {
  panelSizes.value = event.map(({ size }) => size)
}
function isCollapsed(index: number) {
  return panelSizes.value[index] <= titleHeightPercent.value + 3
}
function togglePanel(index: number) {
  if (isCollapsed(index))
    panelSizes.value[index] = 100 / panelSizes.value.length
  else
    panelSizes.value[index] = titleHeightPercent.value

  normalizePanels()
}
function normalizePanels() {
  const ignoredIndex: number[] = []
  let originalSum = 0
  let ignoredSum = 0

  panelSizes.value.forEach((v, idx) => {
    if (v <= titleHeightPercent.value) {
      ignoredIndex.push(idx)
      ignoredSum += v
    }
    else {
      originalSum += v
    }
  })

  const resize = (100 - ignoredSum) / originalSum

  panelSizes.value.forEach((v, idx) => {
    if (ignoredIndex.includes(idx))
      return
    panelSizes.value[idx] *= resize
  })
}
</script>

<template>
  <Splitpanes ref="panel" :class="{loading}" horizontal h-screen @resize="handleResize">
    <Pane :min-size="titleHeightPercent" :size="panelSizes[0]" flex flex-col>
      <TitleBar title="HTML">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(0) ? '' : 'rotate-90'"
            @click="togglePanel(0)"
          />
        </template>
        <div flex-auto />
        <div text-sm op50>
          v{{ version }}
        </div>
        <a
          i-carbon-logo-github
          class="icon-btn"
          href="https://github.com/sponsors/antfu"
          target="_blank"
        />
        <button
          i-carbon-sun
          dark-i-carbon-moon
          class="icon-btn"
          @click="isDark = !isDark"
        />
      </TitleBar>
      <CodeMirror
        v-model="inputHTML"
        flex-auto
        mode="htmlmixed"
        class="scrolls border-(r gray-400/20)"
      />
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[1]" flex flex-col>
      <TitleBar title="Output CSS">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(1) ? '' : 'rotate-90'"
            @click="togglePanel(1)"
          />
        </template>
      </TitleBar>
      <!-- <CodeMirror
        v-model="formatted"
        flex-auto
        mode="css"
        border="r gray-400/20"
        class="scrolls"
        :read-only="true"
      /> -->
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col relative>
      <TitleBar title="Config">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(2) ? '' : 'rotate-90'"
            @click="togglePanel(2)"
          />
        </template>
      </TitleBar>
      <!-- <CodeMirror v-model="customConfigRaw" flex-auto mode="javascript" border="r gray-400/20" class="scrolls" /> -->
    </Pane>
  </Splitpanes>
</template>

<style lang="postcss">
.splitpanes.loading .splitpanes__pane {
  transition: none !important;
}
.icon-btn {
  @apply text-xl op75 hover:op100;
}
</style>
