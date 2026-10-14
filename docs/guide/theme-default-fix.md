---
title: 默认亮色与升级说明
description: 0.0.38 修正新安装默认主题，并保留旧用户已保存的暗色或跟随系统设置。
---

# 默认亮色与升级说明

**[下载 0.0.38 Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)** · [安装教程](/guide/getting-started) · [发布说明](https://github.com/YEMIN11238/wild-talker/releases/tag/v0.0.38-wild-talker.1)

旧版 `0.0.37` 的新安装默认使用“跟随操作系统”。系统处于深色时，弹窗、设置页和文档页会采用深色，因此另一台电脑安装后可能与亮色截图不同。

`0.0.38` 将没有已保存主题的新安装默认值改为 **亮色**。缺失或无效的主题值也回退亮色；只有明确保存为 `auto` 时才跟随操作系统。扩展版本为 **0.0.38**，发布标签为 **v0.0.38-wild-talker.1**，安装包为 **wild-talker-0.0.38-chrome-edge.zip**。

## 旧安装怎样切换

升级不会强制覆盖已有 `dark` 或 `auto` 设置。此前旧版自动保存的 `auto` 也会保留，不会被误认为用户从未设置过。

1. 按需导出备份，将新版解压内容放回原扩展目录。
2. 在 `chrome://extensions/` 或 `edge://extensions/` 点击 Wild Talker 的 **重新加载**，核对版本 **0.0.38**。
3. 需要固定亮色时，进入 **设置 → 通用设置 → 界面主题 → 亮色主题**，主动选择一次。
4. 刷新已打开的弹窗、设置或文档页面。

**暗色主题**和**跟随操作系统**仍可主动选择，保存后继续使用。主题只影响扩展界面，不改变原网页本身的配色。

## 实拍与验证范围

首页和首次翻译教程中的截图、动图录于 `0.0.37`。`0.0.38` 沿用这些界面布局，本次修复默认主题；原素材与模型输出仍归属于[旧版首次使用验证](/guide/first-use-verification)，不改称新版验收。

2026 年 10 月 14 日，使用实际 `0.0.38` 冻结包验证了新安装和已保存主题。深浅系统偏好通过浏览器 CDP 的 `prefers-color-scheme` 模拟，没有修改原生系统外观。

| 浏览器与模式 | 本次实际范围 | 结果 |
| --- | --- | --- |
| Chrome for Testing `151.0.7922.34`，macOS 后台可见窗口 | 10 项；新安装弹窗、设置、文档首页和文本 PDF 阅读器；手动亮/暗/跟随系统；两次真实进程重启 | 全部通过，0 个页面错误；已保存 `dark` / `auto` 均保留 |
| Microsoft Edge `155.0.4283.45`，headless | 完整 10 项，含两次真实进程重启 | 全部通过，0 个页面错误；已保存 `dark` / `auto` 均保留 |
| 同版本 Edge，可见窗口 | 初始 4 项，含新装三面亮色、文本 PDF 和手动暗色检查 | 已通过；完整重启持久化使用上面的 headless 运行验证 |

Edge 可见窗口的重启尝试触发了焦点保护，停止后改用实际 Edge 程序的 headless 模式完成全流程；不将 headless 结果称为完整可见窗口验收。两次重启使用同一测试配置和扩展 ID，并重新加载同一冻结目录。测试结束后已关闭浏览器并删除这些临时配置，没有访问用户日常配置。

### 0.0.38 新安装实拍

下面四张均来自 Chrome 后台可见窗口，系统深色媒体偏好已启用，扩展仍为亮色。弹窗显示版本 **0.0.38**。

<figure class="doc-figure"><a href="/theme-default-fix/popup-system-dark.png"><img src="/theme-default-fix/popup-system-dark.png" width="360" height="600" alt="0.0.38 新安装在深色系统媒体偏好下仍显示亮色弹窗" /></a><figcaption>新安装弹窗：深色媒体偏好下，保存主题为 light。</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/options-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/options-system-dark.png" width="2560" height="1626" alt="0.0.38 新安装设置页为亮色" /></a><figcaption>同一新安装的通用设置页。</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/document-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/document-system-dark.png" width="2560" height="1626" alt="0.0.38 新安装文档首页为亮色" /></a><figcaption>同一新安装的文档首页。</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/pdf-reader-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/pdf-reader-system-dark.png" width="2560" height="1626" alt="0.0.38 导入公开文本 PDF 后阅读器仍为亮色" /></a><figcaption>导入公开文本 PDF 后，阅读器也保持亮色。</figcaption></figure>

<a href="/theme-default-fix/edge-headed/options-system-dark.png">Edge 可见窗口设置页实拍</a> · <a href="/theme-default-fix/edge-headless/options-system-dark.png">Edge headless 设置页实拍</a> · <a href="/theme-default-fix/theme-browser-verification.json">脱敏验收摘要与图像校验值</a>

用于测试的 467 个运行文件已逐一校验，与该 ZIP 内容一致。本次验证仅针对默认主题和明确选择的持久化，没有重新调用此前的翻译服务或模型，不推断翻译质量变化。未覆盖 Windows、Linux 或所有浏览器发行渠道。

当前新版 ZIP 的 SHA-256：

```text
b03b1a0df5f951a7d072b6175838d4b00b7fde9e3a3b39542bca45c458e72b37
```

解压后仍加载 **chrome-mv3** 子目录，其中直接包含 **manifest.json**。请保留该目录；不用卸载旧扩展来切换主题，卸载可能删除本地配置和学习记录。
