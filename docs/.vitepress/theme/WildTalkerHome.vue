<script setup lang="ts">
import { withBase } from 'vitepress'
defineProps<{ en?: boolean }>()
const releases = 'https://github.com/YEMIN11238/wild-talker/releases/latest'
const download = 'https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.37-wild-talker.1/wild-talker-0.0.37-chrome-edge.zip'
const repo = 'https://github.com/YEMIN11238/wild-talker'
const screenshot = (name: string) => withBase('/showcase/' + name)
</script>

<template>
  <div class="wt-site">
    <section class="wt-hero">
      <p class="wt-eyebrow">CHROME / EDGE · GPL-3.0</p>
      <h1>{{ en ? 'Wild Talker' : '万能说客 Wild Talker' }}<span>{{ en ? 'Bilingual translation & AI reading' : '浏览器双语翻译与 AI 阅读扩展' }}</span></h1>
      <p class="wt-intro">{{ en ? 'Read foreign-language webpages and documents alongside their translations, and use paragraph context to understand selected text.' : '在网页和文档中对照阅读原文与译文，借助所在段落理解你选中的词句。' }}</p>
      <figure class="wt-recording">
        <img :src="screenshot('selection-demo.gif')" width="2560" height="1626" :alt="en ? 'Recorded release build: selecting text and receiving a translation' : '发布版真实操作：选中文字、打开翻译卡片并获得译文'" />
        <figcaption>{{ en ? 'A real release-build recording in an isolated browser. See the verification record for the service used and its limits.' : '隔离浏览器中的发布版真实操作。所用服务与验证范围见实测记录。' }}</figcaption>
      </figure>
      <div class="wt-actions">
        <a class="wt-primary" :href="download">{{ en ? 'Download for Chrome / Edge ↓' : '下载 Chrome / Edge 安装包 ↓' }}</a>
        <a class="wt-secondary" :href="withBase((en ? '/en' : '') + '/guide/getting-started')">{{ en ? 'Install & translate your first page →' : '安装并完成第一次翻译 →' }}</a>
      </div>
      <p class="wt-note">{{ en ? 'Unzip the package, then load the folder containing manifest.json. Version 0.0.37 maps to release tag v0.0.37-wild-talker.1.' : '解压 ZIP 后，加载包含 manifest.json 的目录。扩展版本 0.0.37 对应发布标签 v0.0.37-wild-talker.1。' }}</p>
    </section>

    <section id="features" class="wt-section">
      <p class="wt-eyebrow">{{ en ? 'THREE FOCUSED IMPROVEMENTS' : '三个核心改进' }}</p>
      <h2>{{ en ? 'Why use Wild Talker?' : '为什么使用 Wild Talker？' }}</h2>
      <div class="wt-improvements">
        <article><span>01</span><h3>{{ en ? 'Context for your selection' : '为划词提供段落语境' }}</h3><p>{{ en ? 'With AI context enabled and a compatible provider, paragraph evidence supplements the inherited page context. Your selection remains the translation target; model output can still stray.' : '使用支持提示词的 AI 服务并开启 AI 精翻，段落参考补充继承的页面上下文。选区仍是翻译对象，模型输出可能不完全遵守。' }}</p></article>
        <article><span>02</span><h3>{{ en ? 'Three translation presets' : '三种翻译提示词预设' }}</h3><p>{{ en ? 'Choose natural reading, technical documentation or faithful translation for a configured AI provider. These guide the request; they do not guarantee better accuracy.' : '已配置 AI 服务后，主动选择自然阅读、技术文档或忠实直译。它们调整请求重点，不保证译文一定更准确。' }}</p></article>
        <article><span>03</span><h3>{{ en ? 'Bounded document recovery' : '文档翻译的有界恢复' }}</h3><p>{{ en ? 'When specific formatting checks fail, retry through a simpler request while keeping strict validation. Successful sections remain available; recovery can still fail.' : '特定格式校验失败时改用更简单的请求重试，并保留严格校验。已完成内容保留；无法恢复的部分仍会明确报错。' }}</p></article>
      </div>
      <a class="wt-text-link" :href="withBase((en ? '/en' : '') + '/guide/why-wild-talker')">{{ en ? 'Examples, activation conditions & validation scope →' : '查看真实案例、启用条件与验证范围 →' }}</a>
    </section>

    <section id="screenshots" class="wt-section">
      <p class="wt-eyebrow">{{ en ? 'THE RELEASE IN USE' : '发布版场景实拍' }}</p>
      <h2>{{ en ? 'Webpages, selected text, documents' : '网页、词句、文档' }}</h2>
      <div class="wt-scenes">
        <figure><a :href="screenshot('web-bilingual.png')"><img :src="screenshot('web-bilingual.png')" width="2560" height="1626" loading="lazy" :alt="en ? 'Webpage with bilingual text' : '网页中的原文与译文对照'" /></a><figcaption>{{ en ? 'Bilingual webpage reading' : '网页双语阅读' }}</figcaption></figure>
        <figure><a :href="screenshot('selection-context.png')"><img :src="screenshot('selection-context.png')" width="2560" height="1626" loading="lazy" :alt="en ? 'Selected sentence and its contextual translation card' : '选中句子与上下文翻译卡片'" /></a><figcaption>{{ en ? 'Selection with paragraph context' : '上下文划词翻译' }}</figcaption></figure>
        <figure><a :href="screenshot('document-reader.png')"><img :src="screenshot('document-reader.png')" width="2560" height="1626" loading="lazy" :alt="en ? 'Document reader with original and translated text' : '文档阅读器中的原文与译文'" /></a><figcaption>{{ en ? 'Bilingual document reading' : '文档双语阅读' }}</figcaption></figure>
      </div>
      <p class="wt-note">{{ en ? 'Bilingual display, document parsing and the reading-card foundation come from FluentRead. These screenshots show Wild Talker; older guide illustrations remain labeled as inherited references.' : '双语显示、文档解析和阅读卡片基础来自 FluentRead。此处展示 Wild Talker；旧功能指南中的示意图保留为已标注的继承参考。' }}</p>
    </section>

    <section class="wt-start wt-section">
      <div><h2>{{ en ? 'Get your first translation' : '从第一段译文开始' }}</h2><p>{{ en ? 'Download → Load extension → Choose a service → Translate. Start with the installation guide rather than configuring every feature at once.' : '下载安装 → 加载扩展 → 选择服务 → 完成第一次翻译。按首次使用教程逐步操作。' }}</p></div>
      <a class="wt-primary" :href="withBase((en ? '/en' : '') + '/guide/getting-started')">{{ en ? 'Open the guide →' : '查看首次使用教程 →' }}</a>
    </section>
    <footer class="wt-footer"><p>{{ en ? 'Based on FluentRead. Source history, GPL-3.0 and third-party notices are retained.' : '基于 FluentRead 改进，保留贡献历史、GPL-3.0 与第三方声明。' }}</p><nav><a :href="repo">GitHub</a><a :href="releases">{{ en ? 'Releases' : '下载' }}</a><a :href="withBase((en ? '/en' : '') + '/guide/oauth-and-source')">{{ en ? 'Source & identity' : '来源与发行说明' }}</a><a :href="withBase((en ? '/en' : '') + '/guide/privacy')">{{ en ? 'Privacy' : '隐私' }}</a></nav></footer>
  </div>
</template>

<style scoped>
.wt-site { color:#242c24; background:#f8f9f3; font-family:var(--vp-font-family-base); }
.wt-hero,.wt-section,.wt-footer { max-width:1120px; margin:auto; padding:58px 32px; }
.wt-hero { text-align:center; padding-top:64px; }
.wt-eyebrow { font-size:12px; letter-spacing:.12em; font-weight:700; color:#687154; margin:0 0 16px; }
h1 { font-size:clamp(32px,4vw,54px); font-weight:750; letter-spacing:-.04em; line-height:1.15; margin:0; }
h1 span { display:block; font-size:clamp(21px,2.6vw,32px); letter-spacing:-.025em; font-weight:600; margin-top:16px; }
.wt-intro { color:#62695d; font-size:18px; line-height:1.8; max-width:760px; margin:24px auto; }
.wt-recording { max-width:900px; margin:32px auto 24px; border-radius:20px; overflow:hidden; background:#fff; border:1px solid #dce1d2; }
figure { margin:0; } img { display:block; width:100%; height:auto; }
figcaption { color:#697060; padding:12px 16px; font-size:12px; line-height:1.65; }
.wt-actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
.wt-primary,.wt-secondary { display:inline-flex; align-items:center; justify-content:center; padding:14px 22px; border-radius:12px; font-size:15px; font-weight:700; text-decoration:none; }
.wt-primary { background:#d7f387; color:#242c24; border:1px solid #9cbb55; }
.wt-secondary { background:#fff; color:#242c24; border:1px solid #dce1d2; }
.wt-note { color:#6b7363; font-size:13px; line-height:1.8; margin:16px 0 0; }
h2 { font-size:30px; line-height:1.3; font-weight:720; margin:0 0 28px; letter-spacing:-.035em; }
.wt-improvements { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.wt-improvements article { background:#fff; border:1px solid #dce1d2; border-radius:18px; padding:24px; }
.wt-improvements span { font-size:12px; color:#6d8451; font-weight:700; }
h3 { font-size:19px; margin:12px 0 14px; line-height:1.4; }
.wt-improvements p,.wt-start p { font-size:15px; color:#697060; line-height:1.9; margin:0; }
.wt-text-link { display:inline-block; margin-top:24px; font-size:14px; color:#506b2b; text-decoration:underline; text-underline-offset:4px; }
.wt-scenes { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.wt-scenes figure { background:white; border:1px solid #dce1d2; border-radius:14px; overflow:hidden; }
.wt-scenes figcaption { color:#242c24; font-weight:650; font-size:14px; }
.wt-start { display:flex; align-items:center; justify-content:space-between; gap:30px; border-top:1px solid #dce1d2; }
.wt-start h2 { margin-bottom:16px; }
.wt-start .wt-primary { flex-shrink:0; }
.wt-footer { border-top:1px solid #dce1d2; font-size:12px; color:#697060; padding-top:28px; padding-bottom:32px; }
.wt-footer nav { display:flex; gap:20px; flex-wrap:wrap; margin-top:14px; }
.wt-footer a { text-decoration:underline; text-underline-offset:3px; }
a:focus-visible { outline:3px solid #708b42; outline-offset:4px; }
@media(max-width:760px) { .wt-hero,.wt-section,.wt-footer { padding:38px 20px; } .wt-improvements,.wt-scenes { grid-template-columns:1fr; } .wt-start { align-items:flex-start; flex-direction:column; } .wt-actions > a { width:100%; } .wt-intro { font-size:16px; } }
</style>
