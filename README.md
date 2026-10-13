<div align="center">

<img src="./assets/brand/icon-512.png" alt="万能说客 Wild Talker" width="96" />

# 万能说客 · Wild Talker

浏览器双语翻译与阅读工具，可连接自己的翻译服务和 AI 模型。

[下载安装包](https://github.com/YEMIN11238/wild-talker/releases) · [问题反馈](https://github.com/YEMIN11238/wild-talker/issues) · [来源与改动](./ATTRIBUTION.md) · [GPL-3.0](./LICENSE)

</div>

Wild Talker 基于 [FluentRead](https://github.com/FluentRead/FluentRead) 改造。网页、文档、图片、视频字幕与学习工具的基础能力主要来自上游；本仓保留其源码、开源许可及历史，增加界面改造、选区上下文、提示词预设和文档翻译恢复等改进。具体范围见 [ATTRIBUTION.md](./ATTRIBUTION.md)。

## 能做什么

| 功能 | 使用方式 |
| --- | --- |
| 网页双语翻译 | 在原文附近显示译文，支持全文、鼠标悬停、划词、局部翻译与恢复原文。 |
| 自定义 AI 服务 | 配置 OpenAI 兼容接口的地址、API Key 和模型，也可使用已有服务适配器或本地 Ollama。 |
| 上下文阅读 | 划词翻译可参考所在段落；AI 阅读辅助支持解释、句子分析和连续追问。需要配置支持相应功能的 AI 服务。 |
| 输入与写作 | 翻译输入框内容，并使用写作辅助调整语言和表达。 |
| 文档阅读与翻译 | 导入 PDF、EPUB、DOCX、HTML、TXT、Markdown、JSON 和常见字幕格式，双语阅读、校订译文并导出。 |
| 图片与圈选翻译 | 识别图片或选定区域的文字，展示可复制的译文；识别效果受图像清晰度和文字排版影响。 |
| 视频字幕与学习 | 支持上游已适配站点的双语字幕及完整句学习面板；部分 X 视频可使用本地 AI 转写。 |
| 阅读配置 | 术语库、收藏与学习记录、网站规则、快捷键、译文样式，以及浅色、深色和系统主题。 |

## 本仓的主要改进

- 使用「万能说客（Wild Talker）」名称和项目图标，重新整理弹窗、设置页、文档阅读器及其他功能面板的配色和控件。
- 文档页和完整句学习面板跟随插件主题，学习外观预览与实际面板共享样式。
- 清理界面中的上游宣传、赞赏图片与误导性跳转；「关于」页提供本地功能入口和完整 GPL 许可，上游来源仍明确保留。
- 为网页划词增加有界的段落参考。开启 AI 精翻并使用支持通用提示词的服务时，最多参考所在段落的 500 个字符，只翻译选中的文字。
- 增加自然阅读、技术文档、忠实直译三组可主动选择的翻译提示词。
- 文档翻译遇到术语保护标记损坏时，从合批降级为逐段请求；单段重试后仍失败，可在适用的纯文本句界拆成最多八个片段继续恢复。每个结果仍经过术语校验，持续失败会暂停并保留已完成译文。

## 安装到 Chrome / Edge

本仓通过 [GitHub Releases](https://github.com/YEMIN11238/wild-talker/releases) 提供安装包。请使用此处的 Wild Talker 包；上游浏览器商店发布的是 FluentRead。

1. 下载 Chrome / Edge ZIP，解压到一个固定文件夹。解压后找到包含 `manifest.json` 的目录；若包内还有 `chrome-mv3` 子目录，选择该子目录。
2. Chrome 打开 `chrome://extensions`，Edge 打开 `edge://extensions`，开启 **开发者模式**。
3. 点击 **加载已解压的扩展程序**，选择包含 `manifest.json` 的目录。
4. 在浏览器工具栏固定 Wild Talker，刷新需要翻译的网页。
5. 打开插件，选择翻译服务与目标语言，点击翻译。划词、悬停等功能可在设置中开启。

更新时将新版文件放到原来的扩展目录，再在扩展管理页点击重新加载，并刷新网页。请保留该目录；浏览器需要从这里加载扩展。卸载扩展会删除浏览器中的相关本地数据，更新前可按需使用插件的备份功能。

## 配置自己的 API

进入 **设置 → 翻译服务**，添加或选择 OpenAI 兼容服务，并填写以下内容。

| 配置 | 说明 |
| --- | --- |
| 接口地址 | 使用服务商提供的地址，按编辑器要求填写完整接口或基础地址。不同服务对路径的约定可能不同。 |
| API Key | 填写自己的密钥。无需认证的本地服务按其接口要求配置。 |
| 模型 | 填写服务商实际支持的模型名；同一家服务的模型名也可能不同。 |
| 提示词 | 可选择本仓预设或编辑自己的模板，保留目标语言与原文变量。 |

保存后使用连接检查，再将该服务选为网页、划词或文档翻译所用的服务。连接成功表示该次接口调用可用，不保证所有模型都支持所有功能。遇到认证、模型不存在或限流提示，按错误信息检查服务配置。

## 数据与限制

设置、文档译文和学习记录默认保存在当前浏览器中。使用云翻译或 AI 讲解时，待处理文字以及启用的上下文会发送给所选服务。图片识别和视频转写的网络行为取决于所选方案；本地模型首次使用可能需要下载。

云备份、配置导出属于用户主动操作，其中可能包含服务凭据。不要将个人备份、浏览器配置、API Key 或阅读记录提交到仓库。权限与数据处理的详细说明见 [隐私文档](./docs/guide/privacy.md)。

当前存在以下边界。

- 浏览器内部页面、扩展商店及部分受限页面不能注入网页翻译。动态网页和站点改版也可能需要新的适配。
- 第三方免费接口、模型价格、认证要求与限流策略由服务商决定；本仓不提供通用免费的 AI API。
- PDF 原版排版、扫描件 OCR、复杂表格和公式仍可能需要校订。自动重试与格式校验不能保证语义准确或任何文档都能完整翻译。
- 视频功能以实际适配的站点和可获得的字幕或音频为准，不宣称支持所有网站或会议平台。
- Chrome / Edge 使用上述手动安装方式。源码保留 Firefox 与 userscript 构建目标，具体发布包和验证范围以各次 Release 说明为准。

## 本地构建

建议使用 **Node.js 22** 和 **pnpm 9**。仓库锁文件记录 pnpm 9.12.1，不需要升级依赖即可构建。

```sh
git clone https://github.com/YEMIN11238/wild-talker.git
cd wild-talker
corepack enable
corepack prepare pnpm@9.12.1 --activate
pnpm install --frozen-lockfile
pnpm compile
pnpm build
```

Chrome 构建输出位于 `.output/chrome-mv3`，可按上面的开发者模式流程加载。

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Chrome 开发构建。 |
| `pnpm dev:firefox` | 启动 Firefox 开发构建。 |
| `pnpm build` | 构建 Chrome 扩展。 |
| `pnpm build:firefox` | 构建 Firefox 扩展。 |
| `pnpm zip` / `pnpm zip:edge` / `pnpm zip:firefox` | 生成相应目标的打包产物。 |
| `pnpm build:userscript` | 构建 userscript。 |
| `pnpm compile` | 检查 TypeScript 与 Vue 类型。 |
| `pnpm test:audit` | 审核测试归类、重复与跳过规则。 |
| `pnpm test:unit` / `pnpm test:functional` / `pnpm test:regression` | 按分组运行测试。 |
| `pnpm test:coverage` | 执行仓库规定的覆盖率检查。 |
| `pnpm verify:extension-manifests` | 检查已经生成的扩展 manifest。 |
| `pnpm docs:build` | 构建文档。 |
| `pnpm storybook` | 查看真实 Vue 组件与主题。 |

构建输出不包含你的浏览器设置或 API Key。Google Drive 的公开 OAuth 应用标识与 Chrome 扩展公钥沿用上游默认配置；如需独立发布、接入自己的 OAuth 应用，参考 [.env.example](./.env.example) 和 [Google Drive 配置说明](./docs/maintainers/google-drive-sync-guide.md)。这些公开标识不等于服务密钥，也不授予使用他人账号的权限。

开发规则见 [AGENTS.md](./AGENTS.md)、[架构说明](./docs/architecture.md) 和 [测试说明](./docs/testing.md)。仓库中的部分文档与历史材料仍记录 FluentRead 的上游功能和开发过程，不能视为本仓独立完成的工作或当前发布版的验证结果。

## 反馈与许可

通过 [Issues](https://github.com/YEMIN11238/wild-talker/issues) 报告问题时，请附浏览器版本、操作步骤、错误提示和可公开的示例，并遮挡密钥与个人信息。欢迎提交 Pull Request。

本项目遵循 [GPL-3.0](./LICENSE)，保留 FluentRead 及其他组件的原有版权与许可。[ATTRIBUTION.md](./ATTRIBUTION.md) 记录上游基线及本仓改动，[第三方声明](./public/third-party-notices/) 保留各组件的许可。
