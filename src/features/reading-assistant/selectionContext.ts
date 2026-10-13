/**
 * @file src/features/reading-assistant/selectionContext.ts
 * 文件职责：在用户点击理解时，从原选区所在的最小正文块捕获有限上下文，并提取可明确展开的整句。
 * 主要内容：排除表单、交互控件、隐藏内容、代码及扩展译文；检查正文及祖先的计算可见性，包括 visibility:collapse；按选区位置裁剪段落，避免双击相同单词时关联错误句子。
 * 模块边界：不扫描整页、不读取网址、标题或存储，也不发送模型请求；只返回当前操作使用的纯文本快照。
 */
import {summarizeSelectionContext} from '@/src/features/selection-translation/core/public';
import type {ReadingSelection} from './types';

const EXCLUDED = 'script,style,noscript,template,textarea,input,select,button,code,pre,svg,math,nav,aside,[hidden],[inert],[aria-hidden="true"],[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="button"],.notranslate,[data-notranslate="true"],[data-fluent-read-ui],.fluent-read-bilingual-content';
const PROSE = 'p,li,blockquote,dd,dt,figcaption,h1,h2,h3,h4,h5,h6';
const normalize = (value: string) => value.replace(/\s+/gu, ' ').trim();

function hidden(element: Element): boolean {
    const view = element.ownerDocument.defaultView;
    const style = typeof view?.getComputedStyle === 'function' ? view.getComputedStyle(element) : (element as HTMLElement).style;
    return style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse';
}

/** 仅依据已经捕获的段落定位原选词所在句子，不改写浏览器的原生 Selection。 */
export function sentenceAroundSelection(context: string, selected: string, selectedIndex = 0): string {
    const index = context.indexOf(selected, Math.max(0, selectedIndex));
    if (index < 0) return selected;
    const segments = context.matchAll(/[^.!?。！？\n]+(?:[.!?。！？]+["'”’）)]*|$)/gu);
    for (const match of segments) {
        const start = match.index;
        const end = start + match[0].length;
        if (start <= index && end >= index + selected.length) return match[0].trim();
    }
    return selected;
}

/** 捕获严格局限于本段的正文；异常、脱离文档或无法核对原文时退回选中文本。 */
export function captureReadingSelection(range: Range, text: string, contextLimit: number): ReadingSelection {
    const selected = normalize(text).slice(0, 4096);
    const fallback: ReadingSelection = {text: selected, context: '', sentence: selected};
    if (contextLimit <= 0 || !range.startContainer.isConnected || !range.endContainer.isConnected) return fallback;
    const start = range.startContainer.nodeType === 1 ? range.startContainer as Element : range.startContainer.parentElement;
    const paragraph = start?.closest(PROSE) ?? start;
    if (!paragraph || paragraph.matches('body,html,main,article,section') || !paragraph.contains(range.endContainer)
        || paragraph.closest(EXCLUDED)) return fallback;
    // 祖先 display:none 不会改变子段落的计算 display；必须沿祖先逐项核对。
    for (let ancestor: Element | null = paragraph; ancestor; ancestor = ancestor.parentElement) {
        if (hidden(ancestor)) return fallback;
    }
    let raw = '';
    let selectedOffset = -1;
    let visited = 0;
    const visit = (node: Node): void => {
        if (++visited > 2000) return;
        if (node.nodeType === 1) {
            const element = node as HTMLElement;
            if (element.matches(EXCLUDED) || hidden(element)) return;
            for (const child of Array.from(node.childNodes)) visit(child);
            return;
        }
        if (node.nodeType !== 3) return;
        if (node === range.startContainer) selectedOffset = raw.length + range.startOffset;
        raw += node.textContent;
    };
    visit(paragraph);
    if (visited > 2000 || selectedOffset < 0) return fallback;
    const normalized = normalize(raw);
    const offset = raw.slice(0, selectedOffset).replace(/\s+/gu, ' ').trimStart().length;
    if (normalized.slice(offset, offset + selected.length) !== selected) return fallback;
    const limit = Math.min(4000, Math.max(500, Math.floor(contextLimit)));
    const context = summarizeSelectionContext(normalized, selected, limit, offset);
    const sentence = sentenceAroundSelection(normalized, selected, offset);
    return {text: selected, context, sentence: sentence.length <= 4096 ? sentence : selected};
}
