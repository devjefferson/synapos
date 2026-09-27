#!/usr/bin/env node
// Behavioral tests for the Claude Code hooks in .synapos/hooks/claude/ and the installer merge.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOOKS = path.join(ROOT, '.synapos', 'hooks', 'claude');
let failures = 0;

function check(name, cond, detail = '') {
  console.log(`${cond ? '✅' : '❌'} ${name}${cond ? '' : ` — ${detail}`}`);
  if (!cond) failures++;
}

function project(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapos-hooks-'));
  fs.mkdirSync(path.join(dir, '.synapos', 'core'), { recursive: true });
  for (const [f, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), content);
  }
  const g = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  g('init', '-q');
  g('add', '-A');
  g('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'init', '--allow-empty');
  return dir;
}

function run(script, dir, input, env = {}) {
  const r = spawnSync('node', [path.join(HOOKS, script)], {
    input: JSON.stringify({ cwd: dir, ...input }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: dir, ...env },
    encoding: 'utf8',
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

// ── guard-framework ─────────────────────────────────────────────────────────
{
  const dir = project();
  const edit = (file_path) => run('guard-framework.js', dir, { tool_name: 'Edit', tool_input: { file_path } });
  check('guard-framework bloqueia .synapos/core', edit(path.join(dir, '.synapos/core/orchestrator.md')).code === 2);
  check('guard-framework permite .synapos/squads', edit(path.join(dir, '.synapos/squads/fe-001/squad.yaml')).code === 0);
  check('guard-framework permite código do projeto', edit('src/app/page.tsx').code === 0);
  check('guard-framework respeita SYNAPOS_ALLOW_FRAMEWORK_EDIT', run('guard-framework.js', dir,
    { tool_input: { file_path: '.synapos/core/x.md' } }, { SYNAPOS_ALLOW_FRAMEWORK_EDIT: '1' }).code === 0);
  check('guard-framework desligado com SYNAPOS_HOOKS=off', run('guard-framework.js', dir,
    { tool_input: { file_path: '.synapos/core/x.md' } }, { SYNAPOS_HOOKS: 'off' }).code === 0);
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"synapos"}');
  check('guard-framework permite no repo do framework', edit('.synapos/core/x.md').code === 0);
}

// ── guard-commit ────────────────────────────────────────────────────────────
{
  const dir = project({ 'src/a.ts': 'a' });
  fs.writeFileSync(path.join(dir, '.env'), 'SECRET=1');
  fs.mkdirSync(path.join(dir, 'config'));
  fs.writeFileSync(path.join(dir, 'config', '.env.production'), 'SECRET=2');
  fs.writeFileSync(path.join(dir, '.env.example'), 'SECRET=');
  fs.writeFileSync(path.join(dir, 'src/a.ts'), 'b');
  const bash = (command) => run('guard-commit.js', dir, { tool_name: 'Bash', tool_input: { command } });

  const addAll = bash('git add -A && git commit -m x');
  check('guard-commit bloqueia git add -A com .env', addAll.code === 2 && /\.env/.test(addAll.stderr), addAll.stderr);
  check('guard-commit vê .env em diretório não rastreado', /config\/\.env\.production/.test(addAll.stderr), addAll.stderr);
  check('guard-commit ignora .env.example', !/\.env\.example/.test(addAll.stderr), addAll.stderr);
  check('guard-commit permite stage explícito', bash('git add src/a.ts').code === 0);
  check('guard-commit bloqueia .env explícito', bash('git add .env').code === 2);
  check('guard-commit bloqueia .synapos/core', bash('git add .synapos/core/orchestrator.md').code === 2);
  check('guard-commit permite .synapos/squads', bash('git add .synapos/squads/fe-001/squad.yaml').code === 0);
  check('guard-commit ignora comandos sem git', bash('npm test').code === 0);

  execFileSync('git', ['add', '-f', '.env'], { cwd: dir });
  check('guard-commit bloqueia commit com .env já staged', bash('git commit -m "x"').code === 2);
}

// ── session-start ───────────────────────────────────────────────────────────
{
  const dir = project({
    'docs/_memory/project-memory.md': `# Project Memory

### [RULE] Textos em capitalização de frase
why: pedido do time · how: rótulos e títulos
scope: global · source: usuário · confidence: high · status: active

### [FACT] Ícones via lucide-react
scope: role:frontend · source: package.json · confidence: high · status: stale
`,
    'docs/_memory/stack.md': '---\nscanned_at: 2020-01-01\nsources: [package.json]\n---\n# Stack\n',
    'package.json': '{"name":"app"}',
    'docs/adrs/adr-001-forms.md': '# ADR-001',
    'docs/adrs/adr-002-dados.md': '# ADR-002',
    'docs/_memory/adr-index.md': '---\nscanned_at: 2999-01-01\nsources: [docs/adrs/]\n---\n| id | status |\n|----|----|\n| adr-001 | active | docs/adrs/adr-001-forms.md |\n',
    'skills/ux.md': '---\nname: ux\n---\n',
  });
  const r = run('session-start.js', dir, { hook_event_name: 'SessionStart', source: 'startup' });
  let ctx = '';
  try { ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch {}
  check('session-start retorna additionalContext', r.code === 0 && ctx.startsWith('[MEMORY_MAP]'), r.stdout);
  check('session-start lista cabeçalhos, não corpos', /\[RULE\] Textos/.test(ctx) && !/why: pedido/.test(ctx), ctx);
  check('session-start marca entrada stale', /lucide-react \(stale\)/.test(ctx), ctx);
  check('session-start detecta ADR fora do índice', /adr-index\.md não inclui: docs\/adrs\/adr-002-dados\.md/.test(ctx), ctx);
  check('session-start detecta stack.md desatualizado', /stack\.md — sources alterados/.test(ctx), ctx);
  check('session-start aponta skills sem índice', /Skills index ausente — skills encontradas: skills\/ux\.md/.test(ctx), ctx);

  const none = fs.mkdtempSync(path.join(os.tmpdir(), 'no-synapos-'));
  const r2 = run('session-start.js', none, {});
  check('session-start não faz nada fora de projeto Synapos', r2.code === 0 && r2.stdout === '');
}

// ── installer merge ─────────────────────────────────────────────────────────
{
  const src = fs.readFileSync(path.join(ROOT, 'bin', 'synapos.js'), 'utf8');
  const start = src.indexOf('// Claude Code hooks');
  const end = src.indexOf('// Resolve aliases de CLI');
  const helpers = `const fs=require('fs'),path=require('path');
function writeFile(f,c){fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c)}
${src.slice(start, end)}
module.exports={mergeClaudeHooks};`;
  const tmpMod = path.join(os.tmpdir(), `synapos-merge-${process.pid}.js`);
  fs.writeFileSync(tmpMod, helpers);
  const { mergeClaudeHooks } = require(tmpMod);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapos-settings-'));
  fs.mkdirSync(path.join(dir, '.claude'));
  const settingsFile = path.join(dir, '.claude', 'settings.json');
  fs.writeFileSync(settingsFile, JSON.stringify({
    permissions: { allow: ['Bash(npm test)'] },
    hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo user-hook' }] }] },
  }));
  mergeClaudeHooks(dir);
  mergeClaudeHooks(dir); // idempotente
  const s = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  const pre = s.hooks.PreToolUse.flatMap((e) => e.hooks.map((h) => h.command));
  check('merge preserva permissões do usuário', s.permissions?.allow?.[0] === 'Bash(npm test)');
  check('merge preserva hook do usuário', pre.includes('echo user-hook'));
  check('merge é idempotente', pre.filter((c) => c.includes('guard-commit.js')).length === 1, JSON.stringify(pre));
  check('merge registra SessionStart', s.hooks.SessionStart?.[0]?.hooks?.[0]?.command.includes('session-start.js'));
  check('merge usa ${CLAUDE_PROJECT_DIR}', s.hooks.SessionStart[0].hooks[0].command.includes('${CLAUDE_PROJECT_DIR}'));

  fs.writeFileSync(settingsFile, '{ inválido');
  check('merge não toca settings.json inválido', mergeClaudeHooks(dir) === false && fs.readFileSync(settingsFile, 'utf8') === '{ inválido');
  fs.unlinkSync(tmpMod);
}

console.log(failures ? `\n❌ ${failures} falha(s)` : '\n✅ Hooks OK');
process.exit(failures ? 1 : 0);
