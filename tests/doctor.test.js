'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { doctor } = require('../bin/doctor');

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? '✅' : '❌'} ${name}${ok ? '' : ' — ' + detail}`);
  if (!ok) failed++;
}

function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'synapos-doctor-'));
  const base = {
    '.synapos/VERSION': '1.0.0\n',
    '.synapos/.manifest.json': JSON.stringify({ framework: { version: '1.0.0' } }),
  };
  for (const f of ['orchestrator', 'pipeline-runner', 'compliance-protocol', 'context-engine', 'skills-engine', 'gate-system']) base[`.synapos/core/${f}.md`] = '# x\n';
  for (const [rel, content] of Object.entries({ ...base, ...files })) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return root;
}

let r = doctor(project({}));
check('instalação íntegra sem erros', r.errors.length === 0, r.errors.join('; '));

r = doctor(fs.mkdtempSync(path.join(os.tmpdir(), 'synapos-empty-')));
check('sem .synapos/ é erro', r.errors.some((e) => /\.synapos\/ não encontrado/.test(e)), JSON.stringify(r.errors));

r = doctor(project({ '.synapos/VERSION': '2.0.0\n' }));
check('VERSION × manifest divergentes viram aviso', r.warnings.some((w) => /incoerente/.test(w)), JSON.stringify(r.warnings));

r = doctor(project({ 'src/a.ts': 'l1\nl2\nl3\n', 'docs/arch.md': 'Serviço `src/a.ts:1-3` e `src/a.ts:2`.\n' }));
check('citações válidas passam', r.errors.length === 0 && /2 citação/.test(r.infos.join()), JSON.stringify(r));

r = doctor(project({ 'src/a.ts': 'l1\nl2\n', 'docs/arch.md': 'Fora `src/a.ts:1-9`, ausente `src/x.ts:1`, invertida `src/a.ts:2-1`.\n' }));
check('citações inválidas são erro', r.errors.length === 3, JSON.stringify(r.errors));

r = doctor(project({ 'docs/arch.md': 'host example.com:443 e bloco:\n```\n`src/nada.ts:9`\n```\n', 'docs/archive/old.md': '`src/nada.ts:9`\n' }));
check('falsos positivos, blocos de código e archive ignorados', r.errors.length === 0, JSON.stringify(r.errors));

r = doctor(project({
  '.synapos/skills/playwright-browser/SKILL.md': '---\nname: playwright-browser\n---\n',
  '.synapos/squads/s/pipeline/p.yaml': 'steps:\n  - id: a\n    skills: [playwright-browser, fantasma]\n',
}));
check('skill declarada inexistente é erro', r.errors.some((e) => /fantasma/.test(e)) && !r.errors.some((e) => /playwright-browser/.test(e)), JSON.stringify(r.errors));
check('skill MCP sem .mcp.json vira aviso', r.warnings.some((w) => /MCP "playwright"/.test(w)), JSON.stringify(r.warnings));

r = doctor(project({
  '.synapos/skills/playwright-browser/SKILL.md': '---\nname: playwright-browser\n---\n',
  '.mcp.json': JSON.stringify({ mcpServers: { playwright: {} } }),
}));
check('MCP configurado não avisa', !r.warnings.some((w) => /MCP/.test(w)), JSON.stringify(r.warnings));

r = doctor(project({ '.claude/settings.json': JSON.stringify({ hooks: {} }) }));
check('hooks não registrados viram aviso', r.warnings.filter((w) => /hook /.test(w)).length === 3, JSON.stringify(r.warnings));

console.log(failed ? `\n❌ ${failed} falha(s)` : '\n✅ Doctor OK');
process.exit(failed ? 1 : 0);
