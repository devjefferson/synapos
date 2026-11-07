'use strict';

// `npx synapos doctor` — verifica a instalação do Synapos no projeto e as citações de evidência
// (`path:linha`) nos docs. Só checagem automática: não prova que o conteúdo está correto.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REQUIRED_CORE = ['orchestrator.md', 'pipeline-runner.md', 'compliance-protocol.md', 'context-engine.md', 'skills-engine.md', 'gate-system.md'];
const MCP_SERVER_OF_SKILL = { 'playwright-browser': 'playwright', github: 'github' };
const CODE_EXT = 'ts|tsx|js|jsx|mjs|cjs|json|md|mdx|yaml|yml|py|go|rs|java|kt|rb|php|css|scss|html|sql|sh|toml|vue|svelte|swift|cs|c|h|cpp';
const CITATION = new RegExp('`([A-Za-z0-9_@./\\\\-]+\\.(?:' + CODE_EXT + ')):(\\d+)(?:-(\\d+))?`', 'g');
const SKIP_DIRS = new Set(['node_modules', '.git', 'archive']);

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function walkMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function lineCount(file) {
  const text = fs.readFileSync(file, 'utf8');
  return text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
}

function checkInstall(root, r) {
  const syn = path.join(root, '.synapos');
  if (!fs.existsSync(syn)) { r.error('.synapos/ não encontrado — rode `npx synapos` neste projeto'); return false; }

  const version = fs.existsSync(path.join(syn, 'VERSION')) ? fs.readFileSync(path.join(syn, 'VERSION'), 'utf8').trim() : null;
  const manifest = readJson(path.join(syn, '.manifest.json'));
  if (!version) r.error('.synapos/VERSION ausente');
  else if (!manifest) r.warn('.synapos/.manifest.json ausente ou inválido');
  else if (manifest.framework && manifest.framework.version !== version) {
    r.warn(`versão incoerente: VERSION=${version} × manifest=${manifest.framework.version}`);
  }

  for (const f of REQUIRED_CORE) {
    if (!fs.existsSync(path.join(syn, 'core', f))) r.error(`core/${f} ausente`);
  }
  return true;
}

function checkHooks(root, r) {
  if (!fs.existsSync(path.join(root, '.claude'))) return;
  const settings = readJson(path.join(root, '.claude', 'settings.json'));
  if (!settings) { r.warn('.claude/settings.json ausente ou inválido — hooks do Synapos não ativos'); return; }
  const text = JSON.stringify(settings.hooks || {});
  for (const h of ['session-start.js', 'guard-framework.js', 'guard-commit.js']) {
    if (!text.includes(h)) r.warn(`hook ${h} não registrado em .claude/settings.json`);
    else if (!fs.existsSync(path.join(root, '.synapos', 'hooks', 'claude', h))) r.error(`hook ${h} registrado mas o script não existe`);
  }
}

function skillIds(root) {
  const ids = new Set();
  for (const dir of ['.synapos/skills', '.claude/skills', '.agents/skills']) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (e.isDirectory() && fs.existsSync(path.join(abs, e.name, 'SKILL.md'))) ids.add(e.name);
    }
  }
  return ids;
}

function checkSkills(root, r) {
  const ids = skillIds(root);
  const squads = path.join(root, '.synapos', 'squads');
  if (fs.existsSync(squads)) {
    for (const f of walkYaml(squads)) {
      const text = fs.readFileSync(f, 'utf8');
      for (const m of text.matchAll(/^\s+skills:\s*\[([^\]]*)\]/gm)) {
        for (const id of m[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)) {
          if (!ids.has(id)) r.error(`${path.relative(root, f)}: skill declarada inexistente: ${id}`);
        }
      }
    }
  }
  const mcp = readJson(path.join(root, '.mcp.json'));
  const servers = mcp && mcp.mcpServers ? Object.keys(mcp.mcpServers) : [];
  for (const [skill, server] of Object.entries(MCP_SERVER_OF_SKILL)) {
    if (ids.has(skill) && !servers.includes(server)) {
      r.warn(`skill ${skill} instalada, mas o MCP "${server}" não está em .mcp.json (rode \`npx synapos --mcp\`) — a skill ficará indisponível`);
    }
  }
}

function walkYaml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkYaml(p, out);
    else if (/\.ya?ml$/.test(e.name)) out.push(p);
  }
  return out;
}

function checkEvidence(root, r) {
  const files = walkMd(path.join(root, 'docs'));
  let checked = 0;
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, ''); // exemplos em blocos de código não contam
    for (const m of text.matchAll(CITATION)) {
      const [, rel, a, b] = m;
      const start = Number(a);
      const end = b ? Number(b) : start;
      const where = `${path.relative(root, f)}: \`${rel}:${a}${b ? '-' + b : ''}\``;
      const target = path.resolve(root, rel);
      if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        r.error(`${where} — arquivo citado não existe`);
      } else if (start < 1 || end < start) {
        r.error(`${where} — intervalo inválido`);
      } else if (end > lineCount(target)) {
        r.error(`${where} — fora do arquivo (${lineCount(target)} linhas)`);
      }
      checked++;
    }
  }
  r.info(`${checked} citação(ões) de evidência verificada(s) em ${files.length} doc(s)`);
}

function checkUpdate(root, r) {
  const pkg = readJson(path.join(__dirname, '..', 'package.json'));
  const res = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['view', 'synapos', 'version'], { encoding: 'utf8', timeout: 5000 });
  const latest = (res.stdout || '').trim();
  if (res.status !== 0 || !latest) { r.info('atualização: não foi possível consultar o npm (offline?)'); return; }
  if (pkg && latest !== pkg.version) r.warn(`atualização disponível: instalado ${pkg.version} → npm ${latest} (\`npx synapos@latest\`)`);
  else r.info(`pacote em dia (${latest})`);
}

function doctor(root, opts = {}) {
  const result = { errors: [], warnings: [], infos: [], error(m) { this.errors.push(m); }, warn(m) { this.warnings.push(m); }, info(m) { this.infos.push(m); } };
  if (checkInstall(root, result)) {
    checkHooks(root, result);
    checkSkills(root, result);
    checkEvidence(root, result);
  }
  if (opts.checkUpdate) checkUpdate(root, result);
  return result;
}

function run(argv, root = process.cwd()) {
  const r = doctor(root, { checkUpdate: argv.includes('--check-update') });
  for (const m of r.errors) console.log('  ✖  ' + m);
  for (const m of r.warnings) console.log('  ⚠  ' + m);
  for (const m of r.infos) console.log('  →  ' + m);
  console.log(`\n  ${r.errors.length} erro(s), ${r.warnings.length} aviso(s). Checagem automática: não prova que o conteúdo dos docs está correto.`);
  return r.errors.length ? 1 : 0;
}

module.exports = { doctor, run };
