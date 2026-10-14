<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute, withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import LandingHeader from './LandingHeader.vue'
const route = useRoute()
const { lang, page } = useData()
const english = computed(() => lang.value.startsWith('en'))
const inheritedGuide = computed(() => /^(en\/)?(guide|config)\//.test(page.value.relativePath) && !/\/(getting-started|offline-install|why-wild-talker|oauth-and-source|first-use-verification|theme-default-fix|support|privacy)\.md$/.test(page.value.relativePath))
const landing = computed(() => /^(en\/)?index\.md$/.test(page.value.relativePath))
// Headings differ between languages. Keep the corresponding page, without carrying its hash.
const languageLink = computed(() => {
  if (page.value.isNotFound) return withBase(english.value ? '/' : '/en/')
  const path = page.value.relativePath
    .replace(/^en\//, '')
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
  return withBase((english.value ? '/' : '/en/') + path)
})
let revision = 0
async function revealAnchor() {
  const current = ++revision
  await nextTick()
  if (current !== revision || !location.hash) return
  let id: string
  try {
    id = decodeURIComponent(location.hash.slice(1))
  } catch {
    return
  }
  const target = document.getElementById(id)
  if (!target) return
  const parents: HTMLDetailsElement[] = []
  let ancestor = target.parentElement
  while (ancestor) {
    if (ancestor instanceof HTMLDetailsElement) parents.push(ancestor)
    ancestor = ancestor.parentElement
  }
  if (!parents.length) return
  parents.forEach((details) => {
    details.open = true
  })
  await nextTick()
  if (current === revision) target.scrollIntoView({ block: 'start' })
}
onMounted(() => {
  window.addEventListener('hashchange', revealAnchor)
  void revealAnchor()
})
const stop = watch(() => route.path, revealAnchor, { flush: 'post' })
onBeforeUnmount(() => {
  revision++
  stop()
  window.removeEventListener('hashchange', revealAnchor)
})
</script>
<template>
  <div v-if="landing" class="bv-home-shell">
    <LandingHeader :en="english" :language-link="languageLink" />
    <main id="VPContent"><Content /></main>
  </div>
  <DefaultTheme.Layout v-else>
    <template #doc-before>
      <aside v-if="inheritedGuide" class="wt-inherited-guide">
        {{ english ? 'Inherited feature reference from FluentRead. Some illustrations and verification records describe the upstream version; they are not current Wild Talker screenshots or new compatibility claims.' : '本页是继承自 FluentRead 的功能参考。部分示意图及验证记录对应上游版本，不代表当前 Wild Talker 实拍或新增兼容承诺。' }}
        <a :href="withBase(english ? '/en/' : '/')">{{ english ? 'Current release screenshots →' : '查看当前发布版实拍 →' }}</a>
      </aside>
    </template>
    <template #nav-bar-title-after>
      <span class="bv-home-brand-text">
        <strong :lang="english ? 'en' : 'zh-CN'">{{ english ? 'Wild Talker' : '万能说客' }}</strong>
      </span>
    </template>
    <template #nav-bar-content-after>
      <a
        class="bv-language"
        :href="languageLink"
        :aria-label="english ? '切换到简体中文' : 'Switch to English'"
        :hreflang="english ? 'zh-CN' : 'en'"
      >
        {{ english ? '中文' : 'EN' }}
      </a>
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
.wt-inherited-guide { border:1px solid var(--vp-c-divider); border-radius:10px; padding:14px 16px; margin-bottom:24px; font-size:13px; line-height:1.8; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); }
.wt-inherited-guide a { display:block; color:var(--vp-c-brand-1); margin-top:4px; text-decoration:underline; }
</style>
