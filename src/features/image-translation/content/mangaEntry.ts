/**
 * @file src/features/image-translation/content/mangaEntry.ts
 * 文件职责：将安静的独立漫画按钮和按需资源确认挂载到隔离 Shadow UI，并桥接真实会话、资源检查与持久偏好。
 * 主要内容：用地址识别阅读页，按悬浮球和站点显隐显示备用按钮，不自动弹出阅读面板；订阅会话和配置，同步插件主题与跨路由网站名称；订阅建立后立即登记清理，等待 UI 创建时卸载也即时退订；清理幂等且只清除自己的槽位，挂载所有权防止迟到实例回到页面或影响新入口。
 * 模块边界：仅编排 feature 内部 UI 与公共配置、浏览器消息端口，不下载模型、不实现翻译，宿主脚本不能通过合成 DOM 事件发起动作。
 */
import {reactive} from 'vue';
import browser from 'webextension-polyfill';
import type {ContentScriptContext} from 'wxt/utils/content-script-context';
import {createVueShadowUi, type VueShadowMount} from '@/src/platform/shadow-ui';
import type {ShadowRootContentScriptUi} from 'wxt/utils/content-script-ui/shadow-root';
import {config, requestConfigPatch, subscribeConfig} from '@/src/services/config/store';
import {isFloatingBallDisabledOnSite} from '@/src/core/site-rules/domain';
import {resolveMangaSite, resolveMangaSourceLanguage} from '@/src/core/config/manga';
import MangaEntry from '../ui/MangaEntry.vue';
import {subscribeMangaTranslation, toggleMangaTranslation} from './runtime';
import type {MangaTranslationStatus} from './mangaSession';
import {getMangaOcrEngine, getRequiredImageOcrLanguages, normalizeImageOcrLanguageCodes, type ImageOcrStatusResponse} from '../ocrLanguages';

let ui: ShadowRootContentScriptUi<VueShadowMount> | null = null;
let pending: Promise<void> | null = null;
let owner = 0;
let cleanup: (() => void) | undefined;
export function isMangaReaderPage(href = typeof location === 'undefined' ? '' : location.href): boolean {return !!resolveMangaSite(href, config.imageTranslationMangaSites);}
export function isImageTranslatorNeeded(): boolean {return config.on && (!config.disableImageTranslator || (config.imageTranslationMangaEnabled && isMangaReaderPage()));}

export function mountMangaEntry(ctx: ContentScriptContext, ports: {startAreaTranslation?: () => boolean | Promise<boolean>} = {}): Promise<void> {
    if (ui || pending) return pending ?? Promise.resolve();
    const request = ++owner;
    const status = reactive<MangaTranslationStatus>({available: false, active: false, pending: false, errors: 0});
    const sourceLanguage = () => resolveMangaSourceLanguage(location.href, config.from, config.imageTranslationMangaSites);
    const settings = reactive({sourceLanguage: sourceLanguage(), promptEnabled: config.imageTranslationMangaPromptEnabled, floatingBallVisible: !config.disableFloatingBall && !isFloatingBallDisabledOnSite(location.href, config.floatingBallDisabledDomains), to: config.to,
        service: config.imageTranslationService, downloadConfirmed: config.imageTranslationMangaDownloadConfirmed, animations: config.animations, theme: config.theme, toolsDisplay: config.floatingBallToolsDisplay ?? 'always', prefetchPages: config.imageTranslationMangaPrefetchPages});
    const page = reactive({site: resolveMangaSite(location.href, config.imageTranslationMangaSites)?.name ?? '', route: location.href});
    const sync = () => {Object.assign(settings, {sourceLanguage: sourceLanguage(), promptEnabled: config.imageTranslationMangaPromptEnabled, floatingBallVisible: !config.disableFloatingBall && !isFloatingBallDisabledOnSite(location.href, config.floatingBallDisabledDomains), to: config.to,
        service: config.imageTranslationService, downloadConfirmed: config.imageTranslationMangaDownloadConfirmed, animations: config.animations, theme: config.theme, toolsDisplay: config.floatingBallToolsDisplay ?? 'always', prefetchPages: config.imageTranslationMangaPrefetchPages});
        Object.assign(page, {site: resolveMangaSite(location.href, config.imageTranslationMangaSites)?.name ?? '', route: location.href});};
    const stopStatus = subscribeMangaTranslation(value => Object.assign(status, value));
    const stopConfig = subscribeConfig(sync);
    document.addEventListener('fluentread-route-change', sync);
    let removed = false;
    const remove = () => {
        if (removed) return;
        removed = true;
        stopStatus();stopConfig();document.removeEventListener('fluentread-route-change', sync);
        if (cleanup === remove) cleanup = undefined;
    };
    cleanup = remove;
    pending = createVueShadowUi(ctx, {name: 'fluent-read-manga-entry', hostId: 'fluent-read-manga-entry-container', component: MangaEntry, mode: 'closed',
        props: {status, settings, page,
            startAreaTranslation: async () => config.on && config.imageTranslationMangaEnabled && status.available && status.areaFallback === true
                && await (ports.startAreaTranslation?.() ?? false),
            toggle: () => {if (config.on && config.imageTranslationMangaEnabled) toggleMangaTranslation();},
            inspectResources: async () => {
                const sourceLanguage = resolveMangaSourceLanguage(location.href, config.from, config.imageTranslationMangaSites);
                const result = await browser.runtime.sendMessage({type: 'fluentReadMangaModelStatus'}) as {success?: boolean; ready?: boolean; inpaintingReady?: boolean; error?: string};
                if (!result?.success) throw new Error(result?.error || '阅读资源状态读取失败，请重试');
                if (getMangaOcrEngine(sourceLanguage) === 'tesseract') {
                    const status = await browser.runtime.sendMessage({type: 'fluentReadImageOcrStatus'}) as ImageOcrStatusResponse;
                    if (!status?.success) throw new Error(status?.error || '阅读资源状态读取失败，请重试');
                    const downloaded = new Set(normalizeImageOcrLanguageCodes(status.languages));
                    return result.inpaintingReady === true && getRequiredImageOcrLanguages(sourceLanguage).every(language => downloaded.has(language));
                }
                return result.ready === true && result.inpaintingReady === true;
            },
            persist: (patch: Record<string, unknown>) => requestConfigPatch(patch, message => browser.runtime.sendMessage(message)),
            openSettings: () => {void browser.runtime.sendMessage({type: 'openOptionsPage', section: 'settings-image-translation'}).catch(() => undefined);},
        },
    }).then(value => {if (request !== owner || !config.on || !config.imageTranslationMangaEnabled || !isMangaReaderPage()) {value.remove();remove();return;}
        // 与译图使用同一根层级，避免被 Pixiv 的 body 堆叠上下文压到译图下方。
        if (value.shadowHost) document.documentElement.appendChild(value.shadowHost);
        ui = value;})
        .catch(error => {remove();throw error;}).finally(() => {if (request === owner) pending = null;});
    return pending;
}
export function openMangaEntry(): boolean {
    const instance = ui?.mounted?.instance as {open?: () => void} | undefined;
    if (!instance?.open) return false;
    instance.open();return true;
}
export function unmountMangaEntry(): void {owner++;pending = null;cleanup?.();cleanup = undefined;ui?.remove();ui = null;}
