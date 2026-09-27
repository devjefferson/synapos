#!/usr/bin/env node
// Static integrity checks for the Synapos framework (.synapos/).
// Catches reference drift: broken step paths, unknown agents/gates, dangling depends_on,
// references to removed files, and growth of the always-loaded context.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SYN = path.join(ROOT, '.synapos');
const TEMPLATES = path.join(SYN, 'squad-templates');
const CORE_PIPELINES = path.join(SYN, 'core', 'pipelines');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const rel = (p) => path.relative(ROOT, p);

// Gates defined in gate-system.md (plus legacy aliases documented there)
const gateDoc = fs.readFileSync(path.join(SYN, 'core', 'gate-system.md'), 'utf8');
const definedGates = new Set([...gateDoc.matchAll(/`?(GATE-[A-Z0-9a-z]+)`?/g)].map((m) => m[1]));
const VALID_TRACKS = new Set(['quick', 'standard', 'complex']);

// Minimal parser for the YAML subset used by pipelines/templates
function parseSteps(text) {
  const steps = [];
  let cur = null;
  let inSteps = false;
  let listKey = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '');
    if (/^steps:\s*$/.test(line)) { inSteps = true; continue; }
    if (!inSteps) continue;
    if (/^\S/.test(line) && line.trim()) { inSteps = false; continue; }
    const start = line.match(/^  - id:\s*(.+)$/);
    if (start) { cur = { id: unq(start[1]) }; steps.push(cur); listKey = null; continue; }
    if (!cur) continue;
    const kv = line.match(/^    ([a-z_]+):\s*(.*)$/);
    if (kv) {
      const [, k, v] = kv;
      if (v === '') { listKey = k; cur[k] = []; }
      else { cur[k] = parseValue(v); listKey = null; }
      continue;
    }
    const item = line.match(/^      - (.+)$/);
    if (item && listKey && Array.isArray(cur[listKey])) cur[listKey].push(unq(item[1]));
  }
  return steps;
}
function unq(s) { return s.trim().replace(/^["']|["']$/g, ''); }
function parseValue(v) {
  v = v.trim();
  if (v.startsWith('[')) return v.slice(1, -1).split(',').map((x) => unq(x)).filter(Boolean);
  return unq(v);
}

function templateAgents(text) {
  const ids = [...text.matchAll(/^\s+- id:\s*(\S+)\s*\n\s+file:\s*(\S+)/gm)].map((m) => ({ id: m[1], file: m[2] }));
  return ids;
}

function resolveStepFile(file, baseDir, templateDir) {
  // Squad pipelines are copied to .synapos/squads/{slug}/pipeline/, while templates keep
  // them in pipelines/ (or pipeline/ for engineer). Paths resolve from the squad dir,
  // which sits at the same depth as the template dir.
  const candidates = [path.resolve(baseDir, file)];
  if (templateDir && file.startsWith('pipeline/')) {
    candidates.push(path.resolve(templateDir, file.replace(/^pipeline\//, 'pipelines/')));
  }
  return candidates.find((c) => fs.existsSync(c));
}

function checkPipeline(file, { baseDir, templateDir, agents, label }) {
  const text = fs.readFileSync(file, 'utf8');
  const steps = parseSteps(text);
  if (!steps.length) err(`${label}: nenhum step encontrado`);
  const ids = new Set(steps.map((s) => s.id));
  for (const s of steps) {
    const where = `${label} › ${s.id}`;
    if (!s.file) err(`${where}: sem file:`);
    else if (!resolveStepFile(s.file, baseDir, templateDir)) err(`${where}: arquivo não encontrado: ${s.file}`);
    if (s.agent && agents && !agents.has(s.agent) && !/^\{.+\}$/.test(s.agent)) err(`${where}: agent desconhecido: ${s.agent}`);
    if (s.gate && !definedGates.has(s.gate)) err(`${where}: gate não definido em gate-system.md: ${s.gate}`);
    for (const d of [].concat(s.depends_on || [])) if (!ids.has(d)) err(`${where}: depends_on inexistente: ${d}`);
    for (const k of ['on_reject', 'needs_full_output_of']) if (s[k] && !ids.has(s[k])) err(`${where}: ${k} inexistente: ${s[k]}`);
    for (const t of [].concat(s.tracks || [])) if (!VALID_TRACKS.has(t)) err(`${where}: track inválido: ${t}`);
    if (s.execution && !['inline', 'subagent', 'checkpoint'].includes(s.execution)) err(`${where}: execution inválido: ${s.execution}`);
    if (s.execution !== 'checkpoint' && !s.agent) warnings.push(`${where}: step ${s.execution || '?'} sem agent`);
  }
}

// 1. Core pipelines
for (const f of fs.readdirSync(CORE_PIPELINES).filter((f) => f.endsWith('.yaml'))) {
  checkPipeline(path.join(CORE_PIPELINES, f), { baseDir: CORE_PIPELINES, label: `core/pipelines/${f}` });
}

// 2. Squad templates
for (const dom of fs.readdirSync(TEMPLATES)) {
  const tdir = path.join(TEMPLATES, dom);
  const tfile = path.join(tdir, 'template.yaml');
  if (!fs.existsSync(tfile)) continue;
  const ttext = fs.readFileSync(tfile, 'utf8');
  const agents = templateAgents(ttext);
  const agentIds = new Set(agents.map((a) => a.id));
  for (const a of agents) if (!fs.existsSync(path.resolve(tdir, a.file))) err(`${dom}/template.yaml: agent file não encontrado: ${a.file}`);
  const qr = ttext.match(/^quick_role:\s*(\S+)/m);
  if (!qr) err(`${dom}/template.yaml: sem quick_role`);
  else if (!agentIds.has(qr[1])) err(`${dom}/template.yaml: quick_role desconhecido: ${qr[1]}`);
  const pipes = [...ttext.matchAll(/^\s+- id:\s*(\S+)\s*\n\s+name:.*\n\s+description:.*\n\s+file:\s*(\S+)/gm)];
  const def = (ttext.match(/^\s+default:\s*(\S+)/m) || [])[1];
  if (def && !pipes.some((p) => p[1] === def)) err(`${dom}/template.yaml: pipeline default inexistente: ${def}`);
  for (const [, id, pf] of pipes) {
    const pfile = path.resolve(tdir, pf);
    if (!fs.existsSync(pfile)) { err(`${dom}/template.yaml: pipeline ${id} não encontrado: ${pf}`); continue; }
    checkPipeline(pfile, { baseDir: tdir, templateDir: tdir, agents: agentIds, label: `${dom}/${pf}` });
  }
}

// 3. References to framework files inside markdown/yaml must exist
const REMOVED = ['session-manifest.md'];
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(md|ya?ml|mdc)$/.test(e.name)) out.push(p);
  }
  return out;
}
const docs = walk(SYN).concat(['AGENTS.md', '.github/copilot-instructions.md', '.antigravity/rules.md'].map((f) => path.join(ROOT, f)).filter(fs.existsSync));
for (const f of docs) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/`(\.synapos\/(?:core|skills)\/[A-Za-z0-9_./-]+\.(?:md|ya?ml))`/g)) {
    if (!fs.existsSync(path.join(ROOT, m[1]))) err(`${rel(f)}: referência a arquivo inexistente: ${m[1]}`);
  }
  for (const r of REMOVED) if (text.includes(r) && !/ignorad|substituíd|legad|removid/i.test(text.slice(Math.max(0, text.indexOf(r) - 200), text.indexOf(r) + 200))) {
    err(`${rel(f)}: referência a arquivo removido sem nota de legado: ${r}`);
  }
}

// 4. Always-loaded context budget (read by every standard-track run)
const ALWAYS = ['orchestrator.md', 'pipeline-runner.md', 'compliance-protocol.md', 'context-engine.md', 'skills-engine.md', 'gate-system.md'];
const BASELINE_V35 = 99420; // orchestrator + pipeline-runner + compliance-protocol + gate-system in v3.5.0
const BUDGET = 80000;
const sizes = ALWAYS.map((f) => [f, fs.statSync(path.join(SYN, 'core', f)).size]);
const total = sizes.reduce((a, [, s]) => a + s, 0);
if (total > BUDGET) err(`contexto sempre-carregado ${total}B > orçamento ${BUDGET}B`);

// Report
console.log('Contexto sempre-carregado por execução (core):');
for (const [f, s] of sizes) console.log(`  ${f.padEnd(24)} ${String(s).padStart(6)} B`);
console.log(`  ${'TOTAL'.padEnd(24)} ${String(total).padStart(6)} B  (v3.5.0: ${BASELINE_V35} B com 4 arquivos · ${Math.round((1 - total / BASELINE_V35) * 100)}% menor)`);
for (const w of warnings) console.log(`⚠️  ${w}`);
if (errors.length) {
  console.log(`\n❌ ${errors.length} erro(s):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\n✅ Framework íntegro');
