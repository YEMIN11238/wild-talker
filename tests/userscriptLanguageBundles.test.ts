import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {afterEach, describe, expect, it, vi} from 'vitest';
// 脚本发布的语言资源不含智能高亮文案；摘要必须按脚本实际使用的投影计算。
import {UI_LANGUAGE_BUNDLES} from '../userscript/languageBundles';
import {UI_LANGUAGE_BUNDLES as extensionBundles} from '@/src/core/i18n/bundles';
import {ungzip} from 'pako';
import type {UiLanguage, UiLanguageBundle} from '@/src/core/i18n';
import userscriptConfig from '../userscript/vite.config';

const languageDir = resolve(process.cwd(), 'userscript/languages');
const digest = createHash('sha256').update(JSON.stringify(UI_LANGUAGE_BUNDLES['fr-FR'])).digest('hex').slice(0, 16);
const fileName = `fr-FR.${digest}.json`;
const source = readFileSync(resolve(languageDir, fileName), 'utf8');
const resourceCommit = '70d3d901033a579e32a5bf5e6af14555f0d140bb';

describe('userscript remote UI language data', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.resetModules();
        globalThis.GM = undefined;
    });

    it('registers the English bundle supplied by the pinned data resource without a network request', async () => {
        for (const bundle of Object.values(UI_LANGUAGE_BUNDLES)) {
            expect(bundle.messages).not.toHaveProperty('popup.compact.translate');
            expect(bundle.messages).not.toHaveProperty('popup.compact.restore');
            expect(bundle.messages['popup.translateCurrentPage']).toBeTruthy();
        }
        const requests: string[] = [];
        globalThis.GM = {
            xmlHttpRequest(details) { requests.push(details.url); throw new Error('unexpected request'); },
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', {english: UI_LANGUAGE_BUNDLES['en-US']});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {});

        const {hasUiLanguageBundle} = await import('@/src/core/i18n');
        expect(hasUiLanguageBundle('en-US')).toBe(false);
        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle('en-US')).resolves.toBe(true);
        expect(hasUiLanguageBundle('en-US')).toBe(true);
        expect(requests).toEqual([]);
    });

    it('registers the actual compressed English define without a GM request and preserves retained copy', async () => {
        const requests: string[] = [];
        globalThis.GM = {
            xmlHttpRequest(details) { requests.push(details.url); throw new Error('unexpected request'); },
        };
        const defines = (userscriptConfig as {define: Record<string, string>}).define;
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__));
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__));
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__));
        // 确定走现有 pako fallback；此处不要求测试 DOM 环境提供浏览器原生 gzip stream。
        vi.stubGlobal('DecompressionStream', undefined);
        vi.stubGlobal('pako', {ungzip});
        const original = UI_LANGUAGE_BUNDLES['en-US'];
        const messages = Object.fromEntries(Object.entries(original.messages).filter(([key]) => !key.startsWith('document.')));
        const expected = {...original, messages};
        const core = await import('@/src/core/i18n');
        expect(core.hasUiLanguageBundle('en-US')).toBe(false);
        const register = vi.spyOn(core, 'registerUiLanguageBundle');
        try {
            const loader = await import('@/userscript/uiLanguageBundles');
            await expect(loader.ensureUiLanguageBundle('en-US')).resolves.toBe(true);
            expect(core.hasUiLanguageBundle('en-US')).toBe(true);
            expect(register).toHaveBeenCalledTimes(1);
            expect(register).toHaveBeenCalledWith('en-US', expected);
            // 对实际注册后的每一条保留稳定 key 使用核心翻译入口，包含参数占位文案。
            for (const [key, value] of Object.entries(messages)) expect(core.translate(key, 'en-US')).toBe(value);
            expect(original.legacyText['配置服务']).toBeTruthy();
            expect(core.translateLegacyText('配置服务', 'en-US')).toBe(original.legacyText['配置服务']);
            expect(core.translateLegacyText('翻译连接：Google；自定义服务：2；凭据和地址已隐藏', 'en-US'))
                .toBe('Connection: Google; custom services: 2; credentials and addresses hidden');
            await expect(loader.ensureUiLanguageBundle('en-US')).resolves.toBe(true);
            expect(register).toHaveBeenCalledTimes(1);
            expect(requests).toEqual([]);
        } finally {
            register.mockRestore();
        }
    });

    it.each(Object.keys(UI_LANGUAGE_BUNDLES))('registers %s from the same-build readable resource without fetching an upstream URL', async language => {
        const requests: string[] = [];
        globalThis.GM = {xmlHttpRequest(details) {requests.push(details.url);throw Error('unexpected upstream language request');}};
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', {languageBundles: UI_LANGUAGE_BUNDLES});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {});
        const core = await import('@/src/core/i18n');
        const register = vi.spyOn(core, 'registerUiLanguageBundle');
        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle(language)).resolves.toBe(true);
        expect(core.hasUiLanguageBundle(language as UiLanguage)).toBe(true);
        const original = UI_LANGUAGE_BUNDLES[language as keyof typeof UI_LANGUAGE_BUNDLES];
        const [registeredLanguage, registeredBundle] = register.mock.calls[0];
        expect(registeredLanguage).toBe(language);
        expect(registeredBundle.legacyText).toEqual(original.legacyText);
        expect(registeredBundle.legacyPatterns).toEqual(original.legacyPatterns);
        for (const [key, value] of Object.entries(original.messages)) expect(registeredBundle.messages[key]).toBe(value);
        expect(Object.keys(registeredBundle.messages).sort()).toEqual([...new Set([...Object.keys(original.messages), 'learning.panelLoadError', 'learning.reloadPage'])].sort());
        expect(registeredBundle.messages['learning.panelLoadError']).toBeTruthy();
        expect(registeredBundle.messages['learning.reloadPage']).toBeTruthy();
        expect(requests).toEqual([]);
        register.mockRestore();
    });

    it.each(['ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'] as const)('applies the actual build patch to published %s data and its offline cache, registering exactly the current projection', async language => {
        const defines = (userscriptConfig as {define: Record<string, string>}).define;
        const files = JSON.parse(defines.__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__);
        const remoteFile = files[language];
        const baseline = readFileSync(resolve(languageDir, remoteFile), 'utf8');
        const original = JSON.parse(baseline);
        const values = new Map<string, unknown>(), requests: string[] = [];
        globalThis.GM = {
            async getValue(key, fallback) {return values.get(key) ?? fallback;},
            async setValue(key, value) {values.set(key, value);},
            xmlHttpRequest(details) {requests.push(details.url);return Promise.resolve({status: 200, responseText: baseline});},
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__));
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', files);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__));
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__', JSON.parse(defines.__FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__));
        vi.stubGlobal('DecompressionStream', undefined);vi.stubGlobal('pako', {ungzip});
        const current = UI_LANGUAGE_BUNDLES[language];
        const messages = {...Object.fromEntries(Object.entries(current.messages).filter(([key]) => !key.startsWith('document.'))),
            'learning.panelLoadError': extensionBundles[language].messages['learning.panelLoadError'],
            'learning.reloadPage': extensionBundles[language].messages['learning.reloadPage']};
        const expected = {...current, messages};
        async function loadAndCheck() {
            const core = await import('@/src/core/i18n'), register = vi.spyOn(core, 'registerUiLanguageBundle');
            try {
                const loader = await import('@/userscript/uiLanguageBundles');
                await expect(loader.ensureUiLanguageBundle(language)).resolves.toBe(true);
                expect(register).toHaveBeenCalledWith(language, expected);
                expect(register.mock.calls[0][1]).toEqual(expected);
                expect(core.translate('settings.services.prompts.presetNatural', language)).toBe(current.messages['settings.services.prompts.presetNatural']);
                for (const [key, value] of Object.entries(messages)) expect(core.translate(key, language)).toBe(value);
            } finally {register.mockRestore();}
        }
        await loadAndCheck();
        expect(requests).toHaveLength(1);
        expect(requests[0]).toContain(`@240cbc42de9d1141c679fb595afea055397ac656/userscript/languages/${remoteFile}`);
        expect(values.get(`fluentread:ui-language:${remoteFile}`)).toBe(JSON.stringify(original));
        vi.resetModules();globalThis.GM.xmlHttpRequest = () => {throw Error('offline');};
        await loadAndCheck();
        expect(requests).toHaveLength(1);
        expect(values.get(`fluentread:ui-language:${remoteFile}`)).toBe(JSON.stringify(original));
        expect(readFileSync(resolve(languageDir, remoteFile), 'utf8')).toBe(baseline);
    });

    it('downloads a generated language resource once and loads it from private GM cache next time', async () => {
        const values = new Map<string, unknown>();
        const requests: string[] = [];
        globalThis.GM = {
            async getValue(key, fallback) { return values.get(key) ?? fallback; },
            async setValue(key, value) { values.set(key, value); },
            xmlHttpRequest(details) {
                requests.push(details.url);
                return Promise.resolve({status: 200, statusText: 'OK', responseText: source});
            },
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', resourceCommit);

        const first = await import('@/userscript/uiLanguageBundles');
        await expect(first.ensureUiLanguageBundle('fr-FR')).resolves.toBe(true);
        expect(requests).toEqual([
            `https://cdn.jsdelivr.net/gh/FluentRead/FluentRead@${resourceCommit}/userscript/languages/${fileName}`,
        ]);
        expect(values.has(`fluentread:ui-language:${fileName}`)).toBe(true);

        vi.resetModules();
        globalThis.GM.xmlHttpRequest = () => { throw new Error('offline'); };
        const cached = await import('@/userscript/uiLanguageBundles');
        await expect(cached.ensureUiLanguageBundle('fr-FR')).resolves.toBe(true);
        expect(requests).toHaveLength(1);
    });

    it('tries raw GitHub when the CDN is unavailable', async () => {
        const requests: string[] = [];
        globalThis.GM = {
            async getValue(_key, fallback) { return fallback; },
            async setValue() {},
            xmlHttpRequest(details) {
                requests.push(details.url);
                return requests.length === 1
                    ? Promise.reject(new Error('CDN unavailable'))
                    : Promise.resolve({status: 200, statusText: 'OK', responseText: source});
            },
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', resourceCommit);

        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(true);
        expect(requests).toEqual([
            `https://cdn.jsdelivr.net/gh/FluentRead/FluentRead@${resourceCommit}/userscript/languages/${fileName}`,
            `https://raw.githubusercontent.com/FluentRead/FluentRead/${resourceCommit}/userscript/languages/${fileName}`,
        ]);
    });

    it.each(['ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'] as const)('localizes recovery copy after loading pinned %s data and after an offline cache reload', async language => {
        const digest = createHash('sha256').update(JSON.stringify(UI_LANGUAGE_BUNDLES[language])).digest('hex').slice(0, 16);
        const remoteFile = `${language}.${digest}.json`;
        const remoteSource = readFileSync(resolve(languageDir, remoteFile), 'utf8');
        const original = JSON.parse(remoteSource);
        expect(original.messages).not.toHaveProperty('learning.panelLoadError');
        expect(original.messages).not.toHaveProperty('learning.reloadPage');
        const values = new Map<string, unknown>();
        const requests: string[] = [];
        globalThis.GM = {
            async getValue(key, fallback) { return values.get(key) ?? fallback; },
            async setValue(key, value) { values.set(key, value); },
            xmlHttpRequest(details) {
                requests.push(details.url);
                return Promise.resolve({status: 200, statusText: 'OK', responseText: remoteSource});
            },
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {[language]: remoteFile});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', resourceCommit);
        const recovery = {
            'learning.panelLoadError': extensionBundles[language].messages['learning.panelLoadError'],
            'learning.reloadPage': extensionBundles[language].messages['learning.reloadPage'],
        };
        async function assertLocalizedRegistration() {
            const core = await import('@/src/core/i18n');
            const register = vi.spyOn(core, 'registerUiLanguageBundle');
            try {
                const loader = await import('@/userscript/uiLanguageBundles');
                await expect(loader.ensureUiLanguageBundle(language)).resolves.toBe(true);
                expect(register).toHaveBeenCalledTimes(1);
                expect(register).toHaveBeenCalledWith(language, {
                    ...original, messages: {...recovery, ...original.messages},
                });
                for (const [key, text] of Object.entries(recovery)) {
                    expect(core.translate(key, language)).toBe(text);
                    expect(core.translate(key, language)).not.toBe(core.translate(key, 'zh-CN'));
                }
                await expect(loader.ensureUiLanguageBundle(language)).resolves.toBe(true);
                expect(register).toHaveBeenCalledTimes(1);
            } finally { register.mockRestore(); }
        }
        await assertLocalizedRegistration();
        expect(requests).toHaveLength(1);
        expect(values.get(`fluentread:ui-language:${remoteFile}`)).toBe(JSON.stringify(original));
        // 注册补充不写回固定资源或GM缓存；离线读取同一旧资源也应本地化。
        vi.resetModules();
        globalThis.GM.xmlHttpRequest = () => { throw new Error('offline'); };
        await assertLocalizedRegistration();
        expect(requests).toHaveLength(1);
        expect(values.get(`fluentread:ui-language:${remoteFile}`)).toBe(JSON.stringify(original));
        expect(readFileSync(resolve(languageDir, remoteFile), 'utf8')).toBe(remoteSource);
    });

    it('preserves recovery messages supplied by a remote bundle instead of replacing them with the local supplement', async () => {
        const original = JSON.parse(source);
        const messages = {...original.messages,
            'learning.panelLoadError': 'Remote section recovery', 'learning.reloadPage': 'Remote reload'};
        const supplied = {...original, messages};
        globalThis.GM = {
            async getValue() { return supplied; },
            xmlHttpRequest() { throw new Error('unexpected request'); },
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        const core = await import('@/src/core/i18n');
        const register = vi.spyOn(core, 'registerUiLanguageBundle');
        try {
            const loader = await import('@/userscript/uiLanguageBundles');
            await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(true);
            expect(register).toHaveBeenCalledTimes(1);
            expect(register).toHaveBeenCalledWith('fr-FR', supplied);
            expect(core.translate('learning.panelLoadError', 'fr-FR')).toBe('Remote section recovery');
            expect(core.translate('learning.reloadPage', 'fr-FR')).toBe('Remote reload');
            expect(supplied.messages).toEqual(messages);
        } finally { register.mockRestore(); }
    });

    it('applies changed, deleted and reordered fields without mutating the baseline or requiring every patch field', async () => {
        const baseline: UiLanguageBundle = {messages: {keep: 'Original', change: 'Before', remove: 'Old'},
            legacyText: {keep: 'Legacy original', change: 'Legacy before', remove: 'Legacy old'},
            legacyPatterns: {early: [['^first$', 'First'], ['^second$', 'Second', [1]]],
                late: [['^old$', 'Old'], ['^retained$', 'Retained']]}};
        const snapshot = JSON.stringify(baseline);
        const patches = {
            'fr-FR': {messages: {set: {change: 'After', new: 'Added'}, remove: ['remove']},
                legacyText: {set: {change: 'Legacy after'}, remove: ['remove']},
                legacyPatterns: {early: [1, ['^new$', 'New']], late: [1]}},
            'ko-KR': {messages: {set: {change: 'Korean override'}}},
            'ja-JP': {},
            'ru-RU': {legacyPatterns: {early: []}},
        };
        const inflate = vi.fn(ungzip);
        globalThis.GM = {async getValue() {return baseline;}, xmlHttpRequest() {throw Error('cached resource must not fetch');}};
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', Object.fromEntries(['fr-FR', 'ko-KR', 'ja-JP', 'ru-RU', 'es-ES'].map(language => [language, `${language}.baseline.json`])));
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__', gzipSync(JSON.stringify(patches)).toString('base64'));
        vi.stubGlobal('DecompressionStream', undefined);vi.stubGlobal('pako', {ungzip: inflate});
        const core = await import('@/src/core/i18n'), register = vi.spyOn(core, 'registerUiLanguageBundle');
        const loader = await import('@/userscript/uiLanguageBundles');
        for (const language of ['fr-FR', 'ko-KR', 'ja-JP', 'ru-RU', 'es-ES'] as const) {
            await expect(loader.ensureUiLanguageBundle(language)).resolves.toBe(true);
            const registered = register.mock.calls.find(([value]) => value === language)![1];
            const supplement = {'learning.panelLoadError': extensionBundles[language].messages['learning.panelLoadError'],
                'learning.reloadPage': extensionBundles[language].messages['learning.reloadPage']};
            const expected = language === 'fr-FR'
                ? {messages: {keep: 'Original', change: 'After', new: 'Added'}, legacyText: {keep: 'Legacy original', change: 'Legacy after'},
                    legacyPatterns: {early: [baseline.legacyPatterns.early[1], ['^new$', 'New']], late: [baseline.legacyPatterns.late[1]]}}
                : {...baseline, messages: language === 'ko-KR' ? {...baseline.messages, change: 'Korean override'} : baseline.messages,
                    legacyPatterns: language === 'ru-RU' ? {...baseline.legacyPatterns, early: []} : baseline.legacyPatterns};
            expect(registered).toEqual({...expected, messages: {...supplement, ...expected.messages}});
        }
        expect(inflate).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(baseline)).toBe(snapshot);
    });

    it.each([
        null, [], {}, {messages: []}, {messages: {invalid: 1}},
        {messages: {}, legacyText: []}, {messages: {}, legacyText: {invalid: false}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [], late: 'invalid'}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [null], late: []}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [[1, 'text']], late: []}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [['pattern', 1]], late: []}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [['pattern', 'text', 'invalid']], late: []}},
        {messages: {}, legacyText: {}, legacyPatterns: {early: [['pattern', 'text', [0.5]]], late: []}},
    ])('rejects malformed same-build data without registering it (%#)', async invalid => {
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', {languageBundles: {'fr-FR': invalid}});
        // A falsy embedded entry must still take the selected compressed path and be validated.
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {'fr-FR': gzipSync(JSON.stringify(invalid)).toString('base64')});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {});
        vi.stubGlobal('DecompressionStream', undefined);vi.stubGlobal('pako', {ungzip});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const core = await import('@/src/core/i18n'), register = vi.spyOn(core, 'registerUiLanguageBundle');
        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(false);
        expect(core.hasUiLanguageBundle('fr-FR')).toBe(false);
        expect(register).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledOnce();
    });

    it.each([{legacyPatterns: {early: [999999]}}, {messages: {set: {invalid: 1}}}])('rejects a patch that cannot produce a valid bundle (%#)', async patch => {
        globalThis.GM = {async getValue() {return JSON.parse(source);}, xmlHttpRequest() {throw Error('unexpected request');}};
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__', gzipSync(JSON.stringify({'fr-FR': patch})).toString('base64'));
        vi.stubGlobal('DecompressionStream', undefined);vi.stubGlobal('pako', {ungzip});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const core = await import('@/src/core/i18n'), register = vi.spyOn(core, 'registerUiLanguageBundle');
        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(false);
        expect(register).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledOnce();
    });

    it('reports exhausted mirrors and permits retry even when GM cache operations fail', async () => {
        const requests: string[] = [];
        globalThis.GM = {
            async getValue() {throw Error('GM read unavailable');}, async setValue() {throw Error('GM write unavailable');},
            xmlHttpRequest(details) {requests.push(details.url);return Promise.resolve(requests.length === 1
                ? {status: 503, responseText: ''} : {status: 200, responseText: '{"messages":{}}'});},
        };
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', resourceCommit);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__', '');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const core = await import('@/src/core/i18n'), register = vi.spyOn(core, 'registerUiLanguageBundle');
        const loader = await import('@/userscript/uiLanguageBundles');
        await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(false);
        expect(requests).toHaveLength(2);expect(warn).toHaveBeenCalledOnce();expect(register).not.toHaveBeenCalled();
        globalThis.GM.getValue = async () => null;
        globalThis.GM.xmlHttpRequest = details => {requests.push(details.url);return Promise.resolve({status: 200, responseText: source});};
        await expect(loader.ensureUiLanguageBundle('fr-FR')).resolves.toBe(true);
        expect(requests).toHaveLength(3);expect(register).toHaveBeenCalledOnce();
        expect(core.translate('learning.reloadPage', 'fr-FR')).toBe(extensionBundles['fr-FR'].messages['learning.reloadPage']);
    });

    it('shares pending loads, renders immediately and rerenders only after a successful registration', async () => {
        let complete!: (value: {status: number; responseText: string}) => void;
        const request = vi.fn(() => new Promise<{status: number; responseText: string}>(resolve => {complete = resolve;}));
        globalThis.GM = {async getValue() {return null;}, async setValue() {}, xmlHttpRequest: request};
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_DATA__', undefined);
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__', {});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__', {'fr-FR': fileName});
        vi.stubGlobal('__FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__', resourceCommit);
        const loader = await import('@/userscript/uiLanguageBundles');
        const render = vi.fn();loader.renderWithUiLanguageBundle('fr-FR', render);
        const first = loader.ensureUiLanguageBundle('fr-FR'), second = loader.ensureUiLanguageBundle('fr-FR');
        expect(first).toBe(second);expect(render).toHaveBeenCalledOnce();
        await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
        complete({status: 200, responseText: source});await expect(first).resolves.toBe(true);
        await vi.waitFor(() => expect(render).toHaveBeenCalledTimes(2));
        const loadedRender = vi.fn();loader.renderWithUiLanguageBundle('fr-FR', loadedRender);expect(loadedRender).toHaveBeenCalledOnce();
        const unsupportedRender = vi.fn();loader.renderWithUiLanguageBundle('en-US', unsupportedRender);
        await expect(loader.ensureUiLanguageBundle('en-US')).resolves.toBe(false);
        await Promise.resolve();expect(unsupportedRender).toHaveBeenCalledOnce();expect(request).toHaveBeenCalledOnce();
    });

});
