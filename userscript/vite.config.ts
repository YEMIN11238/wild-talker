import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {basename, dirname, resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {runInNewContext} from 'node:vm';
import vue from '@vitejs/plugin-vue';
import ts from 'typescript';
import {defineConfig, normalizePath, transformWithEsbuild, type Plugin} from 'vite';
import {createUserscriptMetadata} from './metadata';
import {createUserscriptCharacterDataCompressionPlugin} from './characterDataPlugin';
import {createUserscriptFrancDataCompressionPlugin} from './francDataPlugin';
import {createUserscriptTldtsDataCompressionPlugin} from './tldtsDataPlugin';
import {createUserscriptInlineCssCompressionPlugin} from './inlineCssPlugin';
import {createUserscriptServiceBrandIconsCompressionPlugin} from './serviceBrandIconsPlugin';
import {UI_LANGUAGE_BUNDLES, zhCNMessages} from './languageBundles';
import type {UiLanguageBundle} from '../src/core/i18n/types';

const root = resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    version: string;
    userscriptVersion: string;
};
const iconDataUrl = `data:image/png;base64,${fs.readFileSync(resolve(root, 'public/icon/64.png')).toString('base64')}`;
const bundleLibraries = process.env.FLUENTREAD_USERSCRIPT_STANDALONE === '1';
const greasyForkSource = process.env.FLUENTREAD_USERSCRIPT_GREASYFORK_SOURCE === '1';
const vendorUrl = process.env.FLUENTREAD_USERSCRIPT_VENDOR_URL;
const dataUrl = process.env.FLUENTREAD_USERSCRIPT_DATA_URL;
const allowedResourceUrl = (url: string | undefined) => Boolean(url && /^(?:https:\/\/|http:\/\/127\.0\.0\.1(?::\d+)?\/)/u.test(url));
if (greasyForkSource && (!allowedResourceUrl(vendorUrl) || !allowedResourceUrl(dataUrl))) {
    throw new Error('Greasy Fork source build requires vendor and data resource URLs');
}
const vendorGlobals: Record<string, string> = {
    ai: 'FluentReadUserscriptVendor.ai',
    '@ai-sdk/openai-compatible': 'FluentReadUserscriptVendor.openAICompatible',
    'crypto-js/sha256': 'FluentReadUserscriptVendor.sha256',
    'crypto-js/md5': 'FluentReadUserscriptVendor.md5',
    'crypto-js/hmac-sha256': 'FluentReadUserscriptVendor.hmacSha256',
    'crypto-js/aes': 'FluentReadUserscriptVendor.aes',
    'crypto-js/enc-utf8': 'FluentReadUserscriptVendor.encUtf8',
    'crypto-js/enc-base64': 'FluentReadUserscriptVendor.encBase64',
    'crypto-js/mode-ecb': 'FluentReadUserscriptVendor.modeEcb',
    'crypto-js/pad-pkcs7': 'FluentReadUserscriptVendor.padPkcs7',
    'dexie/dist/dexie.min.js': 'FluentReadUserscriptVendor.Dexie',
    'franc-min': 'FluentReadUserscriptVendor.francMin',
};
function installedVersion(name: string): string {
    const manifest = JSON.parse(fs.readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8')) as {version: string};
    return manifest.version;
}

// 脚本管理器在安装时缓存固定版本的通用库；仓库资源固定到已发布提交，更新资源时同步换提交。
const userscriptResourceCommit = '184a3d74f61b9d2a8d47080787f7e0180b98414d';
// 语言文件的内容哈希来自合并后的消息目录，固定到首次包含这些文件的提交。
const userscriptLanguageResourceCommit = '240cbc42de9d1141c679fb595afea055397ac656';
const uiRequires = [
    `https://cdn.jsdelivr.net/npm/vue@${installedVersion('vue')}/dist/vue.global.prod.js`,
    `https://cdn.jsdelivr.net/gh/FluentRead/FluentRead@${userscriptResourceCommit}/userscript/vueElementPlusBridge.v1.js`,
    `https://cdn.jsdelivr.net/npm/element-plus@${installedVersion('element-plus')}/dist/index.full.min.js`,
    `https://cdn.jsdelivr.net/npm/@element-plus/icons-vue@${installedVersion('@element-plus/icons-vue')}/dist/index.iife.min.js`,
    `https://cdn.jsdelivr.net/npm/tldts@${installedVersion('tldts')}/dist/index.umd.min.js`,
];
const userscriptRequires = bundleLibraries
    ? []
    : [...uiRequires, 'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako_inflate.min.js',
        ...(greasyForkSource ? [vendorUrl!, dataUrl!] : [])];
// 元数据与页面图标都内嵌本次构建的真实 PNG；个人版图标不冒用未发布资源地址。
const metadata = createUserscriptMetadata({version: packageJson.userscriptVersion,
    iconDataUrl, requires: userscriptRequires});
// 界面词典只按 key 查询，稳定排序把相似 key 聚在一起，提高静态 JSON 压缩率；数组顺序保持原样。
function serializeUiMessages(value: unknown): string {
    return JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : item);
}
// 文档翻译页面（含 PDF 阅读器）只存在于扩展里；中英内嵌词典使用同一页面能力裁剪。
function userscriptPageMessages<T extends Record<string, string>>(messages: T): T {
    return Object.fromEntries(Object.entries(messages).filter(([key]) => !key.startsWith('document.'))) as T;
}
// English 随脚本提供；五语复用固定已发布资源，当前差异随消费者内嵌，不制造未发布 URL。
const gzipUiMessages = createRequire(import.meta.url)('pako').gzip as
    (data: Uint8Array, options: {level: number}) => Uint8Array;
// 与中文内嵌目录一致，仅投影扩展文档页专用 key；固定远程与外部资源继续使用原 bundle。
const compressedUiLanguageBundles = greasyForkSource ? {} : Object.fromEntries(Object.entries(UI_LANGUAGE_BUNDLES)
    .filter(([language]) => language === 'en-US')
    .map(([language, bundle]) => [
    language,
    Buffer.from(gzipUiMessages(Buffer.from(serializeUiMessages({...bundle,
        messages: userscriptPageMessages(bundle.messages)})), {level: 9})).toString('base64'),
]));
// 这些文件均确实存在于 userscriptLanguageResourceCommit；原始字节和内容哈希由发布契约测试核验。
const remoteUiLanguageBundles: Record<string, string> = greasyForkSource ? {} : {
    'ja-JP': 'ja-JP.08c79340a9985ae3.json',
    'ko-KR': 'ko-KR.b5beebbaecbf1262.json',
    'fr-FR': 'fr-FR.c0b51f4e71dd4981.json',
    'ru-RU': 'ru-RU.efcd39485c4ca062.json',
    'es-ES': 'es-ES.0e137d2a17e5b5cb.json',
};
function buildUiLanguagePatch(base: UiLanguageBundle, target: UiLanguageBundle): Record<string, unknown> {
    const patch: Record<string, unknown> = {};
    for (const field of ['messages', 'legacyText'] as const) {
        const set = Object.fromEntries(Object.entries(target[field]).filter(([key, value]) => base[field][key] !== value));
        const remove = Object.keys(base[field]).filter(key => !Object.hasOwn(target[field], key));
        if (Object.keys(set).length || remove.length) patch[field] = {set, remove};
    }
    const patterns: Record<string, unknown> = {};
    for (const field of ['early', 'late'] as const) {
        if (JSON.stringify(base.legacyPatterns[field]) === JSON.stringify(target.legacyPatterns[field])) continue;
        const original = new Map(base.legacyPatterns[field].map((entry, index) => [JSON.stringify(entry), index]));
        // 引用未变条目的旧位置，新增/更改条目保持完整数组数据；目标顺序也表达删除与重排。
        patterns[field] = target.legacyPatterns[field].map(entry => original.get(JSON.stringify(entry)) ?? entry);
    }
    if (Object.keys(patterns).length) patch.legacyPatterns = patterns;
    return patch;
}
const uiLanguagePatches = Object.fromEntries(Object.entries(remoteUiLanguageBundles).map(([language, fileName]) => {
    const source = fs.readFileSync(resolve(root, 'userscript/languages', fileName), 'utf8').trimEnd();
    const base = JSON.parse(source) as UiLanguageBundle;
    const digest = createHash('sha256').update(source).digest('hex').slice(0, 16);
    if (fileName !== `${language}.${digest}.json`) throw new Error(`Pinned userscript language data changed: ${fileName}`);
    const current = UI_LANGUAGE_BUNDLES[language as keyof typeof UI_LANGUAGE_BUNDLES];
    return [language, buildUiLanguagePatch(base, {...current, messages: userscriptPageMessages(current.messages)})];
}));
// 五语补丁共享大量原文 key；共同压缩只保存差异，不把五份完整目录重复内嵌。
const compressedUiLanguagePatches = greasyForkSource ? '' : Buffer.from(gzipUiMessages(
    Buffer.from(serializeUiMessages(uiLanguagePatches)), {level: 9})).toString('base64');
const unicodeNotice = `/*\n${fs.readFileSync(resolve(root, 'public/third-party-notices/unicode-17.0.0.txt'), 'utf8')}\n*/`;
const serviceIconsNotice = `/*\n${fs.readFileSync(resolve(root, 'public/third-party-notices/lobe-icons-MIT.txt'), 'utf8')}\n*/`;
const tinycolorNotice = `/*\n@ctrl/tinycolor 3.6.1 — MIT\n${fs.readFileSync(resolve(root, 'public/third-party-notices/tinycolor-MIT.txt'), 'utf8')}\n*/`;
const browserShimPath = resolve(root, 'userscript/browser.ts');
const projectRoot = `${normalizePath(root)}/`;
const siteCatalogDir = resolve(root, 'src/core/site-adaptation/catalog');
const siteCatalogFiles = new Set(['established.json', 'websites.json', 'profiles.json']
    .map((name) => resolve(siteCatalogDir, name)));
const siteCatalogData = Object.fromEntries([...siteCatalogFiles]
    .map((sourcePath) => [basename(sourcePath, '.json'), JSON.parse(fs.readFileSync(sourcePath, 'utf8'))]));
// 构建目录提供权威规则；固定资源中未变的规则复用，新增或更新的规则随消费者补齐。
const pinnedSiteCatalogs = greasyForkSource
    ? (runInNewContext(fs.readFileSync(resolve(root, 'userscript/resources/fluentread-data.v1.js'), 'utf8'), {}, {timeout: 1_000}) as {siteCatalogs: Record<string, unknown>}).siteCatalogs
    : undefined;
const compressedCatalogPrefix = '\0fluentread-userscript-site-catalog:';
const externalChineseMessagesId = '\0fluentread-userscript-zh-cn.js';

/** 只压缩站点规则与中文文案数据；产品逻辑仍留在可审查的 userscript 主文件中。 */
export function createUserscriptCatalogCompressionPlugin(): Plugin {
    return {
        name: 'compress-userscript-site-catalog',
        enforce: 'pre',
        resolveId(source, importer) {
            if (source === './messages/zh-CN'
                && importer?.split('?')[0] === resolve(root, 'src/core/i18n/index.ts')) return externalChineseMessagesId;
            if (!importer || !source.endsWith('.json')) return null;
            const sourcePath = resolve(dirname(importer.split('?')[0]), source);
            // 以 .js 结尾，避免 Vite 的 JSON 插件再次尝试解析虚拟模块源码。
            return siteCatalogFiles.has(sourcePath) ? `${compressedCatalogPrefix}${sourcePath}.js` : null;
        },
        load(id) {
            if (id === externalChineseMessagesId) {
                if (greasyForkSource) return 'export const zhCNMessages = globalThis.__FLUENTREAD_USERSCRIPT_DATA__.zhCNMessages;';
                const contents = serializeUiMessages(userscriptPageMessages(zhCNMessages));
                const compressed = Buffer.from(gzipUiMessages(Buffer.from(contents), {level: 9})).toString('base64');
                return [
                    `/* Non-code Chinese UI messages; sha256 ${createHash('sha256').update(contents).digest('hex')}. */`,
                    "import {inflateWithPako} from '@/userscript/pakoRuntime';",
                    `const bytes = Uint8Array.from(atob(${JSON.stringify(compressed)}), (character) => character.charCodeAt(0));`,
                    'export const zhCNMessages = JSON.parse(inflateWithPako(bytes));',
                ].join('\n');
            }
            if (!id.startsWith(compressedCatalogPrefix)) return null;
            const sourcePath = id.slice(compressedCatalogPrefix.length, -'.js'.length);
            if (!siteCatalogFiles.has(sourcePath)) throw new Error(`Unexpected userscript site catalog: ${sourcePath}`);
            if (greasyForkSource) {
                const name = basename(sourcePath, '.json');
                const current = siteCatalogData[name];
                const pinned = pinnedSiteCatalogs?.[name];
                if (!Array.isArray(current)) {
                    if (!current || typeof current !== 'object') throw new Error(`Invalid authoritative userscript site catalog: ${name}`);
                    const pinnedRecord: Record<string, unknown> = pinned && typeof pinned === 'object' && !Array.isArray(pinned) ? pinned as Record<string, unknown> : {};
                    const updates = Object.fromEntries(Object.entries(current).filter(([id, value]) => JSON.stringify(value) !== JSON.stringify(pinnedRecord[id])));
                    const order = Object.keys(current);
                    return [
                        `const catalog = globalThis.__FLUENTREAD_USERSCRIPT_DATA__?.siteCatalogs?.${name};`,
                        `if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) throw new Error("Invalid pinned userscript site catalog: ${name}");`,
                        `const updates = new Map(Object.entries(${JSON.stringify(updates)}));`,
                        `const order = ${JSON.stringify(order)};`,
                        'const resolved = Object.fromEntries(order.map((id) => {',
                        '  const rule = updates.get(id) ?? (Object.hasOwn(catalog, id) ? catalog[id] : undefined);',
                        '  if (!rule) throw new Error("Missing pinned userscript site rule: " + id);',
                        '  return [id, rule];',
                        '}));',
                        'export default Object.keys(catalog).length === order.length && order.every((id) => resolved[id] === catalog[id]) ? catalog : resolved;',
                    ].join('\n');
                }
                const pinnedById = new Map((Array.isArray(pinned) ? pinned : []).map((rule) => [rule.id, rule]));
                const updates = current.filter((rule) => JSON.stringify(rule) !== JSON.stringify(pinnedById.get(rule.id)));
                const order = current.map((rule) => rule.id);
                return [
                    `const catalog = globalThis.__FLUENTREAD_USERSCRIPT_DATA__?.siteCatalogs?.${name};`,
                    `if (!Array.isArray(catalog)) throw new Error("Invalid pinned userscript site catalog: ${name}");`,
                    'const present = new Map(catalog.map((rule) => [rule.id, rule]));',
                    `const updates = new Map(${JSON.stringify(updates)}.map((rule) => [rule.id, rule]));`,
                    `const resolved = ${JSON.stringify(order)}.map((id) => {`,
                    '  const rule = updates.get(id) ?? present.get(id);',
                    '  if (!rule) throw new Error("Missing pinned userscript site rule: " + id);',
                    '  return rule;',
                    '});',
                    // 无增量也必须读取运行时必需 ID；合法数据仍保持原数组与词条身份。
                    'export default catalog.length === resolved.length && resolved.every((rule, index) => rule === catalog[index]) ? catalog : resolved;',
                ].join('\n');
            }
            const contents = JSON.stringify(JSON.parse(fs.readFileSync(sourcePath, 'utf8')));
            const compressed = gzipSync(Buffer.from(contents), {level: 9}).toString('base64');
            const digest = createHash('sha256').update(contents).digest('hex');
            return [
                `/* Non-code site rules: ${normalizePath(sourcePath).slice(projectRoot.length)}; sha256 ${digest}. */`,
                "import {inflateWithPako} from '@/userscript/pakoRuntime';",
                `const bytes = Uint8Array.from(atob(${JSON.stringify(compressed)}), (character) => character.charCodeAt(0));`,
                'export default JSON.parse(inflateWithPako(bytes));',
            ].join('\n');
        },
    };
}

// dexie 的官方入口以 Symbol.for('Dexie') 作为跨 realm 的单例注册表；该注册一旦进入油猴产物，
// 与宿主页面的 Dexie 副本撞上不同版本就会在入口处抛错。用产物文本兜底，防止别名将来被改坏。
const DEXIE_GLOBAL_REGISTRATION = /Symbol\s*\.\s*for\s*\(\s*(['"])Dexie\1\s*\)/u;

export function findDexieGlobalRegistration(code: string): boolean {
    return DEXIE_GLOBAL_REGISTRATION.test(code);
}

export const compatibilityPreludeStart = '/* FluentRead userscript compatibility prelude:start */';
export const compatibilityPreludeEnd = '/* FluentRead userscript compatibility prelude:end */';
export const executionGuardStart = '/* FluentRead userscript execution guard:start */';
export const executionGuardEnd = '/* FluentRead userscript execution guard:end */';

export function wrapUserscriptEntry(entryCode: string, bootstrapCode: string, thirdPartyNotices = ''): string {
    return [
        metadata,
        unicodeNotice,
        serviceIconsNotice,
        ...(!bundleLibraries ? [tinycolorNotice] : []),
        ...(thirdPartyNotices ? [thirdPartyNotices] : []),
        executionGuardStart,
        'if (!globalThis.__fluentReadUserscriptBootstrapped) {',
        bootstrapCode,
        entryCode,
        '}',
        executionGuardEnd,
    ].join('\n');
}

function bundledLibraryNotices(moduleIds: readonly string[]): string {
    const packageRoots = new Set<string>();
    for (const id of moduleIds) {
        if (id.startsWith('\0')) continue;
        const match = /^(.*\/node_modules\/\.pnpm\/[^/]+\/node_modules\/)(@[^/]+\/[^/]+|[^/]+)/u.exec(id);
        if (match) packageRoots.add(`${match[1]}${match[2]}`);
    }
    return [...packageRoots].sort().map((packageRoot) => {
        const manifest = JSON.parse(fs.readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as {
            name: string;
            version: string;
            license?: string;
            repository?: string | {url?: string};
        };
        const licenseFile = fs.readdirSync(packageRoot).find((name) => /^LICEN[CS]E(?:[.-].*)?$/iu.test(name));
        if (!manifest.license) throw new Error(`Missing bundled library license: ${manifest.name}`);
        const repository = typeof manifest.repository === 'string'
            ? manifest.repository
            : manifest.repository?.url;
        const licenseText = licenseFile
            ? fs.readFileSync(resolve(packageRoot, licenseFile), 'utf8').trim()
            : `License source: ${repository || `https://www.npmjs.com/package/${manifest.name}/v/${manifest.version}`}`;
        if (licenseText.includes('*/')) throw new Error(`Unsafe bundled library license comment: ${manifest.name}`);
        return `/*\n${manifest.name} ${manifest.version} — ${manifest.license}\n${licenseText}\n*/`;
    }).join('\n');
}

// Via 等旧内核可能缺少共享核心使用的基础方法；在单文件入口最前方注入小型兼容层。
const compatibilityPrelude = `(function () {
    if (typeof Object.fromEntries !== 'function') {
        Object.defineProperty(Object, 'fromEntries', {
            configurable: true,
            writable: true,
            value: function (entries) {
                var result = {};
                Array.from(entries).forEach(function (entry) {
                    Object.defineProperty(result, entry[0], {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: entry[1]
                    });
                });
                return result;
            }
        });
    }
    if (typeof Promise.allSettled !== 'function') {
        Object.defineProperty(Promise, 'allSettled', {
            configurable: true,
            writable: true,
            value: function (values) {
                return Promise.all(Array.from(values, function (value) {
                    return Promise.resolve(value).then(function (fulfilledValue) {
                        return {status: 'fulfilled', value: fulfilledValue};
                    }, function (reason) {
                        return {status: 'rejected', reason: reason};
                    });
                }));
            }
        });
    }
    if (typeof Array.prototype.flatMap !== 'function') {
        Object.defineProperty(Array.prototype, 'flatMap', {
            configurable: true,
            writable: true,
            value: function (callback, thisArg) {
                if (this === null || this === undefined) throw new TypeError('Array.prototype.flatMap called on null or undefined');
                if (typeof callback !== 'function') throw new TypeError('flatMap callback must be a function');
                var source = Object(this);
                var numericLength = Number(source.length) || 0;
                var length = Math.min(Math.max(Math.floor(numericLength), 0), 9007199254740991);
                var result = [];
                for (var index = 0; index < length; index += 1) {
                    if (!(index in source)) continue;
                    var mapped = callback.call(thisArg, source[index], index, source);
                    if (!Array.isArray(mapped)) {
                        result.push(mapped);
                        continue;
                    }
                    for (var mappedIndex = 0; mappedIndex < mapped.length; mappedIndex += 1) {
                        if (mappedIndex in mapped) result.push(mapped[mappedIndex]);
                    }
                }
                return result;
            }
        });
    }
}());`;

type BrowserGlobal = 'browser' | 'chrome';

/**
 * 借助 TypeScript 符号解析查找真正未绑定的 browser/chrome 标识符；属性名和类型引用
 * 不应触发注入，避免对普通业务对象产生误改写。
 */
export function findFreeBrowserGlobals(code: string, id: string): BrowserGlobal[] {
    // 没有候选时不建立编译器 program；反斜杠保留 Unicode 转义标识符的完整解析路径。
    if (!code.includes('browser') && !code.includes('chrome') && !code.includes('\\')) return [];
    const sourceFile = ts.createSourceFile(id, code, ts.ScriptTarget.Latest, true);
    const options: ts.CompilerOptions = {
        allowJs: true,
        module: ts.ModuleKind.ESNext,
        noLib: true,
        noResolve: true,
        target: ts.ScriptTarget.Latest,
    };
    const host: ts.CompilerHost = {
        fileExists: (fileName) => fileName === id,
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => root,
        getDefaultLibFileName: () => '',
        getNewLine: () => '\n',
        getSourceFile: (fileName) => fileName === id ? sourceFile : undefined,
        readFile: (fileName) => fileName === id ? code : undefined,
        useCaseSensitiveFileNames: () => true,
        writeFile: () => undefined,
    };
    const checker = ts.createProgram([id], options, host).getTypeChecker();
    const found = new Set<BrowserGlobal>();
    const visit = (node: ts.Node): void => {
        if (ts.isIdentifier(node) && (node.text === 'browser' || node.text === 'chrome')) {
            const parent = node.parent;
            const isPropertyName = (ts.isPropertyAccessExpression(parent) && parent.name === node)
                || ((ts.isPropertyAssignment(parent)
                    || ts.isMethodDeclaration(parent)
                    || ts.isPropertyDeclaration(parent)
                    || ts.isPropertySignature(parent)
                    || ts.isMethodSignature(parent)) && parent.name === node);
            const isTypeOnlyReference = ts.isTypeReferenceNode(parent)
                || ts.isTypeQueryNode(parent)
                || ts.isQualifiedName(parent);
            if (!isPropertyName && !isTypeOnlyReference && !checker.getSymbolAtLocation(node)) {
                found.add(node.text);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return (['browser', 'chrome'] as const).filter((name) => found.has(name));
}

export function injectUserscriptBrowserImports(code: string, id: string): string | null {
    const [rawId, query = ''] = id.split('?', 2);
    const cleanId = normalizePath(rawId);
    const isScriptModule = /\.[cm]?[jt]sx?$/u.test(cleanId);
    const isVueScriptModule = cleanId.endsWith('.vue')
        && new URLSearchParams(query).get('type') === 'script';
    if (!cleanId.startsWith(projectRoot) || (!isScriptModule && !isVueScriptModule)) return null;

    const injected = findFreeBrowserGlobals(code, cleanId);
    if (injected.length === 0) return null;

    const specifiers = injected.map((name) => name === 'browser' ? 'default as browser' : 'chrome');
    return `import {${specifiers.join(', ')}} from ${JSON.stringify(browserShimPath)};\n${code}`;
}

/** 为项目内 TS/JS 与 Vue script 模块注入 userscript browser shim。 */
function injectUserscriptBrowserShim(): Plugin {
    return {
        name: 'inject-userscript-browser-shim',
        enforce: 'pre',
        transform(code, id) {
            const transformed = injectUserscriptBrowserImports(code, id);
            return transformed ? {code: transformed, map: null} : null;
        },
    };
}

/**
 * 把拆分出的 CSS、Userscript 元数据和兼容层合并进唯一入口，并阻止扩展全局泄漏到产物。
 */
function bundleUserscriptCss(): Plugin {
    return {
        name: 'bundle-userscript-css',
        enforce: 'post',
        transform: {
            order: 'pre',
            handler(code, id) {
                // page.css 使用 ?inline 进入 JS，必须在 Vite CSS 转换前排除不可达的扩展来源提示。
                if (normalizePath(id.split('?', 1)[0]) !== normalizePath(resolve(root, 'src/app/content/page.css'))) return null;
                const withoutCorrectionBadge = code.replace(/\.fluent-read-bilingual-content\[data-fr-personal-correction="true"\]::after\s*\{[^}]*\}/gu, '');
                return withoutCorrectionBadge === code ? null : {code: withoutCorrectionBadge, map: null};
            },
        },
        generateBundle: {
          order: 'post',
          async handler(_options, bundle) {
            // 个人校订需要扩展后台作为唯一写入者；public 别名之外的直接导入也必须在构建期阻止。
            const correctionFeatureRoot = `${resolve(root, 'src/features/personal-corrections')}/`;
            const leakedCorrectionModule = Object.values(bundle)
                .filter((item) => item.type === 'chunk')
                .flatMap((item) => item.moduleIds)
                .find((id) => id.startsWith(correctionFeatureRoot));
            if (leakedCorrectionModule) {
                throw new Error(`Userscript bundle contains unsupported personal correction feature: ${leakedCorrectionModule}`);
            }

            const cssEntries = Object.entries(bundle).filter(([, item]) => item.type === 'asset' && item.fileName.endsWith('.css'));
            const css = cssEntries.map(([, item]) => String(item.type === 'asset' ? item.source : '')).join('\n');
            const compressedCss = greasyForkSource ? '' : gzipSync(Buffer.from(css, 'utf8'), {level: 9}).toString('base64');
            cssEntries.forEach(([fileName]) => delete bundle[fileName]);

            if (greasyForkSource) {
                // Greasy Fork 的源码文件保留产品逻辑，静态词条、站点规则和样式单独随固定版本缓存。
                const data = {
                    english: UI_LANGUAGE_BUNDLES['en-US'],
                    languageBundles: UI_LANGUAGE_BUNDLES,
                    zhCNMessages,
                    siteCatalogs: siteCatalogData,
                    css,
                };
                this.emitFile({
                    type: 'asset',
                    fileName: 'fluentread-data.v1.js',
                    source: [
                        '/* FluentRead non-code data: UI translations, site rules and CSS. */',
                        `globalThis.__FLUENTREAD_USERSCRIPT_DATA__=${JSON.stringify(data)};`,
                    ].join('\n'),
                });
            }

            const entry = Object.values(bundle).find((item) => item.type === 'chunk' && item.isEntry);
            if (!entry || entry.type !== 'chunk') throw new Error('Userscript entry chunk was not generated');

            // 兼容层在 Vite 主产物之外拼接，也需压缩空白和局部变量；不改语法或许可声明。
            const preludeCode = greasyForkSource ? compatibilityPrelude : (await transformWithEsbuild(
                compatibilityPrelude, 'userscript-compatibility-prelude.js',
                {target: 'es2018', minifyWhitespace: true, minifyIdentifiers: true, minifySyntax: false},
            )).code;
            const bootstrap = [
                `${compatibilityPreludeStart}\n${preludeCode}\n${compatibilityPreludeEnd}`,
                `globalThis.__FLUENTREAD_ICON_DATA__=${JSON.stringify(iconDataUrl)};`,
                ...(greasyForkSource
                    ? ['globalThis.__fluentReadUserscriptCss=globalThis.__FLUENTREAD_USERSCRIPT_DATA__.css;']
                    : [`globalThis.__fluentReadUserscriptCssCompressed=${JSON.stringify(compressedCss)};`]),
            ].join('\n');
            // 入口内部的幂等标记只能在整个 IIFE 顶层求值后生效。脚本管理器若对同一
            // 文档再次注入，必须在最外层跳过整个 bundle，否则内联模块会重复创建
            // 配置 store、watch 和 preparation barrier，即使 bootstrap 最后选择返回。
            entry.code = wrapUserscriptEntry(
                entry.code,
                bootstrap,
                bundleLibraries ? bundledLibraryNotices(entry.moduleIds) : '',
            );

            entry.code = entry.code.replace(/[\uFFFE\uFFFF]/gu, (character) => {
                const codePoint = character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
                return `\\u${codePoint}`;
            });

            const leakedGlobals = findFreeBrowserGlobals(entry.code, resolve(root, '.output/userscript/fluent-read.user.js'));
            if (leakedGlobals.length > 0) {
                throw new Error(`Userscript bundle contains unresolved extension globals: ${leakedGlobals.join(', ')}`);
            }

            if (findDexieGlobalRegistration(entry.code)) {
                throw new Error(
                    'Userscript bundle registers globalThis[Symbol.for("Dexie")]; import dexie through userscript/dexie.ts '
                    + 'so a host page carrying another Dexie version cannot abort the script (issue #524)',
                );
            }
          },
        },
        writeBundle(_options, bundle) {
            const files = Object.values(bundle).map((item) => item.fileName).sort();
            const expected = greasyForkSource
                ? ['fluent-read.user.js', 'fluentread-data.v1.js']
                : ['fluent-read.user.js'];
            if (JSON.stringify(files) !== JSON.stringify(expected)) {
                throw new Error(`Userscript build emitted unexpected files: ${files.join(', ')}`);
            }
        },
    };
}

/** 将 WXT 内容脚本声明展开为普通对象，使同一入口可在 userscript 单页 runtime 中复用。 */
function unwrapWxtEntrypoints(): Plugin {
    const entrypoints = new Set([
        resolve(root, 'entrypoints/content.ts'),
    ]);
    return {
        name: 'unwrap-wxt-entrypoints',
        enforce: 'pre',
        transform(code, id) {
            if (!entrypoints.has(id)) return null;
            return code.replace(/\bdefineContentScript\s*\(/gu, '((definition) => definition)(');
        },
    };
}

export const userscriptAliases = [
    ...(bundleLibraries ? [{find: '@/userscript/pakoRuntime', replacement: resolve(root, 'userscript/pakoBundled.ts')}] : []),
    // dexie 官方 ESM 入口把自身注册到跨 realm 共享的 globalThis[Symbol.for('Dexie')]，版本不一致时会在
    // 模块求值阶段直接抛错。脚本管理器（如 Safari 的 Userscripts）把脚本注入页面主 world，与宿主页面共享
    // 该注册表，必须换成不注册全局符号的入口，否则整个 bundle 会在入口处中断（issue #524）。
    {find: /^dexie$/u, replacement: resolve(root, 'userscript/dexie.ts')},
    {find: '@/src/platform/storage/credentialContext', replacement: resolve(root, 'userscript/credentialContext.ts')},
    {find: '@/src/platform/storage/configStorageRuntime', replacement: resolve(root, 'userscript/storage.ts')},
    // 扩展从本地资源读取界面语言；userscript 内嵌英文，其他语言从仓库静态 JSON 按需加载。
    {find: '@/src/platform/i18n/uiLanguageBundles', replacement: resolve(root, 'userscript/uiLanguageBundles.ts')},
    {find: /^@\/src\/services\/translation\/context\/browser$/u, replacement: resolve(root, 'userscript/pageContext.ts')},
    {find: /^@\/src\/services\/translation\/context$/u, replacement: resolve(root, 'userscript/pageTranslationContext.ts')},
    // app/content 只依赖 feature 公开契约；在此边界替换，才能保证扩展专属 runtime 不进入产物。
    {find: '@/src/features/information-highlight/public', replacement: resolve(root, 'userscript/informationHighlight.ts')},
    {find: '@/src/features/area-translation/public', replacement: resolve(root, 'userscript/unsupportedCapabilities.ts')},
    {find: '@/src/features/image-translation/public', replacement: resolve(root, 'userscript/unsupportedCapabilities.ts')},
    {find: '@/src/features/video-subtitle/public', replacement: resolve(root, 'userscript/unsupportedCapabilities.ts')},
    {find: '@/src/features/vocabulary/content/public', replacement: resolve(root, 'userscript/unsupportedCapabilities.ts')},
    {find: '@/src/features/personal-corrections/public', replacement: resolve(root, 'userscript/unsupportedCapabilities.ts')},
    {find: '@/src/features/writing-assistant/public', replacement: resolve(root, 'userscript/writingAssistant.ts')},
    {find: /^\.\/chrome-translator$/u, replacement: resolve(root, 'userscript/chromeTranslator.ts')},
    {find: '@wxt-dev/storage', replacement: resolve(root, 'userscript/storage.ts')},
    {find: 'webextension-polyfill', replacement: resolve(root, 'userscript/browser.ts')},
    {find: 'wxt/utils/content-script-ui/shadow-root', replacement: resolve(root, 'userscript/shadow-root.ts')},
    {find: '@', replacement: root},
];

export default defineConfig({
    root,
    publicDir: false,
    plugins: [unwrapWxtEntrypoints(), createUserscriptCatalogCompressionPlugin(), createUserscriptCharacterDataCompressionPlugin(root, !greasyForkSource), createUserscriptFrancDataCompressionPlugin(root, bundleLibraries && !greasyForkSource), createUserscriptTldtsDataCompressionPlugin(root, bundleLibraries && !greasyForkSource), createUserscriptServiceBrandIconsCompressionPlugin(root, bundleLibraries && !greasyForkSource), injectUserscriptBrowserShim(), vue(), bundleUserscriptCss(), createUserscriptInlineCssCompressionPlugin(root, !greasyForkSource)],
    resolve: {
        alias: userscriptAliases,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.VUE_APP_VERSION': JSON.stringify(packageJson.version),
        'process.env.VUE_APP_USERSCRIPT_VERSION': JSON.stringify(packageJson.userscriptVersion),
        'import.meta.env.BROWSER': JSON.stringify('userscript'),
        'import.meta.env.MANIFEST_VERSION': '2',
        __FLUENTREAD_USERSCRIPT_LANGUAGE_BUNDLES__: JSON.stringify(compressedUiLanguageBundles),
        __FLUENTREAD_USERSCRIPT_REMOTE_LANGUAGES__: JSON.stringify(remoteUiLanguageBundles),
        __FLUENTREAD_USERSCRIPT_LANGUAGE_PATCHES__: JSON.stringify(compressedUiLanguagePatches),
        __FLUENTREAD_USERSCRIPT_RESOURCE_COMMIT__: JSON.stringify(userscriptLanguageResourceCommit),
        __FLUENTREAD_FULL_OPTIONS__: JSON.stringify(bundleLibraries),
    },
    build: {
        outDir: resolve(root, bundleLibraries ? '.output/userscript-standalone'
            : greasyForkSource ? '.output/userscript-greasyfork' : '.output/userscript'),
        emptyOutDir: true,
        target: 'es2018',
        minify: greasyForkSource ? false : 'esbuild',
        // 锁定的 CommonJS 26 默认 auto 会因条件 require 的分析时机改变 MD5 初始化包装。
        // 保留首次 require 的初始化顺序与循环依赖语义，使同源构建能稳定比较；不改库实现。
        commonjsOptions: {strictRequires: true},
        sourcemap: false,
        cssCodeSplit: false,
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        lib: {
            entry: resolve(root, 'userscript/main.ts'),
            name: 'FluentReadUserscript',
            formats: ['iife'],
            fileName: () => 'fluent-read.user.js',
        },
        rollupOptions: {
            external: bundleLibraries ? [] : [
                'vue', 'element-plus', '@element-plus/icons-vue', 'tldts',
                ...(greasyForkSource ? Object.keys(vendorGlobals) : []),
            ],
            output: {
                inlineDynamicImports: true,
                entryFileNames: 'fluent-read.user.js',
                globals: {
                    vue: 'Vue',
                    'element-plus': 'ElementPlus',
                    '@element-plus/icons-vue': 'ElementPlusIconsVue',
                    tldts: 'tldts',
                    ...(greasyForkSource ? vendorGlobals : {}),
                },
            },
        },
    },
});
