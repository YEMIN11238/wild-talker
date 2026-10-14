<script setup lang="ts">
import { withBase } from 'vitepress'
import BrowserGlyph from './BrowserGlyph.vue'
defineProps<{ en?: boolean; showDocs?: boolean }>()
</script>
<template>
  <div class="bv-install">
    <div class="bv-install-actions">
      <a class="bv-button bv-primary" href="https://github.com/YEMIN11238/wild-talker/releases/latest"><BrowserGlyph browser="Chrome" /><BrowserGlyph browser="Edge" />{{ en ? 'Download Chrome / Edge ZIP' : '下载 Chrome / Edge ZIP' }}</a>
      <a class="bv-button bv-secondary" :href="withBase((en ? '/en' : '') + '/guide/getting-started')">{{ en ? 'Installation guide' : '安装教程' }}</a>
      <a v-if="showDocs" class="bv-button bv-secondary bv-docs-link" :href="withBase((en ? '/en' : '') + '/docs/')">{{ en ? 'Documentation' : '使用文档' }}</a>
    </div>
    <p class="bv-install-fallbacks">{{ en ? 'Wild Talker is distributed here as an unpacked desktop extension. FluentRead store listings install the upstream product.' : 'Wild Talker 当前通过桌面解压扩展发行；FluentRead 商店条目安装的是上游产品。' }}</p>
  </div>
</template>
