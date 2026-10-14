# Wild Talker 开发、恢复机制与维护

本页供开发者使用。产品用途、真实演示和安装步骤见[产品首页](https://yemin11238.github.io/wild-talker/)与[快速开始](../guide/getting-started.md)。FluentRead 来源、基线及第三方许可见[来源说明](https://github.com/YEMIN11238/wild-talker/blob/main/ATTRIBUTION.md)。

## 构建

使用 Node.js 22、pnpm 9.12.1 和已提交的锁文件。

```sh
git clone https://github.com/YEMIN11238/wild-talker.git
cd wild-talker
corepack enable
corepack prepare pnpm@9.12.1 --activate
pnpm install --frozen-lockfile
pnpm compile
pnpm build
```

加载 `.output/chrome-mv3` 内含 `manifest.json` 的目录。Firefox 构建为 `pnpm build:firefox`，userscript 为 `pnpm build:userscript`；公开发布哪些目标，以 Releases 为准。

| 检查 | 命令 |
| --- | --- |
| 类型检查 | `pnpm compile` |
| 测试归类与规则 | `pnpm test:audit` |
| 单元、功能、回归 | `pnpm test:unit`、`pnpm test:functional`、`pnpm test:regression` |
| 严格覆盖率 | `pnpm test:coverage` |
| 生成的 manifest | `pnpm verify:extension-manifests` |
| 文档构建与链接 | `pnpm docs:build`、`pnpm docs:check` |

具体分组、浏览器测试的临时配置与资源限制，遵循仓库 [AGENTS.md](https://github.com/YEMIN11238/wild-talker/blob/main/AGENTS.md) 和[测试文档](../testing.md)。文档或展示改动不作为重新验证所有运行时功能的证据。

## 文档翻译恢复的边界

本仓没有放宽术语保护、行内结构或缓存校验。当文档请求返回的保护标记不完整时，先尝试降低请求粒度；单段重试仍因特定校验失败时，只有符合纯文本与安全分句条件的段落才继续拆句，最多八个片段。各片段仍经原有校验，成功后才合并提交。

取消、认证失败、禁用翻译与持续错误不会被当作成功。无法恢复时沿用暂停与保留进度逻辑；它不能修复模型语义错误，也不能保证复杂公式、扫描件或任何 PDF 都能翻译。

624 字符 MiMo 段落的故障回放在 `tests/documentLiteralProtection.test.ts` 中；坏批次、坏长段与短句结果通过真实 broker、保护和缓存编排测试。服务响应是受控夹具，因此这验证恢复路径，不是云模型质量测试。产品层说明见[实测范围](../guide/first-use-verification.md#文档恢复)。

## 维护与上游同步

已确定维护以下现有改进：

- 弹窗、设置、文档与阅读面板的主题及入口一致性。
- 网页划词的有界段落参考及选区翻译对象约束。
- 自然阅读、技术文档、忠实直译提示词预设与其启用条件。
- 文档保护校验失败的有界降级、恢复与保留进度。
- 与上述能力对应的入门教程、真实媒体、安装版本说明和回归证据。

上游仍是 [FluentRead/FluentRead](https://github.com/FluentRead/FluentRead)。保留 `origin` 作为上游、`wild-talker` 作为本仓发布远端时，先 `git fetch origin`，在独立分支检查差异；不要直接点击同步后就覆盖发布版。

合并前检查供应商、权限、存储和 GPL/第三方许可变动，保留上游提交历史。解决本仓修改冲突后执行相关类型检查、测试与构建；用独立干净浏览器配置验证安装、首次翻译、划词及文档恢复。改动运行时代码时遵循仓库完整验证要求，再修改扩展版本并发布新的标签与 ZIP。

现有标签与资产用于识别已发布版本；展示文档可以更新，已发布安装包不得在无版本说明的情况下静默替换。没有确定的新增功能、发布日期或自动同步计划。

## 发布配置

产品站点为 `https://yemin11238.github.io/wild-talker/`，不使用上游自定义域名。部署文档需保留 `/wild-talker/` base，检查下载地址、截图和站内路径。当前源码默认不生成 Google OAuth 或 `identity` 权限，仅保留安装公钥以兼容本地配置。未注册自有 OAuth 应用时，Google Drive 入口显示不可用；显式设置自己的 `WXT_GOOGLE_CLIENT_ID` 并独立验收后才能启用。配置与扩展 ID 的关系见[配置说明](../guide/oauth-and-source.md)。

API Key、个人备份、测试 profile、模型缓存、阅读记录和本机绝对路径不应提交；真实素材使用可公开例文，报告区分实际模型调用与故障夹具。
