# First-use verification and API example

The current release is `v0.0.37-wild-talker.1`; the extension manifest displays `0.0.37`. The Chrome / Edge ZIP was downloaded without signing in and checked against its published SHA-256. After extracting it, load the `chrome-mv3` directory, which directly contains `manifest.json`.

The screenshots and selection recording use the actual release with separate temporary browser profiles and public sample text. Microsoft web translation was tested without a personal AI key. AI context and prompt presets require an AI service; the real local compatibility test uses llama-server and a Qwen2.5 model, not a mocked model response. Smaller models may ignore the selected-text boundary or mistranslate an ambiguous word. API connectivity does not prove translation quality.

See the [detailed verified configuration, cases and limitations](../../guide/first-use-verification) for exact model and browser versions. The MiMo recovery case uses controlled failure responses to check strict validation and retained progress; the complete 44-page report was not rerun against a cloud model.
