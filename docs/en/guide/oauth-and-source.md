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

## Inherited Google OAuth identity

Translation does not require Google sign-in. The released package retains the upstream Google OAuth client ID and extension public key to preserve installation/configuration compatibility. **These are upstream public application identifiers, not an independently verified Wild Talker Google OAuth app.** They are not private user API keys.

This first-use verification does not test Google Drive authorization, sync or an OAuth review. The availability check can reject an extension ID that does not match its OAuth client. Use local configuration export when needed and do not upload complete backups publicly.

For independent distribution, create an OAuth client in your own Google Cloud project for the actual extension ID. Review permissions, the consent screen and privacy disclosures. Set the public client ID using `WXT_GOOGLE_CLIENT_ID` in `.env.local`, and your extension public key using `WXT_EXTENSION_KEY` if needed; then separately verify authorization and backup. Changing the key changes the extension ID/data identity and needs a migration plan. This presentation update does not change the released defaults.

Internal `fluentread-` DOM prefixes, backup filenames and build paths remain for compatibility and isolation; they do not redirect users to upstream product pages.

## Developer and provenance material

- [This branch's development & verification guide](https://github.com/YEMIN11238/wild-talker/blob/main/docs/maintainers/wild-talker-development.md)
- [Upstream contributors](https://github.com/FluentRead/FluentRead/graphs/contributors)
- [This repository's history](https://github.com/YEMIN11238/wild-talker/commits/main/)

Retained `docs/reports` and `docs/maintainers` contain upstream historical records and old domain instructions. They are not newly verified product material and are excluded from the public product site.
