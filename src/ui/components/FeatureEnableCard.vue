<!--
 * @file src/ui/components/FeatureEnableCard.vue
 * 文件职责：以整块可点击的紧凑设置卡展示功能总开关，使操作与标题紧邻并明确启停状态。
 * 主要内容：先呈现名称与说明，右侧开关对齐，读屏通过 aria-checked 获取状态；整块按钮支持点击、空格与回车，并适配禁用、窄屏及亮暗主题。
 * 模块边界：仅发送布尔值更新，不保存配置、不判断平台能力；禁用状态由调用方传入。
 -->
<template>
  <div class="feature-enable-card" :class="{enabled: modelValue, unavailable: disabled}">
    <button type="button" role="switch" :aria-label="title" :aria-checked="modelValue" :disabled="disabled" @click="emit('update:modelValue', !modelValue)">
      <span class="feature-enable-copy">
        <span class="feature-enable-heading"><strong>{{ title }}</strong></span>
        <span v-if="description" class="feature-enable-description">{{ description }}</span>
      </span>
      <span class="feature-enable-control"><i aria-hidden="true"><b /></i></span>
    </button>
  </div>
</template>
<script setup lang="ts">
defineProps<{modelValue: boolean; title: string; description?: string; disabled?: boolean}>();
const emit = defineEmits<{'update:modelValue': [value: boolean]}>();
</script>
<style scoped>
.feature-enable-card { margin: 0 0 20px; border: 1px solid var(--line, #dce3d2); border-radius: 14px; background: var(--surface, #fff); overflow: hidden; }
.feature-enable-card.enabled { border-color: color-mix(in srgb, var(--brand, #648433) 35%, var(--line, #dce3d2)); background: color-mix(in srgb, var(--brand, #648433) 4%, var(--surface, #fff)); }
.feature-enable-card button { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; min-height: 76px; padding: 18px 20px; border: 0; color: var(--ink, #252a24); background: transparent; font: inherit; text-align: start; cursor: pointer; }
.feature-enable-card button:hover:not(:disabled) { background: color-mix(in srgb, var(--brand, #648433) 5%, transparent); }
.feature-enable-card button:focus-visible { outline: 2px solid var(--brand, #648433); outline-offset: -3px; }
.feature-enable-copy { display: block; min-width: 0; flex: 1; }
.feature-enable-control { display: flex; align-items: center; gap: 10px; flex: none; }
.feature-enable-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; min-height: 28px; }
.feature-enable-heading strong { font-size: 14px; font-weight: 650; }
.feature-enable-description { display: block; margin-top: 4px; color: var(--muted, #6f7869); font-size: 12px; line-height: 1.6; }
.feature-enable-card i { display: flex; box-sizing: border-box; flex: none; align-items: center; width: 50px; height: 28px; padding: 3px; border: 1px solid color-mix(in srgb, var(--muted, #6f7869) 65%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--muted, #6f7869) 46%, var(--surface, #fff)); }
.feature-enable-card b { width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.16); transition: transform 150ms ease; }
.enabled i { background: var(--brand, #648433); border-color: var(--brand, #648433); }
.enabled b { transform: translateX(22px); }
.feature-enable-card button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 600px) { .feature-enable-card button { gap: 12px; padding: 15px 14px; } }
@media (prefers-reduced-motion: reduce) { .feature-enable-card b { transition: none; } }
</style>
