#!/usr/bin/env node
// Check the exact static artifact shipped to GitHub Pages, including legacy links.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { parseHTML } from 'linkedom'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'docs/.vitepress/dist')
const siteOrigin = 'https://yemin11238.github.io'
const siteBase = '/wild-talker/'
const siteUrl = siteOrigin + siteBase
const repositoryUrl = 'https://github.com/YEMIN11238/wild-talker'
const releaseDownloadUrl = repositoryUrl + '/releases/download/v0.0.38-wild-talker.1/wild-talker-0.0.38-chrome-edge.zip'
const based = (route) => siteBase + route.replace(/^\//, '')
const distReal = fs.realpathSync(dist)
const isArtifactFile = (file) => {
  const inside = (base, target) => {
    const relative = path.relative(base, target)
    return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)
  }
  if (!inside(dist, file)) return false
  try {
    return fs.statSync(file).isFile() && inside(distReal, fs.realpathSync(file))
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false
    throw error
  }
}
const files = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]))
const resolvedPaths = new Map()
const resolve = (href) => {
  let name
  try {
    const url = new URL(href, siteUrl)
    if (url.origin !== siteOrigin) return null
    if (!url.pathname.startsWith(siteBase)) return null
    name = decodeURIComponent(url.pathname.slice(siteBase.length))
  } catch {
    return null
  }
  if (name.includes('\0')) return null
  if (!name || name.endsWith('/')) name += 'index.html'
  if (resolvedPaths.has(name)) return resolvedPaths.get(name)
  const exact = path.join(dist, name)
  const target = isArtifactFile(exact)
    ? exact
    : isArtifactFile(exact + '.html')
    ? exact + '.html'
    : null
  resolvedPaths.set(name, target)
  return target
}
const docs = new Map(
  files(dist)
    // Storybook has its own HTML shell and artifact checker, not VitePress page metadata.
    .filter((f) => f.endsWith('.html') && !path.relative(dist, f).startsWith('storybook/'))
    .map((f) => {
      assert(isArtifactFile(f), `HTML must belong to the shipped artifact: ${f}`)
      return [f, parseHTML(fs.readFileSync(f, 'utf8')).document]
    })
)
const report = { pages: docs.size, links: 0, anchors: 0, images: 0 }
for (const [file, doc] of docs) {
  const route = path.relative(dist, file)
  assert(doc.querySelector('h1') || file.endsWith('/404.html'), `Missing page title: ${file}`)
  if (route === 'showcase/reading-example.html') {
    // This exact public original sample is a standalone article, not a VitePress route.
    // Keep artifact ownership/link scans, and verify that the shipped bytes are the reviewed source.
    const source = path.join(root, 'docs/public/showcase/reading-example.html')
    const sourceRoot = fs.realpathSync(path.join(root, 'docs/public'))
    const sourceRelative = path.relative(sourceRoot, fs.realpathSync(source))
    assert(!sourceRelative.startsWith('..') && !path.isAbsolute(sourceRelative) && fs.statSync(source).isFile(), 'Reading example source must belong to public documentation assets')
    const html = fs.readFileSync(file, 'utf8')
    assert.equal(html, fs.readFileSync(source, 'utf8'), 'Reading example must match its reviewed public source')
    assert(doc.querySelector('title')?.textContent.includes('Wild Talker demo'), 'Reading example needs its public demo title')
    assert(doc.querySelector('#intro') && doc.querySelector('#river') && doc.querySelector('#finance') && doc.querySelector('#technical') && doc.querySelector('#bank-word')?.textContent === 'bank', 'Reading example must retain the original public reading paragraphs')
    assert(doc.body.textContent.includes('无个人资料') && doc.body.textContent.includes('原创阅读示例'), 'Reading example must identify its public original content')
    assert(!doc.querySelector('script,iframe,object,embed,form,input,textarea,meta[http-equiv]'), 'Reading example must remain a static public article')
    assert(!/\b(?:on[a-z]+\s*=|file:\/\/|\/Users\/|\/home\/|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/iu.test(html), 'Reading example must not contain executable handlers, local user paths or credentials')
    assert(!/url\s*\(/iu.test(doc.querySelector('style')?.textContent || ''), 'Reading example must not load hidden CSS resources')
    for (const element of doc.querySelectorAll('[src],link[href]')) {
      const reference = element.getAttribute('src') || element.getAttribute('href')
      const url = new URL(reference, siteUrl + route)
      assert(resolve(url.href), `Missing reading-example asset ${reference}`)
    }
  } else if (file.endsWith('/404.html')) {
    assert(doc.querySelector('meta[name="robots"]')?.getAttribute('content') === 'noindex')
    assert(
      !doc.querySelector('link[rel="alternate"]'),
      '404 must not advertise missing translations'
    )
  } else {
    const alternatePath = (route.startsWith('en/') ? route.slice(3) : 'en/' + route)
      .replace(/index\.html$/, '')
      .replace(/\.html$/, '')
    assert.equal(
      doc.querySelector('.bv-language')?.getAttribute('href'),
      based(alternatePath),
      `Language switch must preserve the page without a language-specific hash: ${route}`
    )
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')
    assert(canonical?.startsWith(siteUrl), `Missing canonical: ${file}`)
    assert(resolve(canonical), `Missing canonical target: ${canonical}`)
    for (const alternate of doc.querySelectorAll('link[rel="alternate"][hreflang]')) {
      assert(resolve(alternate.getAttribute('href')), `Missing translated URL: ${file}`)
    }
  }
  for (const demo of doc.querySelectorAll('[data-visual],[data-demo]')) {
    assert(demo.querySelector('.ds'), `Animated walkthrough needs numbered workflow steps: ${file}`)
    const stages = demo.querySelectorAll('.ds li')
    const stageButtons = demo.querySelectorAll('.ds li > button')
    assert.equal(stageButtons.length, stages.length, `Every workflow stage must be clickable: ${file}`)
    for (const button of stageButtons) {
      assert.equal(button.getAttribute('type'), 'button')
      assert(button.getAttribute('aria-label'), `Step button needs an accessible action: ${file}`)
    }
    assert.equal(
      demo.querySelectorAll('.ds-current').length,
      1,
      `Walkthrough needs one current stage: ${file}`
    )
  }
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')
    let url
    try {
      url = new URL(href, siteUrl + path.relative(dist, file))
    } catch {
      assert.fail(`Invalid link ${href} in ${path.relative(dist, file)}`)
    }
    if (url.origin !== siteOrigin) continue
    const target = resolve(url.href)
    assert(target, `Missing link ${href} in ${path.relative(dist, file)}`)
    report.links++
    if (url.hash && target.endsWith('.html')) {
      let anchor
      try {
        anchor = decodeURIComponent(url.hash.slice(1))
      } catch {
        assert.fail(`Invalid anchor ${href} in ${path.relative(dist, file)}`)
      }
      assert(
        docs.get(target)?.getElementById(anchor),
        `Missing anchor ${href} in ${path.relative(dist, file)}`
      )
      report.anchors++
    }
  }
  for (const img of doc.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src')
    if (!src.startsWith('/') || src.startsWith('//')) continue
    assert(resolve(src), `Missing image ${src}`)
    if (img.closest('.vp-doc,.wt-site'))
      assert(
        img.hasAttribute('width') && img.hasAttribute('height'),
        `Image needs dimensions: ${src}`
      )
    report.images++
  }
}
for (const file of files(path.join(root, 'docs/guide'))
  .concat(files(path.join(root, 'docs/config')))
  .filter((f) => f.endsWith('.md'))) {
  assert(
    fs.existsSync(path.join(root, 'docs/en', path.relative(path.join(root, 'docs'), file))),
    `Missing English equivalent: ${file}`
  )
}
for (const prefix of ['', '/en']) {
  const home = docs.get(resolve(based(prefix + '/')))
  assert(home.querySelector('.bv-home-header'), 'Homepage must use focused product navigation')
  assert(home.querySelector(`.bv-home-brand img[src="${based('/brand-icon.png')}"]`), 'Primary brand icon missing')
  const productName = prefix ? 'Wild Talker' : '万能说客 Wild Talker'
  assert(home.querySelector('.bv-home-brand')?.textContent.includes(prefix ? 'Wild Talker' : '万能说客'), 'Product navigation identity missing')
  assert.equal(home.querySelectorAll('.wt-hero h1').length, 1, 'Hero needs one primary headline')
  assert(home.querySelector('.wt-hero h1 span')?.textContent.includes(prefix ? 'Bilingual' : '双语翻译'), 'Product category must be explicit')
  assert(home.querySelector('.wt-intro')?.textContent.trim(), 'One-sentence introduction missing')
  const demo = home.querySelector(`.wt-recording img[src="${based('/showcase/selection-demo.gif')}"]`)
  assert(demo && resolve(demo.getAttribute('src')), 'Recorded release-build selection demo missing')
  assert(home.querySelector('.wt-recording figcaption')?.textContent.trim(), 'Recorded demo needs scope caption')
  assert.equal(home.querySelectorAll('.wt-improvements article').length, 3, 'Three focused improvements required')
  assert.equal(home.querySelector('.wt-actions .wt-primary')?.getAttribute('href'), releaseDownloadUrl, 'Download must be the exact Wild Talker Chrome / Edge ZIP')
  assert.equal(home.querySelector('.bv-home-header .wt-nav-download')?.getAttribute('href'), releaseDownloadUrl, 'Header download must be the exact Wild Talker Chrome / Edge ZIP')
  assert(home.querySelector(`a[href="${based(prefix + '/guide/getting-started')}"]`), 'First-use guide missing')
  assert(home.querySelector(`a[href="${based(prefix + '/guide/why-wild-talker')}"]`), 'Activation and verification conditions missing')
  for (const image of ['web-bilingual.png', 'selection-context.png', 'document-reader.png']) {
    const scene = home.querySelector(`.wt-scenes img[src="${based('/showcase/' + image)}"]`)
    assert(scene && resolve(scene.getAttribute('src')), 'Release scene missing: ' + image)
  }
  assert(!home.querySelector('.bv-promo,.support-options,.bv-browser-options'), 'Upstream promo or store installation must not appear on the product page')
  assert(home.querySelector('.wt-footer')?.textContent.includes('FluentRead') && home.querySelector('.wt-footer')?.textContent.includes('GPL-3.0'), 'Upstream provenance and license must be retained')
  const hub = docs.get(resolve(based(prefix + '/docs/')))
  assert(hub, 'Documentation hub missing')
  assert.equal(hub.querySelector('.VPNavBarTitle .title strong')?.textContent.trim(), prefix ? 'Wild Talker' : '万能说客')
  for (const page of [home, hub]) {
    assert.equal(page.querySelector('meta[property="og:site_name"]')?.getAttribute('content'), productName)
    assert(page.querySelector('title')?.textContent.includes(productName), 'Page title needs its locale product name')
  }
  assert(hub.querySelector('.fr-docs-start a') && hub.querySelectorAll('.fr-docs-links a').length >= 20, 'Quick start and inherited guide directory missing')
  assert(
    docs
      .get(resolve(based(prefix + '/config/translation-engines')))
      .querySelector('.vp-doc')
      .textContent.includes('{{apiKey}}'),
    'Provider placeholders must remain readable literal text'
  )
  const input = docs
    .get(resolve(based(prefix + '/guide/input-translation')))
    .querySelector('.vp-doc').textContent
  assert(input.includes('{{origin}}') && input.includes('{{to}}'), 'Prompt placeholders missing')
}
assert(
  !fs.existsSync(path.join(dist, 'maintainers')) && !fs.existsSync(path.join(dist, 'reports')),
  'Internal reports must stay out of the public website'
)
assert(fs.existsSync(path.join(dist, 'sitemap.xml')), 'Missing sitemap')
assert(!fs.existsSync(path.join(dist, 'CNAME')), 'No inherited custom-domain CNAME may be shipped')
console.log(JSON.stringify({ ok: true, ...report }))
