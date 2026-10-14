---
title: ZIP installation & upgrades
description: Install the Wild Talker Chrome / Edge ZIP and update the same directory.
---

# ZIP installation & upgrades

**[Download the Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)** and follow [the first-use guide](/en/guide/getting-started). This repository's Release is the current independent distribution. FluentRead store, CRX mirror and script-store listings install the upstream product.

## Choose the correct folder

```text
permanent-extraction-folder/
└── chrome-mv3/                ← load this folder
    ├── manifest.json
    ├── background.js
    ├── assets/
    └── ...
```

Other files can change between builds. The rule is always **select the folder directly containing manifest.json**. Do not load the source archive or the still-compressed ZIP.

## Upgrade an existing installation

1. Export necessary settings from **Settings → Backup & restore**. A backup can include keys or private records; do not upload it publicly.
2. Download the new package from [this repository's Release](https://github.com/YEMIN11238/wild-talker/releases/latest) and read its version mapping and upgrade notes.
3. Keep a copy of the old folder, then replace its contents with the new package. Reuse the original loaded directory and avoid duplicate installations.
4. Open `chrome://extensions/` or `edge://extensions/` and select Wild Talker's **Reload** action.
5. Check the name and version, then refresh webpages and any already-open settings or document tabs.

Unpacked installations do not receive automatic store updates. Keeping the directory and manifest key/ID usually preserves local settings; a new directory, uninstall/reinstall or changed public key can change installation identity, so back up first.

## Identify the current version

| Item | Current release |
| --- | --- |
| Product | Wild Talker |
| Extension manager / manifest version | `0.0.38` |
| GitHub release tag | `v0.0.38-wild-talker.1` |
| Package | Chrome / Edge MV3 ZIP |

Version **0.0.38** changes the fresh-install default to light. Saved `dark` / `auto` preferences are preserved during upgrades. To keep an old installation light, choose **Settings → General settings → Interface theme → Light** once; you can still manually choose **Follow operating system**. Reload the extension and existing tabs, then check the version. See [the theme fix and its verification scope](/en/guide/theme-default-fix).

Earlier 0.0.37 screenshots and model examples remain labeled with their original version; they are not new translation evidence for 0.0.38.
