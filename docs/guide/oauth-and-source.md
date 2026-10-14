---
title: 来源、许可证与独立发行
description: Wild Talker 与 FluentRead 的关系，及域名、商店入口与 Google OAuth 的发行边界。
---

# 来源、许可证与独立发行

Wild Talker 是基于 [FluentRead](https://github.com/FluentRead/FluentRead) 的改进分支。浏览器双语显示、文档解析、多服务接入和阅读卡片的基础来自上游。Git 历史与上游贡献者保留；本项目不将这些继承功能写成原创。

**[源码仓库](https://github.com/YEMIN11238/wild-talker)** · **[安装包](https://github.com/YEMIN11238/wild-talker/releases/latest)** · **[GPL-3.0](https://github.com/YEMIN11238/wild-talker/blob/main/LICENSE)** · **[第三方声明](https://github.com/YEMIN11238/wild-talker/tree/main/public/third-party-notices)**

## 独立入口

本产品展示页使用 `https://yemin11238.github.io/wild-talker/`；继承的 `read.thinkstu.com` CNAME 已移除，不绑定上游域名。产品首页、下载、问题反馈和文档导航指向本项目。来源说明中的 FluentRead 链接明确用于致谢与核对上游。

Wild Talker 目前以 Chrome / Edge 桌面 ZIP 发行，尚无独立的商店、CRX 镜像或 Greasy Fork 安装条目。本页不将 FluentRead 的商店条目当成 Wild Talker 的安装入口。其余平台的源码和历史指南保留为继承参考，未经本次设备验证的能力不作为当前发行承诺。

## Google OAuth 沿用配置的限制

首次翻译不需要 Google 登录。发布版保留了上游的 Google OAuth 客户端 ID 和扩展公钥，以保持现有安装身份与配置兼容。**这些是上游公开应用标识，不是 Wild Talker 自有、已独立验证的 Google OAuth 应用。** 公钥和客户端 ID 不属于用户的私密 API Key。

本次首次安装验证不包含 Google Drive 授权、同步或 OAuth 审核，不能据此宣称独立 Google Drive 同步可用。设置页的可用性检查可能因扩展 ID 与 OAuth 客户端不匹配而拒绝授权。需要备份时可先使用本地导出；不要在公开问题中附上完整备份。

开发者准备独立发行时，应在自己的 Google Cloud 项目创建适配实际扩展 ID 的 OAuth 客户端，核对权限、同意屏幕和隐私说明，使用 `.env.local` 的 `WXT_GOOGLE_CLIENT_ID` 指定公开客户端 ID，必要时通过 `WXT_EXTENSION_KEY` 设置自己的扩展公钥，然后单独完成授权与备份验证。更改公钥会影响扩展 ID 和本地数据身份，应先明确迁移方案；本次展示改造不修改已发布包的这些默认值。

内部 `fluentread-` DOM 前缀、备份文件名和构建目录仍可保留，用于兼容与避免污染宿主网页；它们不代表产品跳转到上游入口。

## 开发与来源资料

- [本分支开发与验证文档](https://github.com/YEMIN11238/wild-talker/blob/main/docs/maintainers/wild-talker-development.md)
- [上游贡献历史](https://github.com/FluentRead/FluentRead/graphs/contributors)
- [本仓库提交历史](https://github.com/YEMIN11238/wild-talker/commits/main/)

保留的 `docs/reports`、`docs/maintainers` 包含上游历史验证记录与旧域名说明，不是本次公开站点的新验证结果，也不会作为产品页面发布。
