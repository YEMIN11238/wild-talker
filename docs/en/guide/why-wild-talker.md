---
title: Why use Wild Talker?
description: Selection context, three prompt presets and bounded document recovery, with their activation conditions and limits.
---

# Why use Wild Talker?

Wild Talker keeps FluentRead's bilingual display, document parsing, service integrations and reading-card foundation. This branch focuses on three improvements; it does not claim guaranteed accuracy gains over upstream.

## Reference the selected text's paragraph

For ordinary selection translation, enable **AI context** and select a provider that supports the contextual prompt. The branch may supply up to **500 characters** from the selected text's prose paragraph as reference; the selected text remains the translation target. **This 500-character limit covers the newly added paragraph reference, not the whole AI-context request.** The inherited AI-context chain can also send a page summary and readable page content. Enabling this switch does not mean only the selected paragraph is sent.

The reading card has separate **paragraph reference / selection only** preferences and a context-length limit. These control the explanation request, not the ordinary translation context switch. Configure a supported AI service and enable the reading card first.

<figure class="doc-figure"><a href="/showcase/selection-context.png"><img class="doc-screenshot" src="/showcase/selection-context.png" width="2560" height="1626" alt="Release-build contextual selection" /></a><figcaption>See the first-use record for the exact selected text, provider and output.</figcaption></figure>

The [verification record](/en/guide/first-use-verification) distinguishes the selected request target, reference material and actual model output. Providing context is not proof that a model always resolves meaning correctly. A small model can add explanations, omit text or expand to the paragraph. When prose cannot be safely located or has changed, the request falls back to the selection.

## Three translation prompt presets

Open **Settings → Translation providers → configured AI provider → Prompts**, then actively choose a preset. It changes the current provider's system/user prompts, not the model or default provider. Prompts remain editable; copying to all providers requires a separate confirmation.

| Preset | Example use | Requested behavior |
| --- | --- | --- |
| Natural reading | Narrative paragraphs | Natural target-language phrasing while retaining meaning, tone and uncertainty |
| Technical documentation | `--timeout`, API names, quantities or conditions | Preserve identifiers and code; express terminology, requirements and warnings precisely |
| Faithful translation | Compare “may” with “must” | Retain wording, qualifications, negation and logical relations without resolving ambiguity |

These are illustrative requirements, not invented provider output. The [verification record](/en/guide/first-use-verification) documents actual activation and request checks. Machine translation endpoints do not gain AI prompting abilities from these presets. Quality depends on the model and source.

## Bounded recovery for document formatting failures

A user reading the public MiMo technical report encountered a glossary-protection failure at segment 55. This branch adds bounded recovery for this specific error class: failed grouped requests can fall back to individual segments; eligible plain-text segments can be retried through sentence chunks. Strict validation still applies, and a complete segment is committed only after every part succeeds.

<figure class="doc-figure"><a href="/showcase/document-reader.png"><img class="doc-screenshot" src="/showcase/document-reader.png" width="2560" height="1626" alt="Release-build bilingual document reader" /></a><figcaption>Ordinary document reading and error-recovery verification are recorded separately.</figcaption></figure>

This recovery is automatic for the eligible document error. Completed results remain available. Persistent failures are still reported, and you can correct the service and continue. Authentication, rate limits, cancellation and pause are not errors that can be bypassed by accepting unchecked formatting.

The earlier controlled MiMo text/segment-55 reproduction checked request degradation, strict validation and recovery. It did not rerun or guarantee the entire report against a real cloud model. See the [current verification record](/en/guide/first-use-verification) for the new document scenario and limits. Scans, formulas, complex tables and layout may require correction.

## What comes from upstream?

Page detection, bilingual DOM display, parsing, existing provider integrations and the reading-card foundation come from FluentRead. Source attribution, Git history, GPL-3.0 and third-party notices remain. Historical feature guides are labeled inherited references; their old illustrations are not current-release screenshots.

[Install](/en/guide/getting-started) · [Verification](/en/guide/first-use-verification) · [Source and OAuth identity](/en/guide/oauth-and-source)
