---
title: Provenance & independent distribution
description: The FluentRead relationship, licensing, distribution links and inherited OAuth identity.
---

# Provenance & independent distribution

Wild Talker is an improvement branch of [FluentRead](https://github.com/FluentRead/FluentRead). The bilingual display, document parsing, provider integrations and reading-card foundation come from upstream. Git history and contributor attribution are retained; inherited features are not presented as original work.

**[Source](https://github.com/YEMIN11238/wild-talker)** · **[Download](https://github.com/YEMIN11238/wild-talker/releases/latest)** · **[GPL-3.0](https://github.com/YEMIN11238/wild-talker/blob/main/LICENSE)** · **[Third-party notices](https://github.com/YEMIN11238/wild-talker/tree/main/public/third-party-notices)**

## Independent entry points

The product site is `https://yemin11238.github.io/wild-talker/`. The inherited `read.thinkstu.com` CNAME has been removed. Product navigation, downloads and feedback point to this project. FluentRead links in provenance material are clearly labeled as upstream references.

The current package is a desktop Chrome / Edge ZIP. There is no independent Wild Talker extension-store, CRX mirror or Greasy Fork listing. Upstream store listings are not Wild Talker installation links. Other platform source and historical guides remain inherited references; untested devices are not included in the current verification claim.

## Google Drive is disabled by default

Translation does not require Google sign-in. Current source builds omit Google OAuth and the `identity` permission by default. Settings explain that no owned OAuth application is configured and hide sync and cloud-delete actions. The extension public key remains unchanged for installation and local-data compatibility; it is not a private user API key.

The earlier `v0.0.38-wild-talker.1` release still contains the inherited upstream OAuth identity. This audit corrects that behavior in source; the old clickable entry did not establish that independent cloud sync worked. Actual authorization, cloud reads/writes and OAuth review remain unverified. Use local backup or configure your own WebDAV endpoint. Do not upload complete backups publicly.

To enable Drive, create an OAuth client in your own Google Cloud project for the actual extension ID. Review permissions, the consent screen and privacy disclosures. Set your public client ID using `WXT_GOOGLE_CLIENT_ID` in `.env.local`, then separately verify authorization and backup. Blank values and the inherited upstream client do not enable sync. Change `WXT_EXTENSION_KEY` only when needed, with a migration plan, because it changes extension and local-data identity.

Internal `fluentread-` DOM prefixes, backup filenames and build paths remain for compatibility and isolation; they do not redirect users to upstream product pages.

## Developer and provenance material

- [This branch's development & verification guide](https://github.com/YEMIN11238/wild-talker/blob/main/docs/maintainers/wild-talker-development.md)
- [Upstream contributors](https://github.com/FluentRead/FluentRead/graphs/contributors)
- [This repository's history](https://github.com/YEMIN11238/wild-talker/commits/main/)

Retained `docs/reports` and `docs/maintainers` contain upstream historical records and old domain instructions. They are not newly verified product material and are excluded from the public product site.
