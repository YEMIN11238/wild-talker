import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {Script} from 'node:vm';
import ts from 'typescript';
import {parseHTML} from 'linkedom';
import {describe, expect, it} from 'vitest';
import {navigationGroups, navigationItems} from '@/src/features/settings/model/navigation';
import {interfaceSkinOptions, DEFAULT_POPUP_QUICK_FEATURE_ORDER, DEFAULT_POPUP_QUICK_FEATURE_VISIBILITY} from '@/src/core/config/interfaceAppearance';

// Load only explicitly selected declarations. The CLI's launch, I/O and main()
// are never evaluated; this suite can run without an extension or a browser.
const filename = resolve(__dirname, '../scripts/testing/run-settings-center-ui-test.cjs');
const source = readFileSync(filename, 'utf8');
const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function bindings(names: string[], globals: Record<string, unknown> = {}): Record<string, any> {
    const declarations = new Map<string, string>();
    const visit = (node: ts.Node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && names.includes(node.name.text)) {
            declarations.set(node.name.text, `const ${node.name.text} = ${node.initializer.getText(ast)};`);
        }
        if (ts.isFunctionDeclaration(node) && node.name && names.includes(node.name.text)) declarations.set(node.name.text, node.getText(ast));
        ts.forEachChild(node, visit);
    };
    visit(ast);
    for (const name of names) if (!declarations.has(name)) throw new Error(`Missing CLI declaration: ${name}`);
    return new Script(`${names.map(name => declarations.get(name)).join('\n')}\n({${names.join(',')}})`).runInNewContext({timeout: 30000, ...globals});
}

describe('settings center CLI production contracts', () => {
    it('keeps exact canonical section names, order and grouping aligned with production', () => {
        const contract = bindings(['expectedNavigation', 'expectedNavigationGroups']);
        expect(contract.expectedNavigation).toEqual(navigationItems.map(item => [item.id, item.label]));
        expect(contract.expectedNavigationGroups).toEqual(navigationGroups.map(group => [group.label, group.items.map(item => item.id)]));
    });

    it('covers every current popup entry and declared width without restoring removed entries', () => {
        const contract = bindings(['defaultVisibleQuickFeatures', 'defaultQuickFeatureOrder', 'customQuickFeatureOrder', 'expectedInterfaceSkins']);
        expect(contract.defaultQuickFeatureOrder).toEqual(DEFAULT_POPUP_QUICK_FEATURE_ORDER);
        expect(contract.defaultVisibleQuickFeatures).toEqual(DEFAULT_POPUP_QUICK_FEATURE_ORDER.filter(id => DEFAULT_POPUP_QUICK_FEATURE_VISIBILITY[id]));
        expect([...contract.customQuickFeatureOrder].sort()).toEqual([...DEFAULT_POPUP_QUICK_FEATURE_ORDER].sort());
        expect(contract.expectedInterfaceSkins.map((skin: {value: string; label: string; popupWidth: number}) => [skin.value, skin.label, skin.popupWidth]))
            .toEqual(interfaceSkinOptions.map(skin => [skin.value, skin.label, skin.popupWidth]));
    });

    it('excludes group toggles from section counts while retaining all sixteen sections', () => {
        const {settingsNavigationSelector} = bindings(['settingsNavigationSelector']);
        const {document} = parseHTML('<!doctype html><html><body></body></html>');
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', '设置分类');
        for (const group of navigationGroups) {
            const toggle = document.createElement('button');
            toggle.className = 'nav-group-toggle';
            nav.append(toggle);
            for (const item of group.items) {
                const section = document.createElement('button');
                section.dataset.section = item.id;
                nav.append(section);
            }
        }
        const fixture = document.createElement('div');
        fixture.append(nav);
        expect(fixture.querySelectorAll('button')).toHaveLength(navigationItems.length + navigationGroups.length);
        expect([...fixture.querySelectorAll<HTMLElement>(settingsNavigationSelector)].map(button => button.dataset.section))
            .toEqual(navigationItems.map(item => item.id));
    });
});

function navigationPage(mobileVisible: boolean, initiallyCollapsed = false) {
    const actions: string[] = [];
    let activeSection = '';
    let collapsed = initiallyCollapsed;
    const page = {
        locator(selector: string): any {
            if (selector === 'select.mobile-settings-navigation') return {
                isVisible: async () => mobileVisible,
                selectOption: async (id: string) => {activeSection = id; actions.push(`mobile:${id}`);},
            };
            if (selector.startsWith('.settings-page-tabs')) return {
                click: async () => {actions.push(`panel:${selector.match(/data-settings-category="([^"]+)"/)?.[1]}`);},
            };
            const id = selector.match(/data-section="([^"]+)"/)?.[1];
            if (!id) throw new Error(`Unexpected navigation selector: ${selector}`);
            return {
                isVisible: async () => !collapsed,
                locator: (ancestor: string) => {
                    if (!ancestor.includes('nav-group')) throw new Error('Missing group ancestor');
                    return {locator: (toggle: string) => ({click: async () => {
                        expect(toggle).toBe('.nav-group-toggle'); collapsed = false; actions.push('expand-group');
                    }})};
                },
                click: async () => {
                    if (mobileVisible || collapsed) throw new Error('Clicked a hidden sidebar entry');
                    activeSection = id; actions.push(`sidebar:${id}`);
                },
                waitFor: async ({state, timeout}: {state: string; timeout: number}) => {
                    expect(state).toBe('attached'); expect(timeout).toBe(30000);
                    expect(selector).toContain('[aria-current="page"]'); expect(activeSection).toBe(id);
                    actions.push(`active:${id}`);
                },
            };
        },
    };
    return {page, actions};
}

describe('settings center CLI navigation interactions', () => {
    it.each([false, true])('uses the visible desktop/mobile navigation before selecting model usage (mobile=%s)', async mobile => {
        const {selectSettingsSection} = bindings(['settingsNavigationSelector', 'selectSettingsSection']);
        const fixture = navigationPage(mobile);
        await selectSettingsSection(fixture.page, 'settings-translation-stats', 'usage');
        expect(fixture.actions).toEqual([`${mobile ? 'mobile' : 'sidebar'}:settings-translation-stats`, 'active:settings-translation-stats', 'panel:usage']);
    });

    it('reopens a collapsed group before clicking its section', async () => {
        const {selectSettingsSection} = bindings(['settingsNavigationSelector', 'selectSettingsSection']);
        const fixture = navigationPage(false, true);
        await selectSettingsSection(fixture.page, 'settings-selection');
        expect(fixture.actions).toEqual(['expand-group', 'sidebar:settings-selection', 'active:settings-selection']);
    });

    it('requires a visible, in-bounds mobile selection matching the active canonical section', () => {
        const rect = {left: 12, right: 378, top: 16, bottom: 54, width: 366, height: 38};
        const mobile = {value: 'settings-interface', getClientRects: () => [rect], getBoundingClientRect: () => rect};
        const sidebar = {dataset: {section: 'settings-interface'}, getBoundingClientRect: () => ({...rect, width: 0, height: 0})};
        const globals = {innerWidth: 390, innerHeight: 844, document: {querySelector: (selector: string) => selector.startsWith('select') ? mobile : sidebar}};
        const {inspectSettingsNavigationVisibility} = bindings(['inspectSettingsNavigationVisibility'], globals);
        expect(inspectSettingsNavigationVisibility()).toBe(true);
        mobile.value = 'settings-general'; expect(inspectSettingsNavigationVisibility()).toBe(false);
        mobile.value = 'settings-interface'; rect.right = 400; expect(inspectSettingsNavigationVisibility()).toBe(false);
    });
});

function productionSource(relative: string): string {
    return readFileSync(resolve(__dirname, '..', relative), 'utf8');
}

function cssDeclarations(relative: string, selector: string): Record<string, string> {
    // These production rules use literal selectors; include shared selector lists
    // and later declarations rather than assuming one rule per theme.
    const css = productionSource(relative).replace(/\/\*[\s\S]*?\*\//g, '');
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter(rule => rule[1].split(',').some(candidate => candidate.trim() === selector));
    if (!rules.length) throw new Error(`Missing production CSS rule: ${selector}`);
    return Object.fromEntries(rules.flatMap(rule => rule[2].split(';').flatMap(declaration => {
        const separator = declaration.indexOf(':');
        return separator < 0 ? [] : [[declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim()]];
    })));
}

describe('settings center CLI remaining current UI contracts', () => {
    it('uses the actual opaque ancestor behind a transparent OCR row without guessing non-solid surfaces', () => {
        const {resolveSolidBackground} = bindings(['parseHexColor', 'parseCssColor', 'resolveSolidBackground']);
        const row = cssDeclarations('src/features/image-translation/ui/image-ocr-settings.css', '.image-ocr-pack-card');
        expect(row.background).toBeUndefined();
        expect(row['background-color']).toBeUndefined();
        for (const color of ['rgb(255, 255, 255)', 'rgb(32, 38, 50)']) {
            expect(resolveSolidBackground([
                {color: 'rgba(0, 0, 0, 0)', image: 'none'},
                {color: 'transparent', image: 'none'},
                {color, image: 'none'},
                {color: 'rgb(0, 0, 0)', image: 'url(ignored-behind-opaque-surface)'},
            ])).toBe(color);
        }
        for (const layers of [
            [], [{color: 'transparent', image: 'none'}],
            [{color: 'rgba(32, 38, 50, 0.5)', image: 'none'}, {color: 'rgb(255, 255, 255)', image: 'none'}],
            [{color: 'rgb(255, 255, 255)', image: 'linear-gradient(#fff, #000)'}],
            [{color: 'transparent', image: 'url(background.png)'}, {color: 'rgb(255, 255, 255)', image: 'none'}],
            [{color: 'invalid', image: 'none'}],
        ]) expect(resolveSolidBackground(layers)).toBeNull();
    });
    it('keeps local About guides, source attribution and bundled license without external destinations or QR contracts', () => {
        const about = productionSource('src/app/options/OptionsApp.vue');
        expect(about).not.toMatch(/about-support-(?:qr|wechat|panel)|about-wechat-contact|about-qr-dialog|ko-fi\.com|approve\.jpg|wechat-contact\.jpg/u);
        expect(about).not.toMatch(/https:\/\/read\.thinkstu\.com|https:\/\/fluent\.thinkstu\.com|https:\/\/github\.com\/Bistutu\/FluentRead/u);
        expect(about).toContain('data-about-section');
        expect(about).toContain('data-about-brand');
        expect(about).toContain("t('options.aboutLocalSource')");
        expect(about).toContain("t('options.aboutLocalSourceDescription')");
        expect(about).toContain('about-personal-panel');
        expect(about).toContain('https://github.com/FluentRead/FluentRead');
        expect(about).toContain('about-license-details');
        expect(about).not.toContain('about-license-link');
        expect(source).not.toContain('matchesAboutSupportQrBounds');
        expect(source).toContain('aboutPersonalBuild');
    });

    it('keeps all five current quick features in the matrix after explicitly adding appearance', () => {
        const {expectedExpandedQuickFeatureCount, defaultQuickFeatureOrder, defaultVisibleQuickFeatures} = bindings([
            'expectedExpandedQuickFeatureCount', 'defaultQuickFeatureOrder', 'defaultVisibleQuickFeatures',
        ]);
        expect(expectedExpandedQuickFeatureCount).toBe(DEFAULT_POPUP_QUICK_FEATURE_ORDER.length);
        expect(expectedExpandedQuickFeatureCount).toBe(defaultQuickFeatureOrder.length);
        expect(defaultVisibleQuickFeatures).not.toContain('appearance');
        expect(defaultQuickFeatureOrder).toContain('appearance');
        const matrix = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'verifyInterfaceDesignMatrix');
        expect(matrix?.getText(ast)).toContain('layoutMetrics.featureCount !== expectedExpandedQuickFeatureCount');
    });

    it('uses the flat palette surface and the declared action background for every light/dark skin', () => {
        const {matchesPalettePopupSurfaces} = bindings(['parseHexColor', 'parseCssColor', 'matchesPalettePopupSurfaces']);
        const palette = cssDeclarations('src/ui/styles/interface-skins/palette.css', ':root[data-interface-skin-kind="palette"][data-interface-skin] .popup-shell');
        const button = cssDeclarations('src/ui/styles/interface-skins/palette.css', ':root[data-interface-skin-kind="palette"][data-interface-skin] .translate-button');
        expect(palette.background).toBe('var(--skin-page)');
        expect(button.background).toBe('var(--skin-action-background, var(--brand))');
        for (const skin of interfaceSkinOptions.filter(skin => skin.kind === 'palette')) {
            for (const theme of ['', '.dark']) {
                const file = `src/ui/styles/interface-skins/${skin.value}.css`;
                const light = cssDeclarations(file, `:root[data-interface-skin="${skin.value}"]`);
                // Dark declarations override the still-matching light rule; some skins
                // intentionally inherit the action fill or share one light/dark rule.
                const tokens = theme ? {...light, ...cssDeclarations(file, `:root${theme}[data-interface-skin="${skin.value}"]`)} : light;
                const declared = tokens['--skin-action-background'];
                expect(declared, `${skin.value}${theme} action background`).toMatch(/^#[\da-f]{3,6}$/i);
                expect(matchesPalettePopupSurfaces({
                    actionContrast: 4.5, declaredActionBackground: declared, translateButtonBackground: declared,
                    translateButtonBackgroundImage: 'none', shellBackgroundImage: 'none',
                })).toBe(true);
            }
        }
        const shuimo = cssDeclarations('src/ui/styles/interface-skins/shuimo.css', ':root[data-interface-skin="shuimo"]');
        expect(shuimo['--skin-action-background']).not.toBe(shuimo['--brand']);
        expect(source).toContain("declaredActionBackground: rootStyle.getPropertyValue('--skin-action-background').trim()");
    });

    it.each([
        {actionContrast: 4.49}, {actionContrast: Infinity}, {actionContrast: NaN}, {translateButtonBackground: '#3d3b4f'},
        {translateButtonBackgroundImage: 'linear-gradient(#fff, #000)'},
        {shellBackgroundImage: 'radial-gradient(#fff, #000)'},
        {declaredActionBackground: ''}, {translateButtonBackground: 'transparent'},
    ])('still rejects insufficient contrast, wrong action color or decorated palette surfaces (%j)', change => {
        const {matchesPalettePopupSurfaces} = bindings(['parseHexColor', 'parseCssColor', 'matchesPalettePopupSurfaces']);
        const metrics = {
            actionContrast: 4.5, declaredActionBackground: '#161823', translateButtonBackground: 'rgb(22, 24, 35)',
            translateButtonBackgroundImage: 'none', shellBackgroundImage: 'none', ...change,
        };
        expect(matchesPalettePopupSurfaces(metrics)).toBe(false);
    });

    it('finds current always-visible model usage sections and their exact accessible names', () => {
        const {modelUsageAverageSelector, modelUsageRequestLogSelector} = bindings(['modelUsageAverageSelector', 'modelUsageRequestLogSelector']);
        const dashboard = productionSource('src/features/model-usage/ui/ModelUsageDashboard.vue');
        const average = dashboard.match(/<section\b[^>]*class="usage-average-card"[^>]*>/)?.[0];
        const requests = dashboard.match(/<section\b[^>]*class="usage-card usage-request-log-card"[^>]*>/)?.[0];
        const title = dashboard.match(/<strong id="usage-request-log-title">[^<]*<\/strong>/)?.[0];
        expect(average).toBeDefined(); expect(requests).toBeDefined(); expect(title).toBeDefined();
        const {document} = parseHTML(`<html><body><div id="settings-model-usage">${average}</section>${requests}${title}</section></div></body></html>`);
        const averageSection = document.querySelector(modelUsageAverageSelector)!;
        const requestSection = document.querySelector(modelUsageRequestLogSelector)!;
        expect(averageSection.getAttribute('aria-label')).toBe('平均每次请求');
        expect(requestSection.getAttribute('aria-labelledby')).toBe('usage-request-log-title');
        expect(requestSection.querySelector('#usage-request-log-title')?.textContent).toBe('模型调用记录');
        expect(averageSection.querySelector('summary')).toBeNull();
        expect(requestSection.querySelector('summary')).toBeNull();
        const legacy = parseHTML('<html><body><div id="settings-model-usage"><details class="usage-average-card"><summary>平均</summary></details><details class="usage-request-log-card" open><summary>请求记录</summary></details></div></body></html>').document;
        expect(legacy.querySelector(modelUsageAverageSelector)).toBeNull();
        expect(legacy.querySelector(modelUsageRequestLogSelector)).toBeNull();
    });

    it('retains the exact production default-service help copy', () => {
        const {expectedDefaultServiceDescription} = bindings(['expectedDefaultServiceDescription']);
        const copy = productionSource('src/core/i18n/messages/zh-CN.ts')
            .match(/'quickTranslation\.defaultServiceDescription':\s*"([^"]+)"/)?.[1];
        expect(copy).toBeDefined();
        expect(expectedDefaultServiceDescription).toBe(copy);
        expect(productionSource('src/features/settings/ui/SettingsSections.vue'))
            .toContain(':description="t(\'quickTranslation.defaultServiceDescription\')"');
    });

    it('keeps the complete custom-service name visible, wrapping and within its card', () => {
        const {matchesWrappedServiceLabel} = bindings(['matchesWrappedServiceLabel']);
        const css = cssDeclarations('src/features/settings/ui/services/ServiceCatalogItem.vue', '.library-copy strong');
        expect(css['white-space']).toBe('normal');
        expect(css['overflow-wrap']).toBe('anywhere');
        const metrics = {
            cardLeft: 0, cardRight: 220, labelLeft: 44, labelRight: 180, labelWidth: 136, labelHeight: 40,
            overflow: 'visible', textOverflow: 'clip', whiteSpace: css['white-space'], overflowWrap: css['overflow-wrap'],
        };
        expect(matchesWrappedServiceLabel(metrics)).toBe(true);
        for (const change of [
            {labelLeft: -2}, {labelRight: 222}, {labelRight: null}, {labelWidth: 0}, {labelHeight: 0},
            {overflow: 'hidden'}, {textOverflow: 'ellipsis'}, {whiteSpace: 'nowrap'}, {overflowWrap: 'normal'},
        ]) expect(matchesWrappedServiceLabel({...metrics, ...change})).toBe(false);
    });
});
