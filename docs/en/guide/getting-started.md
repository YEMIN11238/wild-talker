---
title: Your first translation with Wild Talker
description: Download the ZIP, load the folder containing manifest.json, choose a service and translate.
---

# Your first translation with Wild Talker

The current release is an unpacked desktop Chrome / Edge extension. Wild Talker does not currently have its own store listing.

## 1. Download

Download the **[0.0.38 Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)**, or open **[this release](https://github.com/YEMIN11238/wild-talker/releases/tag/v0.0.38-wild-talker.1)** and select the same package from Assets. Source code.zip is developer source, not a ready-to-load extension.

Extract it to a permanent folder. Open its **chrome-mv3** subfolder and find **manifest.json**: load the folder that directly contains this file, not the ZIP or an empty parent folder.

The browser shows extension version **0.0.38**, corresponding to release tag **v0.0.38-wild-talker.1**. A fresh 0.0.38 install defaults to light, even when the operating system is dark. Existing saved dark/system preferences remain; use **Settings → General settings → Interface theme → Light** once to change them. **Follow operating system** remains selectable. See [the theme fix](/en/guide/theme-default-fix).

The release tag distinguishes this fork; the browser manifest only supports numeric versions. Check the product name, tag and package together.

## 2. Load the extension

### Chrome

1. Enter `chrome://extensions/` in the address bar.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the folder containing **manifest.json**. Confirm the card says **Wild Talker** (or its Chinese localized name).
5. Pin it from the toolbar extension menu and refresh existing regular webpages.

<figure class="doc-figure"><a href="/showcase/install-chrome.png"><img class="doc-screenshot" src="/showcase/install-chrome.png" width="2560" height="1626" alt="Clean Chrome installation with developer mode and the Wild Talker card" /></a><figcaption>Installation screenshot recorded with 0.0.37 in an isolated Chrome profile; the same steps apply, and the current card should show 0.0.38.</figcaption></figure>

### Edge

1. Enter `edge://extensions/` in the address bar.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the folder containing **manifest.json** and check the product name and version.
5. Show its toolbar icon and refresh existing webpages.

<figure class="doc-figure"><a href="/showcase/install-edge.png"><img class="doc-screenshot" src="/showcase/install-edge.png" width="2544" height="1632" alt="Clean Edge installation with developer mode and the Wild Talker card" /></a><figcaption>Edge installation screenshot recorded with 0.0.37. Use the current Chrome / Edge MV3 ZIP and check version 0.0.38.</figcaption></figure>

If manifest.json is missing, check whether you downloaded the source archive or chose an extra parent folder. Keep the installed directory in place: the browser still reads it.

## 3. Choose a service

Open **Settings → Translation providers**. Ordinary webpage translation and basic selection translation can use built-in translation services without your own AI API. Public endpoints can fail because of network, regional restrictions or rate limits; no continued free availability is promised. Try a short paragraph first.

AI reading explanations and AI prompt presets require a compatible AI provider or a local model service. A chat subscription does not necessarily include API quota. Account requirements, pricing and data policies come from the provider.

For custom services, follow the **[verified API example](/en/guide/first-use-verification)**, enter the endpoint and model, and select **Check connection**. Keep keys out of screenshots. After checking, set it as default or assign it to the feature you need; selecting a provider in the directory alone does not change the default.

## 4. Translate for the first time

1. Open a normal foreign-language page such as [Example Domain](https://example.com/). Browser settings, extension management and store pages cannot be translated.
2. Open the extension, choose **Auto detect → Simplified Chinese**, and confirm the service.
3. Select **Translate** and wait for translations beneath the paragraphs. Scroll to translate more content.
4. Select **Restore original**. Change the language or provider, then translate again when needed.

<figure class="doc-figure"><a href="/showcase/web-bilingual.png"><img class="doc-screenshot" src="/showcase/web-bilingual.png" width="2560" height="1626" alt="Release-build bilingual webpage translation" /></a><figcaption>This screenshot records 0.0.37. See its original verification record for the actual browser and service used; it is not a new 0.0.38 translation test.</figcaption></figure>

Enable selection translation, select text, and click the entry next to it. To receive AI explanations, configure a supported AI service and enable the reading card first. **Paragraph reference** supplies limited context while the selected text remains the translation target.

## Next steps

- [Why Wild Talker](/en/guide/why-wild-talker): examples and activation conditions.
- [Offline installation & upgrades](/en/guide/offline-install).
- [Provenance & distribution](/en/guide/oauth-and-source): licensing and OAuth limits.
- [Report a problem](https://github.com/YEMIN11238/wild-talker/issues) with versions, a public URL and redacted screenshots.
