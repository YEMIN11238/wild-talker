---
title: Light default & upgrade notes
description: Version 0.0.38 defaults fresh installations to light while keeping saved dark/system preferences.
---

# Light default & upgrade notes

**[Download the 0.0.38 Chrome / Edge ZIP](https://github.com/YEMIN11238/wild-talker/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip)** · [Installation guide](/en/guide/getting-started) · [Release notes](https://github.com/YEMIN11238/wild-talker/releases/tag/v0.0.38-wild-talker.1)

Version `0.0.37` defaulted fresh installations to **Follow operating system**. On a dark system, the popup, settings and document interface used the dark theme, which could differ from the light screenshots.

Version `0.0.38` defaults installations without a saved theme to **Light**. Missing or invalid theme values also fall back to light; following the system requires an explicitly saved `auto` value. Extension version **0.0.38** corresponds to release tag **v0.0.38-wild-talker.1** and package **wild-talker-0.0.38-chrome-edge.zip**.

## Existing installations

Upgrades keep saved `dark` and `auto` values, including an `auto` value previously saved by the old default. They are not forcibly replaced.

1. Export necessary settings and replace files in the original extension directory.
2. Select Wild Talker's **Reload** action at `chrome://extensions/` or `edge://extensions/` and confirm version **0.0.38**.
3. To stay light, choose **Settings → General settings → Interface theme → Light** once.
4. Refresh already-open popup, settings and document pages.

You can still deliberately choose **Dark** or **Follow operating system**. Saved preferences remain in use. The theme affects the extension interface, not the original webpage's colors.

## Media and verification scope

The homepage and first-translation screenshots/recording were made with `0.0.37`. The `0.0.38` layout is retained; this release fixes the theme default. Earlier media and model outputs remain attributed to [the 0.0.37 first-use verification](/en/guide/first-use-verification).

On October 14, 2026, the actual frozen `0.0.38` package was checked for fresh-install behavior and saved preferences. Dark/light system preferences were reproduced using browser CDP `prefers-color-scheme` emulation; native operating-system appearance was not changed.

| Browser and mode | Actual scope | Result |
| --- | --- | --- |
| Chrome for Testing `151.0.7922.34`, visible macOS background window | 10 cases: fresh popup/settings/document home/text-PDF reader, manual light/dark/system preferences and two actual process restarts | All passed, 0 page errors; saved `dark` / `auto` values persisted |
| Microsoft Edge `155.0.4283.45`, headless | Complete 10-case run, including two actual process restarts | All passed, 0 page errors; saved `dark` / `auto` values persisted |
| Same Edge version, visible window | Initial 4 cases, including fresh light surfaces, text PDF and explicit dark checks | Passed; full restart persistence was verified by the headless run above |

The visible Edge restart attempt triggered the focus guard and was stopped. The complete run then used the actual Edge executable in headless mode; its results are not presented as a full visible-window run. Restarts reused the same temporary profile and extension ID, reloading the same frozen directory. Test browsers and their temporary profiles were removed afterwards without accessing daily user profiles.

### New 0.0.38 installation screenshots

The four images below come from the visible Chrome background window with dark system-media preferences active. The extension remains light, and the popup displays **0.0.38**.

<figure class="doc-figure"><a href="/theme-default-fix/popup-system-dark.png"><img src="/theme-default-fix/popup-system-dark.png" width="360" height="600" alt="Fresh 0.0.38 light popup while system dark media is active" /></a><figcaption>The fresh popup stores light while dark media is active.</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/options-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/options-system-dark.png" width="2560" height="1626" alt="Fresh 0.0.38 light settings page" /></a><figcaption>General settings in the same fresh installation.</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/document-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/document-system-dark.png" width="2560" height="1626" alt="Fresh 0.0.38 light document home" /></a><figcaption>Document home in the same fresh installation.</figcaption></figure>

<figure class="doc-figure"><a href="/theme-default-fix/pdf-reader-system-dark.png"><img class="doc-screenshot" src="/theme-default-fix/pdf-reader-system-dark.png" width="2560" height="1626" alt="Light 0.0.38 reader after importing a public text PDF" /></a><figcaption>The imported public text-PDF reader stays light.</figcaption></figure>

<a href="/theme-default-fix/edge-headed/options-system-dark.png">Visible Edge settings screenshot</a> · <a href="/theme-default-fix/edge-headless/options-system-dark.png">Headless Edge settings screenshot</a> · <a href="/theme-default-fix/theme-browser-verification.json">Redacted verification summary and image checksums</a>

All 467 tested runtime files matched the ZIP individually. This checks theme defaults and explicit preference persistence only; earlier translation services or models were not rerun, and no translation-quality improvement is inferred. Windows, Linux and all browser distribution channels were not covered.

SHA-256 of the current ZIP:

```text
b03b1a0df5f951a7d072b6175838d4b00b7fde9e3a3b39542bca45c458e72b37
```

After extracting, load the **chrome-mv3** directory directly containing **manifest.json**. Keep the directory in place. You do not need to uninstall to change themes; uninstalling can remove local settings and learning records.
