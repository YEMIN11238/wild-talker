---
title: 第一次使用 Wild Talker
description: 下载 ZIP、加载包含 manifest.json 的目录、选择服务并完成第一次翻译。
---

# 第一次使用 Wild Talker

按这四步完成第一次翻译。当前发布的是 Chrome / Edge 桌面版 ZIP；Wild Talker 尚未以独立产品上架扩展商店。

## 1. 下载安装

直接下载 **[0.0.38 Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)**，或打开 **[此版本发布说明](https://github.com/YEMIN11238/wild-talker/releases/tag/v0.0.38-wild-talker.1)**，在 Assets 中选择相同安装包。不要下载 Source code.zip；它是开发源码，不能直接作为扩展加载。

将安装包解压到一个长期保留的文件夹。打开解压后的 **chrome-mv3** 子目录，找到 **manifest.json**，记住它所在的目录；后面加载的正是这个目录，不是 ZIP，也不是外层空文件夹。

扩展管理页中显示的版本是 **0.0.38**，对应发布标签 **v0.0.38-wild-talker.1**。**0.0.38 新安装默认亮色**，系统深色也不会自动改变扩展主题。已保存的暗色或跟随系统设置保留；希望一直亮色时，到 **设置 → 通用设置 → 界面主题 → 亮色主题** 选择一次，仍可主动选择 **跟随操作系统**。[主题修复说明](/guide/theme-default-fix)

发布标签包含分支版本信息，浏览器只能显示数字格式的 manifest 版本；核对品牌、标签和安装包一起确认版本。

## 2. 加载扩展

### Chrome

1. 在地址栏输入 `chrome://extensions/`。
2. 打开右上角的 **开发者模式**。
3. 点击 **加载已解压的扩展程序**。
4. 选择包含 **manifest.json** 的目录，确认卡片名称为 **万能说客（Wild Talker）**。
5. 从工具栏的扩展菜单固定图标，刷新安装前已打开的普通网页。

<figure class="doc-figure"><a href="/showcase/install-chrome.png"><img class="doc-screenshot" src="/showcase/install-chrome.png" width="2560" height="1626" alt="干净 Chrome 中开发者模式与 Wild Talker 扩展卡片" /></a><figcaption>隔离 Chrome 的 0.0.37 安装实拍；步骤相同，当前安装完成后卡片版本应为 0.0.38。</figcaption></figure>

### Edge

1. 在地址栏输入 `edge://extensions/`。
2. 开启 **开发人员模式**。
3. 点击 **加载解压缩的扩展**。
4. 选择同一个包含 **manifest.json** 的目录，核对名称与版本。
5. 从工具栏扩展菜单显示图标，刷新原来打开的网页。

<figure class="doc-figure"><a href="/showcase/install-edge.png"><img class="doc-screenshot" src="/showcase/install-edge.png" width="2544" height="1632" alt="干净 Edge 中开发人员模式与 Wild Talker 扩展卡片" /></a><figcaption>隔离 Edge 的 0.0.37 安装实拍；使用当前 Chrome / Edge MV3 ZIP，核对版本为 0.0.38。</figcaption></figure>

找不到 manifest.json 时，检查是否误下载源码包，或是否多解压了一层。不要移动或删除已加载的目录；浏览器会继续从这里读取文件。

## 3. 选择服务

打开插件 **设置 → 翻译服务**。普通网页双语翻译和基础划词翻译可以选择内置翻译服务，不要求自备 AI API；公开服务可能有地区、网络或限流问题，不保证持续免费或可用。先翻译一小段，失败时查看错误并切换服务。

AI 阅读解释和三种 AI 提示词预设需要支持相应能力的 AI 服务或本地模型服务。网页聊天产品的会员不等于 API 额度；服务商账号、费用与数据政策由服务商决定。

自定义接口请按 **[实测 API 配置示例](/guide/first-use-verification#自定义-api-示例)** 填写地址和模型名，再点击 **检查连接**。不要把 API Key 放进截图或公开反馈。连接成功后，把服务设为默认或明确选给所需功能；目录中选中一个服务不等于已经切换默认服务。

## 4. 完成第一次翻译

1. 打开 [Example Domain](https://example.com/) 等普通外语网页。扩展管理页、浏览器设置页和扩展商店属于受保护页面，无法用于网页翻译。
2. 打开插件，选择 **自动检测 → 简体中文**，确认当前服务。
3. 点击 **翻译**，等待段落下出现译文。阅读更多段落时可继续滚动。
4. 点击 **恢复原文**，确认原文恢复。更换语言或服务后，再重新翻译。

<figure class="doc-figure"><a href="/showcase/web-bilingual.png"><img class="doc-screenshot" src="/showcase/web-bilingual.png" width="2560" height="1626" alt="Wild Talker 网页双语翻译实拍" /></a><figcaption>0.0.37 发布版网页双语实拍；服务与浏览器的原验证范围见实测记录，不将旧图作为 0.0.38 翻译验收。</figcaption></figure>

想试划词，在 **划词翻译** 中开启功能，选中一段文字，点击旁边的入口。需要 AI 解释时，先配置支持的 AI 服务，再启用阅读卡片。**可参考本段** 会提供有限的段落语境；选中的内容仍是翻译对象。

## 安装之后

- [为什么使用 Wild Talker](/guide/why-wild-talker)：三个改进、启用条件与验证边界。
- [更新与离线安装](/guide/offline-install)：保留目录、备份设置和重新加载。
- [来源与独立发行](/guide/oauth-and-source)：上游来源、许可证与 OAuth 限制。
- [问题反馈](https://github.com/YEMIN11238/wild-talker/issues)：附浏览器、扩展版本、可公开网址和脱敏截图。
