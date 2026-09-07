#!/usr/bin/env node
/**
 * Build the deployable site into dist/.
 *
 *   node tools/build.js
 *
 * Two outputs, from one source of truth in src/:
 *   dist/index.html   the site, with style.css and script.js inlined so the
 *                     whole document is one request and works from file://
 *   dist/*            robots, sitemap, manifest, icons, social card
 *
 * No dependencies. Node's standard library only.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// ---------------------------------------------------------------------------
// The canonical address of the deployed site.
//
// Change this ONE value to move the site to a custom domain and every absolute
// URL follows: canonical, og:url, og:image, twitter:image, robots.txt, the
// sitemap, and every @id in the JSON-LD graph. Keep the trailing slash.
//
// Override per-build with:  SITE_URL=https://example.org/ node tools/build.js
// ---------------------------------------------------------------------------
const DEFAULT_SITE_URL =
  'https://danieljtrujillo.github.io/military-chemical-exposure-and-multigenerational-genotoxic-compounding/';

const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/*$/, '/');

/** Swap the placeholder base for the configured one throughout a text file. */
function applySiteUrl(text) {
  if (SITE_URL === DEFAULT_SITE_URL) return text;
  return text.split(DEFAULT_SITE_URL).join(SITE_URL);
}

// Files copied verbatim. Everything else in src/ is inlined or ignored.
const STATIC = [
  'robots.txt',
  'sitemap.xml',
  'humans.txt',
  'site.webmanifest',
  'favicon.svg',
  'og-image.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];

function read(file) {
  return fs.readFileSync(path.join(SRC, file), 'utf8');
}

function inline() {
  const css = read('style.css');
  const js = read('script.js');
  let html = read('index.html');

  const cssTag = '<link rel="stylesheet" href="style.css">';
  const jsTag = '<script src="script.js"></script>';

  if (!html.includes(cssTag)) throw new Error('build: stylesheet link not found in src/index.html');
  if (!html.includes(jsTag)) throw new Error('build: script tag not found in src/index.html');

  html = html.replace(cssTag, `<style>\n${css}\n</style>`);
  // Guard against a literal </script> inside the JS closing the tag early.
  html = html.replace(jsTag, `<script>\n${js.replace(/<\/script>/gi, '<\/script>')}\n</script>`);

  return html;
}

function main() {
  // Clear the directory's contents rather than the directory itself: on Windows
  // a running preview server holding dist/ as its cwd makes an rm of the folder
  // fail with EPERM.
  fs.mkdirSync(DIST, { recursive: true });
  for (const entry of fs.readdirSync(DIST)) {
    fs.rmSync(path.join(DIST, entry), { recursive: true, force: true });
  }

  const html = applySiteUrl(inline());
  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

  let copied = 0;
  for (const file of STATIC) {
    const from = path.join(SRC, file);
    if (!fs.existsSync(from)) {
      console.warn(`  ! missing, skipped: ${file}`);
      continue;
    }
    if (/\.(txt|xml|webmanifest)$/.test(file)) {
      fs.writeFileSync(path.join(DIST, file),
        applySiteUrl(fs.readFileSync(from, 'utf8')), 'utf8');
    } else {
      fs.copyFileSync(from, path.join(DIST, file));
    }
    copied++;
  }

  // 404 falls back to the document itself; there is only one page.
  fs.writeFileSync(path.join(DIST, '404.html'), html, 'utf8');
  // Stop Pages running the output through Jekyll.
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '', 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`built dist/index.html  ${kb} KB (self-contained)`);
  console.log(`site url  ${SITE_URL}`);
  console.log(`copied ${copied}/${STATIC.length} static files`);
}

main();
