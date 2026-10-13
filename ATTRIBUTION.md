# 来源、许可与改动说明

## FluentRead 上游

万能说客（Wild Talker）基于 [FluentRead / FluentRead](https://github.com/FluentRead/FluentRead) 改造，基线提交为 [`cf52fdd80e2d39ad1f4b1a413c9660d45edddec6`](https://github.com/FluentRead/FluentRead/commit/cf52fdd80e2d39ad1f4b1a413c9660d45edddec6)。上游版本元数据为 0.0.37。

本仓沿用上游的 WXT、Vue、TypeScript 架构，以及网页双语翻译、翻译服务适配、划词与阅读辅助、输入与写作、文档和 PDF 处理、OCR、视频字幕、词书、设置和存储等基础实现。上述基础功能及大部分源码由上游贡献者完成。上游提交历史、代码中的来源说明及许可属于项目来源记录；重新命名和界面改造不会改变这些来源。

FluentRead 的贡献者列表可在 [上游贡献历史](https://github.com/FluentRead/FluentRead/graphs/contributors) 中查看。本仓保留 [GPL-3.0 许可证全文](./LICENSE)，没有将上游代码重新声明为专有代码。

## Wild Talker 的改动

以下列出相对上述基线的主要改动，完整差异以提交历史为准。

| 改动 | 涉及范围 |
| --- | --- |
| 品牌与图标 | 使用「万能说客（Wild Talker）」名称，替换安装图标及主要界面品牌；保留内部兼容标识与本地数据结构。 |
| 界面整理 | 重排弹窗和后台设置的布局，统一文档阅读器、划词、阅读辅助、写作、图片及视频学习等面板的颜色与控件；保留功能入口和状态。 |
| 主题同步 | 文档页读取插件主题配置；完整句学习面板与设置预览共享主题样式，并跟随浅色、深色或系统设置。 |
| 本地入口 | 清除上游宣传和赞赏图像，以及会被误认为本产品官网的界面跳转；「关于」页提供本地配置入口和 GPL 全文，保留明确上游来源。 |
| 划词上下文 | 开启 AI 精翻时，为适用的网页划词请求提供有界的所在段落参考，选中文字仍是翻译对象。 |
| 翻译提示词 | 增加自然阅读、技术文档、忠实直译三组可主动选择的提示词。 |
| 文档失败恢复 | 术语保护标记损坏时允许合批降级、单段重试和适用的句界恢复；沿用严格结果校验，保留已完成译文和原有停止逻辑。 |
| 验证与说明 | 为相应交互、配置、主题和恢复逻辑调整或增加测试，补充功能文档及发布说明。 |

这些改动不表示本仓从零实现了上游功能，也不意味着所有网页、视频或 PDF 都经过验证。每次发布的实际验证范围以 Release 说明为准。

## 图标

当前图标由项目发起者提供，用于本项目的视觉标识。图像原文件及转换记录见 [assets/brand/icon-source.json](./assets/brand/icon-source.json)。转换只涉及格式和尺寸，未生成新的图像内容。

## 第三方组件与致谢

各组件原有许可继续适用，具体声明保存在 [public/third-party-notices](./public/third-party-notices/) 及相应源码、依赖包中。其中包括 DeepSeek Harness 会话组件的浏览器适配及其 [MIT 许可](./public/third-party-notices/deepseek-harness-MIT.txt)。

FluentRead 的原有致谢还包括以下项目，其贡献与来源说明继续保留。

- [Read Frog](https://github.com/mengxi-ream/read-frog)
- [KISS Translator](https://github.com/fishjar/kiss-translator)
- [Duo Translator](https://github.com/linuxscreen/duo-translator)
- [InfoLens](https://github.com/dqy08/InfoLens)，智能高亮参考了其意外度热力图思路，相关组件遵循原有 Apache-2.0 声明。

上游公开 OAuth 客户端 ID、扩展公钥以及网页翻译协议常量属于对应集成的公开配置或协议标识。个人 API Key、登录令牌、浏览器配置、文档与学习记录不属于可公开的项目资料，不应提交。
