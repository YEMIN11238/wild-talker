---
title: ZIP installation & upgrades
description: Install the Wild Talker Chrome / Edge ZIP and update the same directory.
---

# ZIP installation & upgrades

**[Download the Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/latest)** and follow [the first-use guide](/en/guide/getting-started). This repository's Release is the current independent distribution. FluentRead store, CRX mirror and script-store listings install the upstream product.

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
| Extension manager / manifest version | `0.0.37` |
| GitHub release tag | `v0.0.37-wild-talker.1` |
| Package | Chrome / Edge MV3 ZIP |

This presentation/documentation update does not change the runtime or ZIP. Future changed packages will list the numeric version, tag and checksum in their Release rather than relying on filenames alone.
