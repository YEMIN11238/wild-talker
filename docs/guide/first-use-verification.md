# 首次使用实测与 API 示例

本页区分真实网络与模型调用、发布包 UI 操作，以及受控故障回放。截图和短动图均来自公开 Release 的 `v0.0.37-wild-talker.1` ZIP，扩展管理页版本为 `0.0.37`；测试使用独立临时浏览器配置和可公开例文，不读取日常浏览器设置或真实密钥。

[下载安装包](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.37-wild-talker.1/wild-talker-0.0.37-chrome-edge.zip) · [安装教程](./getting-started)

## 服务与启用条件

| 使用场景 | 是否需要自备 AI API | 条件与本次范围 |
| --- | --- | --- |
| 普通网页双语翻译 | 不需要 | 本次使用 Microsoft 网页翻译服务，实际显示中文译文；需要网络，接口可能限流或不可用。 |
| 普通划词、悬停与文档翻译 | 不需要 | 可选择网页翻译服务；本次 Microsoft 完成原创 1 页 PDF 的 8 个片段。没有验证所有文档。 |
| AI 精翻与段落参考 | 需要可用 AI 服务，或本地模型 | 开启 AI 精翻，选择支持通用提示词的服务；模型可能不遵守范围约束。 |
| 三种提示词预设 | 需要支持 system/user 提示词的 AI 服务 | 在服务设置里主动选择，保存后生效。网页翻译接口不会运行 AI 提示词。 |
| AI 阅读解释与追问 | 需要相应 AI 服务 | 不把已有翻译接口当作通用 AI；本次只验证实际演示所覆盖的操作。 |
| 术语保护失败恢复 | 使用现有文档翻译服务 | 针对特定校验失败尝试恢复；不是替服务提供认证、修复限流或保证语义质量。 |

本次 Google 网页接口探测出现 HTTP 429，未把它列为成功的入门示例。无需 Key 表示无需自己申请 AI Key，不代表不联网、不发送文本，或承诺接口长期免费可用。

开启 AI 精翻会使用上游继承的页面上下文能力，可能先获取摘要、发送可读页面内容，并追加本仓有界的段落参考；不是只把所选词语发送给模型。处理私人页面前请了解所选服务的数据处理方式。[隐私说明](./privacy)

## 自定义 API 示例

本次实测是**本机运行的 OpenAI 兼容 llama-server**，不是付费云服务，也没有使用个人密钥。接口由官方 Ollama 发布包附带的 llama.cpp 服务运行，模型 GGUF 来自官方 Ollama registry。测试配置与实际模型输出在下面区分记录；不把协议相容等同于模型质量。

在 **设置 → 翻译服务 → 添加 OpenAI 兼容服务** 中填写：

| 项目 | 本次可复现配置 |
| --- | --- |
| 接口地址 | `http://127.0.0.1:11434/v1` |
| 模型 | `qwen2.5:3b`（最终选句演示；另记录了 1.5B 小模型测试） |
| API Key | `YOUR_API_KEY`，仅为非秘密占位符。本次服务没有启用认证；也实测了开启允许留空密钥后不填 Key。 |
| 模式 | OpenAI 兼容的聊天补全接口；基础地址自动拼接 `/chat/completions`。 |
| 目标语言 | 简体中文 |

保存后点击服务的 **检查连接**。它会通过实际翻译适配器发送固定样例，不是只查询 `/models`。本次实际发布包显示连接成功，随后才执行真实翻译。连接成功只表示这一次请求和响应符合接口要求，不能保证模型遵守所有提示词、支持图片或正确翻译任何内容。

如果你自己启动同类本地服务，可使用以下形式；先从官方来源准备 llama-server 和模型，不要把示例文件名当成已经下载的模型：

```sh
llama-server -m ./model.gguf --alias qwen2.5:3b --host 127.0.0.1 --port 11434 --threads 4 --ctx-size 8192
```

模型名需与 `--alias` 一致；远程服务则使用服务商提供的实际模型名和真实 Key，不能照抄本地占位符。也可填写完整 `http://127.0.0.1:11434/v1/chat/completions`，现有适配器会保留完整地址。本次实际发布包分别验证了基础地址、完整地址与允许留空密钥；匿名请求实际没有 Authorization。其他兼容选项未逐一测试。

<img src="/showcase/custom-api.png" alt="实际发布版的自定义 API 配置与连接检查" width="2560" height="1626" loading="lazy" />

这张截图使用本次匿名测试配置；云 API 需要填写自己的真实 Key，不要把“允许留空”规则推广到云服务。

[llama.cpp 官方服务说明](https://github.com/ggml-org/llama.cpp/tree/master/tools/server) · [Ollama 官方 OpenAI 兼容文档](https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx)

常见检查：HTTP 401/403 核对认证；模型不存在核对模型名；连接拒绝检查服务是否启动及端口；HTTP 429 表示限流，避免连续重复请求。这个本地示例需要自己下载并运行模型，会占用内存和磁盘；本仓 ZIP 不包含模型或 AI Key。

## 上下文划词

示例网页使用原创公开段落，包含河流与 `bank`。实际请求的原文对象仍是选中的词，新增的 `discourse_evidence` 携带所在段落作为参考，预算最多 500 字符。普通划词需开启 **AI 精翻** 并使用支持提示词的 AI 服务。

<img src="/showcase/selection-context.png" width="2560" height="1626" alt="真实选区翻译卡片" />

Qwen2.5 1.5B 与 3B 对单独 `bank` 的真实测试均混入参考内容，并出现“银行”，没有遵守选区范围要求。最终演示选择一个完整句子，并使用 3B 模型；模型在这条样例上能只返回目标句译文。保留单词失败记录，不以单条成功证明准确率提高。新增参考让模型有机会利用语境，实际效果仍受指令遵从性影响。

阅读卡片中的“参考本段”另有阅读服务及上下文模式配置，不等同于普通划词的 AI 精翻开关。不要用其中一条流程的验证结果覆盖另一条。

## 提示词预设

在自定义 AI 服务的提示词设置中选择 **自然阅读 / 技术文档 / 忠实直译**，确认替换模板后保存。它不会自动变成默认选择，也不会使非 AI 网页接口理解提示词。

以下使用发布源码中的三组模板，向真实 Qwen2.5 1.5B 发送 OpenAI 兼容请求；这是模板与输出样例，不是 UI 操作录像，也没有和上游做质量比较。

| 预设 | 原文 | 本次真实输出 |
| --- | --- | --- |
| 自然阅读 | The speaker broke the ice with a short joke. The audience began to relax. | 演讲者以一个简短的笑话打破了沉默。观众开始放松下来。 |
| 技术文档 | Use --dry-run to preview changes. The request may be retried after HTTP 429, but success is not guaranteed. | 使用 --dry-run 预览更改。请求可能会在 HTTP 429 之后重试，但成功保证不了。 |
| 忠实直译 | The results may improve, but the experiment does not prove that the treatment works. | 结果可能会有所改善，但实验并未证明该疗法有效。 |

技术样例保留了参数、可能性和不保证成功的条件，但“成功保证不了”仍不够自然。三种预设改变的是翻译要求，输出可能相近，也可能不合格，不把任一结果当作模型质量评测。

## 文档恢复

实际发布包通过 Microsoft 服务完成本次原创 1 页 PDF 的 8/8 片段，得到下图。文件解析、原版排版等基础继承自 FluentRead。

<img src="/showcase/document-reader.png" width="2560" height="1626" alt="本次 PDF 双语阅读" />

另一个测试回放用户此前遇到的 MiMo 报告第 55 段：624 字符原文中的术语保护标记在服务响应中丢失。坏合批、完整长段重试仍失败时，恢复逻辑尝试安全句界，把 4 个句子分别请求并严格校验后合并，再继续下一段；只缓存通过校验的片段。这个恢复案例使用受控服务响应，验证了编排与进度保留，不是对真实模型故障概率的测量。

未重新对 44 页报告执行完整的真实云端翻译；复杂扫描件、公式、表格和服务限流仍可能失败。[底层机制与对应回归](https://github.com/YEMIN11238/wild-talker/blob/main/docs/maintainers/wild-talker-development.md)

## 安装与媒体验证记录

测试下载公开 ZIP 后核对 SHA-256：

```text
162d1483941f6ffd7b2c4fdfcf74821ac3e354d6dd7ac75b780b984cb54f0340
```

解压目录内应选择 `chrome-mv3`，其中直接包含 `manifest.json`。以下均在 macOS / Apple Silicon 上使用独立临时配置完成。

| 浏览器 / 服务 | 实际结果 |
| --- | --- |
| Chrome for Testing `151.0.7922.34` | 干净加载、中文引导、选择 Microsoft、连接检查 506 ms、首次网页双语翻译通过。 |
| Microsoft Edge `155.0.4283.45` | 官方运行程序，干净加载、中文引导、选择 Microsoft、连接检查 893 ms、首次网页双语翻译通过。 |
| 本地 llama-server + `qwen2.5:3b` | Chrome 发布包 UI 连接检查 266 ms；完整接口、匿名配置、完整句子翻译通过。 |
| Microsoft PDF 翻译 | 原创 1 页文本 PDF 的 8/8 片段通过；没有验证 OCR 或复杂排版。 |
| 短动图 | 实际鼠标拖选、加载、真实译文；CDP 连续录制 11 帧，约 3.9 秒，没有注入答案或伪造 UI。 |

加载目录通过开发者模式页面和浏览器 CDP `Extensions.loadUnpacked` 指定为实际解压的 `chrome-mv3`。没有自动点击原生文件夹选择器，因此不把原生选择器交互声称为已测试。Chrome 开发者页出现的跨 world/未使用预加载警告经过检查留存，清除列表后才拍安装图；不将清空列表当作修复运行时代码。测试后两个浏览器和临时配置已清理。

<a href="/showcase/reading-example.html">打开可公开复现的英语网页</a> · <a href="/showcase/reading-example.pdf">下载本次文本 PDF</a> · <a href="/showcase/verification.json">查看浏览器、服务及素材校验记录</a>

截图使用原创公开文本、占位或空密钥，不含用户阅读记录。尚未验证 Windows、Linux、普通 Chrome 的所有渠道、云 AI 账号、大型 PDF、OCR、视频站点或所有免费接口；没有做与上游的翻译质量对比。
