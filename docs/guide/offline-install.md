---
title: ZIP 安装与升级
description: 下载 Wild Talker 的 Chrome / Edge ZIP，解压加载并安全升级。
---

# ZIP 安装与升级

**[下载 Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)**，安装步骤见[第一次使用教程](/guide/getting-started)。当前独立发行入口只有本仓库 Release；FluentRead 的扩展商店、CRX 镜像和脚本商店条目安装的是上游版本。

## 选对目录

```text
你保留的解压目录/
└── chrome-mv3/          ← 加载这里
    ├── manifest.json
    ├── background.js
    ├── assets/
    └── ...
```

具体文件随构建变化，判断依据始终是 **该目录直接包含 manifest.json**。不要加载 Source code.zip，也不要加载仍然压缩的 ZIP。

## 升级现有安装

1. 先在 **设置 → 备份与恢复** 导出必要配置。备份可能包含密钥和私人记录，不要公开上传。
2. 从 [本仓库 Release](https://github.com/YEMIN11238/wild-talker/releases/latest) 下载新包，查看该 Release 的版本对应和升级说明。
3. 保留原目录的备份，把新包解压到原来加载的目录。不要改用一个全新位置或同时安装两份。
4. 在 `chrome://extensions/` 或 `edge://extensions/` 找到 Wild Talker，点击 **重新加载**。
5. 核对名称与版本，刷新所有需要翻译的网页；仍打开的设置、文档页也需要刷新。

解压加载的扩展不会自动跟随商店更新。同一目录、原 manifest 公钥与 ID 保持一致时，本机设置通常会继续保留；换目录、删除后重装或更改公钥可能改变安装身份，因此仍应先备份。

## 当前版本怎么认

| 项目 | 当前发行 |
| --- | --- |
| 名称 | 万能说客（Wild Talker） |
| 扩展管理页 / manifest 版本 | `0.0.38` |
| GitHub 发布标签 | `v0.0.38-wild-talker.1` |
| 包类型 | Chrome / Edge MV3 ZIP |

**0.0.38** 将新安装默认主题修正为亮色。升级保留旧 `dark` / `auto` 设置，不强制覆盖；旧安装希望固定亮色时，到 **设置 → 通用设置 → 界面主题 → 亮色主题** 选择一次。仍可主动选择 **跟随操作系统**。重新加载扩展及原来打开的页面后核对版本。[主题修复与验证范围](/guide/theme-default-fix)

此前 0.0.37 的截图、动图和模型样例保留原版本标注，不作为新版翻译质量验收。
