#!/usr/bin/env node
// PreToolUse (Bash): blocks `git add` / `git commit` that would stage .env* files or framework
// files in .synapos/ (except .synapos/squads/) — same rule as pipeline-runner FASE 3.4.

const path = require('path');
const { readInput, projectDir, disabled, isFrameworkRepo, git, block, safe } = require('./_lib');

const ENV_ALLOWED = /\.(example|sample|template)$/;

safe(() => {
  if (disabled()) process.exit(0);
  const input = readInput();
  const command = input.tool_input?.command || '';
  if (!/\bgit\b/.test(command)) process.exit(0);

  const root = projectDir(input);
  const frameworkRepo = isFrameworkRepo(root);
  const candidates = new Set();

  for (const segment of command.split(/&&|\|\||;|\n/)) {
    const tokens = segment.trim().split(/\s+/);
    const gi = tokens.indexOf('git');
    if (gi === -1) continue;
    const sub = tokens.slice(gi + 1).find((t) => !t.startsWith('-'));
    const args = tokens.slice(tokens.indexOf(sub) + 1);

    if (sub === 'add') {
      const broad = args.some((a) => ['-A', '--all', '.', ':/', '-u', '--update'].includes(a));
      if (broad) porcelain(root).forEach((f) => candidates.add(f));
      args.filter((a) => !a.startsWith('-')).forEach((a) => candidates.add(a.replace(/^["']|["']$/g, '')));
    } else if (sub === 'commit') {
      lines(git(root, ['diff', '--cached', '--name-only'])).forEach((f) => candidates.add(f));
      const all = args.some((a) => a === '--all' || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(a));
      if (all) lines(git(root, ['diff', '--name-only'])).forEach((f) => candidates.add(f));
    }
  }

  const risky = [...candidates].filter((f) => {
    const rel = f.split(path.sep).join('/').replace(/^\.\//, '');
    const base = path.basename(rel);
    if (/^\.env(\..+)?$/.test(base) && !ENV_ALLOWED.test(base)) return true;
    return !frameworkRepo && rel.startsWith('.synapos/') && !rel.startsWith('.synapos/squads/');
  });

  if (risky.length) {
    block(`Synapos: commit/stage bloqueado — arquivos que nunca devem ir para o repositório por este fluxo:
${risky.map((f) => `  - ${f}`).join('\n')}
Faça stage explícito só dos arquivos da tarefa (git add <arquivos>) ou remova-os do stage (git restore --staged <arquivo>).`);
  }
});

function lines(text) {
  return text ? text.split('\n').filter(Boolean) : [];
}

function porcelain(root) {
  return lines(git(root, ['status', '--porcelain', '-uall'])).map((l) => {
    const p = l.slice(3);
    return p.includes(' -> ') ? p.split(' -> ')[1] : p;
  }).map((p) => p.replace(/^"|"$/g, ''));
}
