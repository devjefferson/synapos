#!/usr/bin/env node
// SessionStart: builds the [MEMORY_MAP] (context-engine §3.1) deterministically and injects it
// as additional context — memory headers, ADR/skill indexes, role memories and freshness of
// every knowledge file (sources changed after scanned_at).

const fs = require('fs');
const path = require('path');
const { readInput, projectDir, disabled, git, safe } = require('./_lib');

const MAX_CHARS = 10000;
const ADR_DIRS = ['docs/adrs', 'docs/adr', 'docs/tech/adr', 'docs/tech-context/adr', 'adr'];
const SKILL_SOURCES = [
  { dir: 'skills', file: /\.md$/ },
  { dir: 'docs/skills', file: /\.md$/ },
  { dir: '.claude/skills', skillDir: true },
  { dir: '.agents/skills', skillDir: true },
  { dir: '.cursor/rules', file: /\.mdc$/ },
  { dir: '.synapos/skills', skillDir: true },
];

safe(() => {
  if (disabled()) process.exit(0);
  const input = readInput();
  const root = projectDir(input);
  if (!fs.existsSync(path.join(root, '.synapos'))) process.exit(0);

  const mem = path.join(root, 'docs', '_memory');
  const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  const out = [];
  const stale = [];

  // Memory headers (never the full bodies)
  const pm = read(path.join(mem, 'project-memory.md'));
  const legacy = read(path.join(mem, 'project-learnings.md'));
  const headers = [];
  if (pm) headers.push(...memoryHeaders(pm));
  if (legacy) headers.push(...legacy.split('\n').filter((l) => /^## /.test(l)).map((l) => `${l.replace(/^## /, '### [LEARNING] ')} (legado)`));
  out.push(`Memórias (${headers.length}) — docs/_memory/project-memory.md:`);
  out.push(headers.length ? headers.join('\n') : '(nenhuma)');

  // ADR index
  const adrFiles = listAdrFiles(root);
  const adrIndex = read(path.join(mem, 'adr-index.md'));
  out.push('');
  if (adrIndex) {
    const rows = tableRows(adrIndex);
    out.push(`ADR index (${rows.length}):`, ...rows);
    const missing = adrFiles.filter((f) => !adrIndex.includes(path.basename(f)));
    if (missing.length) stale.push(`adr-index.md não inclui: ${missing.join(', ')}`);
    checkFresh(root, 'docs/_memory/adr-index.md', adrIndex, stale);
  } else {
    out.push(adrFiles.length
      ? `ADR index ausente — ${adrFiles.length} arquivo(s) de ADR: ${adrFiles.join(', ')}`
      : 'ADRs: nenhuma encontrada');
  }

  // Skills index
  const skills = listSkills(root);
  const skillsIndex = read(path.join(mem, 'skills-index.md'));
  out.push('');
  if (skillsIndex) {
    const rows = tableRows(skillsIndex);
    out.push(`Skills index (${rows.length}):`, ...rows);
    const missing = skills.filter((s) => !skillsIndex.includes(s.id));
    if (missing.length) stale.push(`skills-index.md não inclui: ${missing.map((s) => s.path).join(', ')}`);
    checkFresh(root, 'docs/_memory/skills-index.md', skillsIndex, stale);
  } else {
    out.push(skills.length
      ? `Skills index ausente — skills encontradas: ${skills.map((s) => s.path).join(', ')}`
      : 'Skills: nenhuma encontrada');
  }

  // Role memories and stack
  const rolesDir = path.join(mem, 'roles');
  const roles = fs.existsSync(rolesDir) ? fs.readdirSync(rolesDir).filter((f) => f.endsWith('.md')) : [];
  out.push('');
  out.push(roles.length ? 'Role memory:' : 'Role memory: nenhuma');
  for (const r of roles) {
    const text = read(path.join(rolesDir, r));
    const fm = frontmatter(text);
    out.push(`- roles/${r} · scanned_at: ${fm.scanned_at || '?'} · coverage: ${fm.coverage || '?'}`);
    checkFresh(root, `docs/_memory/roles/${r}`, text, stale);
  }
  const stack = read(path.join(mem, 'stack.md'));
  if (stack) checkFresh(root, 'docs/_memory/stack.md', stack, stale);

  out.push('');
  out.push(stale.length ? `Possivelmente desatualizados (atualize incrementalmente ao usar):\n- ${stale.join('\n- ')}` : 'Frescor: todos os arquivos de conhecimento estão em dia com seus sources.');

  let body = out.join('\n');
  if (body.length > MAX_CHARS) body = body.slice(0, MAX_CHARS) + '\n… (truncado — consulte os arquivos em docs/_memory/)';

  const context = `[MEMORY_MAP] gerado pelo hook SessionStart do Synapos (${new Date().toISOString().slice(0, 10)}).
Use como o mapa de context-engine §3.1 — não releia estes arquivos no boot; carregue o conteúdo de uma entrada só quando ela for relevante.

${body}`;

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }));
});

function memoryHeaders(text) {
  const lines = text.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^### \[/.test(lines[i])) continue;
    let status = 'active';
    for (let j = i + 1; j < Math.min(i + 5, lines.length) && !/^### /.test(lines[j]); j++) {
      const m = lines[j].match(/status:\s*(\w+)/);
      if (m) status = m[1];
    }
    result.push(status === 'active' ? lines[i] : `${lines[i]} (${status})`);
  }
  return result;
}

function tableRows(text) {
  return text.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1);
}

function frontmatter(text) {
  const m = text && text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

function parseList(value) {
  if (!value) return [];
  return value.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

function checkFresh(root, file, text, stale) {
  const fm = frontmatter(text);
  const sources = parseList(fm.sources);
  if (!fm.scanned_at || !sources.length) return;
  const last = git(root, ['log', '-1', '--format=%cs', '--', ...sources]);
  if (last && last > fm.scanned_at) stale.push(`${file} — sources alterados em ${last} (scanned_at ${fm.scanned_at})`);
  const dirty = git(root, ['status', '--porcelain', '--', ...sources]);
  if (dirty) stale.push(`${file} — sources com alterações não commitadas`);
}

function listAdrFiles(root) {
  const found = new Set();
  for (const d of ADR_DIRS) {
    const abs = path.join(root, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) if (f.endsWith('.md')) found.add(path.join(d, f));
  }
  const docs = path.join(root, 'docs');
  if (fs.existsSync(docs)) {
    for (const f of fs.readdirSync(docs)) if (/\.md$/.test(f) && /adr|decision/i.test(f)) found.add(path.join('docs', f));
  }
  return [...found];
}

function listSkills(root) {
  const skills = [];
  for (const src of SKILL_SOURCES) {
    const abs = path.join(root, src.dir);
    if (!fs.existsSync(abs)) continue;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (src.skillDir && e.isDirectory() && fs.existsSync(path.join(abs, e.name, 'SKILL.md'))) {
        skills.push({ id: e.name, path: path.join(src.dir, e.name, 'SKILL.md') });
      } else if (src.file && e.isFile() && src.file.test(e.name)) {
        skills.push({ id: e.name.replace(/\.mdc?$/, ''), path: path.join(src.dir, e.name) });
      }
    }
  }
  return skills;
}
