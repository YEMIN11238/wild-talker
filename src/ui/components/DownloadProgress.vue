<!--
 * @file src/ui/components/DownloadProgress.vue
 * 文件职责：用同一种进度条和文字呈现模型、语言包等资源的下载进度，让设置页与网页内卡片的各处下载看起来一致。
 * 主要内容：有总量时显示进度条与“百分比 · 已下载 / 总大小”，紧凑模式只写百分比，旁边已有文字说明时可只留进度条；来源没有给出总量或尚未收到首个进度时显示不确定进度条，只写真实已下载体积；颜色沿用界面语义变量，可由宿主覆盖。
 * 模块边界：纯展示组件，不订阅存储、不发起下载、不推算速度或剩余时间；进度数值由调用方传入，文字不放进朗读区域，避免读屏软件逐次播报。
 -->
<template>
  <div class="download-progress" :class="{'is-compact': detail === 'percent'}" :data-state="percent === undefined ? 'indeterminate' : 'determinate'" data-download-progress>
    <progress v-if="progress && percent !== undefined" :value="progress.loaded" :max="progress.total" :aria-label="label" />
    <progress v-else :aria-label="label" />
    <span v-if="progress && detail !== 'none'" class="download-progress-detail" data-i18n-ignore>{{ detail === 'percent' && percent !== undefined ? `${percent}%` : formatDownloadProgress(progress) }}</span>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {downloadProgressPercent, formatDownloadProgress, type DownloadProgress} from '@/src/core/download/progress'

/**
 * detail：full 写“百分比 · 已下载 / 总大小”；percent 用于几 MB 的小资源和窄行，只写百分比；
 * none 用于旁边的状态文字已经包含百分比、来源也不提供字节数的场景，只留进度条。
 */
const props = withDefaults(defineProps<{progress?: DownloadProgress; label: string; detail?: 'full' | 'percent' | 'none'}>(), {detail: 'full'})
const percent = computed(() => props.progress ? downloadProgressPercent(props.progress) : undefined)
</script>

<style scoped>
.download-progress { display: grid; gap: 4px; min-width: 0; }
.download-progress.is-compact { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.download-progress progress {
  display: block;
  width: 100%;
  height: 6px;
  border: 0;
  border-radius: 3px;
  overflow: hidden;
  appearance: none;
  background: var(--download-progress-track, var(--surface-soft, rgba(127, 127, 127, .22)));
}
.download-progress progress::-webkit-progress-bar { background: transparent; }
.download-progress progress::-webkit-progress-value { border-radius: 3px; background: var(--download-progress-fill, var(--brand, #648433)); transition: width 200ms linear; }
.download-progress progress::-moz-progress-bar { border-radius: 3px; background: var(--download-progress-fill, var(--brand, #648433)); }
/* 没有总量时不伪造百分比：只用一段滑动色块表示仍在接收数据。 */
.download-progress progress:indeterminate {
  background-image: linear-gradient(90deg, transparent, var(--download-progress-fill, var(--brand, #648433)), transparent);
  background-repeat: no-repeat;
  background-size: 40% 100%;
  animation: download-progress-slide 1.2s linear infinite;
}
.download-progress progress:indeterminate::-moz-progress-bar { background: transparent; }
.download-progress-detail {
  color: var(--download-progress-text, var(--muted, currentColor));
  font-size: 11px;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
@keyframes download-progress-slide { from { background-position: -70% 0; } to { background-position: 170% 0; } }
@media (prefers-reduced-motion: reduce) {
  .download-progress progress::-webkit-progress-value { transition: none; }
  .download-progress progress:indeterminate { background-position: 50% 0; animation: none; }
}
</style>
