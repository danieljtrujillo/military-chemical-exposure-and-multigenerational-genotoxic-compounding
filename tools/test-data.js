#!/usr/bin/env node
/**
 * Data-integrity checks for the evidence map.
 *
 *   node tools/test-data.js
 *
 * The content lives as structured objects in src/script.js with no schema and
 * no types, so these assertions are the only thing standing between a typo and
 * a silently broken diagram. The unused-pathway check exists because a legend
 * entry with no edges once rendered as a filter that blanked the entire graph.
 *
 * Node standard library only.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.resolve(__dirname, '..', 'src');

let failures = 0;
let warnings = 0;
let checks = 0;

/** A broken reference. Fails the build. */
function check(label, condition, detail) {
  checks++;
  if (condition) return;
  failures++;
  console.error(`  FAIL  ${label}`);
  if (detail) console.error(`        ${detail}`);
}

/** An editorial gap. Worth surfacing, but not corruption, so it does not fail. */
function warn(label, condition, detail) {
  checks++;
  if (condition) return;
  warnings++;
  console.warn(`  WARN  ${label}`);
  if (detail) console.warn(`        ${detail}`);
}

/**
 * Pull a top-level array/object literal out of script.js and evaluate it in a
 * sandbox. The file is browser code that touches document on load, so it cannot
 * simply be required.
 */
function extract(source, declaration) {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`could not find "${declaration}" in src/script.js`);

  const openIndex = source.indexOf('=', start) + 1;
  let i = openIndex;
  while (i < source.length && /\s/.test(source[i])) i++;

  const opener = source[i];
  const closer = opener === '[' ? ']' : '}';
  let depth = 0;
  let inString = null;
  let escaped = false;

  for (; i < source.length; i++) {
    const ch = source[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (inString) { if (ch === inString) inString = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }
    if (ch === opener) depth++;
    else if (ch === closer) {
      depth--;
      if (depth === 0) {
        const literal = source.slice(source.indexOf(opener, openIndex), i + 1);
        return vm.runInNewContext(`(${literal})`);
      }
    }
  }
  throw new Error(`unbalanced literal for "${declaration}"`);
}

const source = fs.readFileSync(path.join(SRC, 'script.js'), 'utf8');
const nodes = extract(source, 'const nodes');
const pathways = extract(source, 'const pathways');
const edges = extract(source, 'const edges');
const exposures = extract(source, 'const exposures');

const nodeIds = new Set(nodes.map(n => n.id));

const pathwayKeys = new Set(Object.keys(pathways));

console.log(`\n  ${nodes.length} conditions · ${edges.length} connections · ` +
            `${exposures.length} exposures · ${Object.keys(pathways).length} pathways\n`);

// --- Nodes -----------------------------------------------------------------
check('node ids are unique', nodeIds.size === nodes.length,
  `${nodes.length} nodes but ${nodeIds.size} distinct ids`);

nodes.forEach(n => {
  check(`node "${n.id}" has a label`, !!n.label);
  check(`node "${n.id}" has a description`, typeof n.desc === 'string' && n.desc.length > 40,
    'descriptions carry the plain-language explanation and should not be stubs');
  check(`node "${n.id}" has numeric coordinates`,
    Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.r));
  check(`node "${n.id}" sits inside the 680x520 viewBox`,
    n.x - n.r >= 0 && n.x + n.r <= 680 && n.y - n.r >= 0 && n.y + n.r <= 520,
    `x=${n.x} y=${n.y} r=${n.r}`);
});

// --- Node overlap ----------------------------------------------------------
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    const gap = Math.hypot(a.x - b.x, a.y - b.y) - (a.r + b.r);
    check(`nodes "${a.id}" and "${b.id}" do not overlap`, gap > 0,
      `circles intersect by ${Math.abs(gap).toFixed(1)}px`);
  }
}

// --- Edges -----------------------------------------------------------------
edges.forEach((e, i) => {
  check(`edge ${i} "from" resolves to a node`, nodeIds.has(e.from), `unknown id "${e.from}"`);
  check(`edge ${i} "to" resolves to a node`, nodeIds.has(e.to), `unknown id "${e.to}"`);
  check(`edge ${i} pathway resolves`, pathwayKeys.has(e.path), `unknown pathway "${e.path}"`);
  check(`edge ${i} is not a self-loop`, e.from !== e.to);
  check(`edge ${i} has evidence text`, typeof e.info === 'string' && e.info.length > 40);
});

const seenPairs = new Set();
edges.forEach((e, i) => {
  const key = [e.from, e.to].sort().join('~');
  check(`edge ${i} (${e.from}-${e.to}) is not a duplicate`, !seenPairs.has(key));
  seenPairs.add(key);
});

// --- Pathways --------------------------------------------------------------
// The bug this file exists for: a pathway with no edges renders a legend
// control that dims every connection and looks like the diagram broke.
const usedPathways = new Set(edges.map(e => e.path));
pathwayKeys.forEach(key => {
  check(`pathway "${key}" is used by at least one edge`, usedPathways.has(key),
    'an unused pathway becomes a legend filter that blanks the graph');
});
Object.entries(pathways).forEach(([key, val]) => {
  check(`pathway "${key}" has a label and colour`, !!val.label && /^#[0-9a-f]{6}$/i.test(val.color));
});

// --- Orphans ---------------------------------------------------------------
nodes.forEach(n => {
  const degree = edges.filter(e => e.from === n.id || e.to === n.id).length;
  check(`node "${n.id}" has at least one connection`, degree > 0,
    'an unconnected circle has nothing to explain');
});

// --- Exposures -------------------------------------------------------------
const strengths = new Set(['strong', 'moderate', 'emerging']);
const exposureIds = new Set(exposures.map(e => e.id));
check('exposure ids are unique', exposureIds.size === exposures.length);

exposures.forEach(exp => {
  check(`exposure "${exp.id}" has a display name`, !!exp.short);
  check(`exposure "${exp.id}" has a mechanism`,
    typeof exp.mechanism === 'string' && exp.mechanism.length > 60);
  check(`exposure "${exp.id}" has targets`, Array.isArray(exp.targets) && exp.targets.length > 0);

  (exp.targets || []).forEach((tgt, i) => {
    check(`exposure "${exp.id}" target ${i} has a valid strength`, strengths.has(tgt.strength),
      `got "${tgt.strength}"`);
    check(`exposure "${exp.id}" target ${i} has a note`,
      typeof tgt.note === 'string' && tgt.note.length > 40);
    // Figures 1 and 2 are joined by node id. They were once joined by display
    // string, which silently drifted apart as labels were edited.
    check(`exposure "${exp.id}" target "${tgt.name}" resolves to a condition`,
      nodeIds.has(tgt.d),
      `target id "${tgt.d}" is not a node - figures 1 and 2 have drifted apart`);
    check(`exposure "${exp.id}" target ${i} has a display name`, !!tgt.name);
  });
});

// --- Editorial completeness ------------------------------------------------
// Not corruption, but a condition no exposure reaches is disconnected from the
// argument the page is making, and worth knowing about.
const targeted = new Set();
exposures.forEach(e => (e.targets || []).forEach(t => targeted.add(t.d)));
nodes.forEach(n => {
  warn(`condition "${n.label}" is linked to at least one exposure`, targeted.has(n.id),
    'no exposure currently targets it');
});

// --- Report ----------------------------------------------------------------
const summary = `  ${checks - failures - warnings} passed` +
  (warnings ? `, ${warnings} warning${warnings === 1 ? '' : 's'}` : '') +
  (failures ? `, ${failures} failed` : '') +
  ` of ${checks} checks`;

if (failures) {
  console.error(`\n${summary}\n`);
  process.exit(1);
}
console.log(`\n${summary}\n`);
