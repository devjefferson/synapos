#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const prompts = require('prompts');

// ─── Colors (ANSI) ───────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
};

const bold  = (s) => `${c.bold}${s}${c.reset}`;
const cyan  = (s) => `${c.cyan}${s}${c.reset}`;
const green = (s) => `${c.green}${s}${c.reset}`;
const gray  = (s) => `${c.gray}${s}${c.reset}`;
const red   = (s) => `${c.red}${s}${c.reset}`;
const dim   = (s) => `${c.dim}${s}${c.reset}`;

// ─── Constants ────────────────────────────────────────────────────────────────
const PACKAGE_DIR = path.join(__dirname, '..');
const VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIR, 'package.json'), 'utf8')).version;
  } catch { return '1.4.0'; }
})();

const SQUADS = [
  { value: 'frontend',  title: '🖥️  Frontend',   description: 'React, Vue, CSS, UX/UI, testes' },
  { value: 'backend',   title: '⚙️  Backend',    description: 'APIs, banco de dados, segurança' },
  { value: 'fullstack', title: '📦  Fullstack',  description: 'Frontend + Backend integrados' },
  { value: 'produto',   title: '📋  Produto',    description: 'Pesquisa, spec, documentação' },
  { value: 'mobile',    title: '📱  Mobile',     description: 'React Native, Flutter, iOS, Android' },
  { value: 'devops',    title: '🚀  DevOps',     description: 'CI/CD, containers, cloud, infra' },
  { value: 'ia-dados',  title: '🤖  IA / Dados', description: 'ML, pipelines de dados, LLMs' },
];

const SQUAD_ALIASES = {
  front:   'frontend',
  back:    'backend',
  full:    'fullstack',
  fs:      'fullstack',
  product: 'produto',
  ia:      'ia-dados',
  data:    'ia-dados',
  dados:   'ia-dados',
};

const IDES = [
  {
    value:   'claude',
    title:   'Claude Code',
    checked: true,
    files: [
      {
        dest: '.claude/commands/init.md',
        content: `Leia e execute exatamente o protocolo em: .synapos/core/orchestrator.md\n`,
      },
    ],
  },
  {
    value:   'cursor',
    title:   'Cursor',
    checked: true,
    files: [
      {
        dest: '.cursor/rules/synapos.mdc',
        content: `---
description: Synapos Framework — agent orchestration for automation and development
alwaysApply: true
---

Este projeto usa o **Synapos Framework** para orquestração de agents.

**Framework location:** \`.synapos/\`
**Protocolo de inicialização:** \`.synapos/core/orchestrator.md\`

Quando o usuário quiser trabalhar com agents ou iniciar uma sessão de desenvolvimento/automação, leia e execute o protocolo em \`.synapos/core/orchestrator.md\`.
`,
      },
    ],
  },
  {
    value:   'trae',
    title:   'Trae',
    checked: false,
    files: [
      {
        dest: '.trae/rules.md',
        content: `# Synapos Framework

Este projeto usa o **Synapos Framework** para orquestração de agents.

**Framework:** \`.synapos/\`
**Init:** \`.synapos/core/orchestrator.md\`

Para iniciar, leia e execute o protocolo em \`.synapos/core/orchestrator.md\`.
`,
      },
    ],
  },
  {
    value:   'opencode',
    title:   'OpenCode',
    checked: false,
    files: [
      {
        dest: '.opencode/instructions.md',
        content: `# Synapos Framework

Este projeto usa o **Synapos Framework** para orquestração de agents.

**Framework:** \`.synapos/\`
**Init:** \`.synapos/core/orchestrator.md\`

Para iniciar, use o comando \`/init\` ou leia e execute o protocolo em \`.synapos/core/orchestrator.md\`.
`,
      },
      {
        dest: '.opencode/commands/init.md',
        content: `Leia e execute exatamente o protocolo em: .synapos/core/orchestrator.md\n`,
      },
    ],
  },
  {
    value:   'antigravity',
    title:   'Antigravity',
    checked: false,
    files: [
      {
        dest: '.antigravity/rules.md',
        content: `# Synapos Framework

Este projeto usa o **Synapos Framework** para orquestração de agents multi-especialidade.

**Framework:** \`.synapos/\`
**Init:** \`.synapos/core/orchestrator.md\`

Para iniciar, leia e execute o protocolo em \`.synapos/core/orchestrator.md\`.
`,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function header() {
  console.log('');
  console.log(bold(cyan('  ╔══════════════════════════════════════════╗')));
  console.log(bold(cyan('  ║') + bold(`        SYNAPOS FRAMEWORK v${VERSION}        `) + bold(cyan('║'))));
  console.log(bold(cyan('  ║') + gray('    AI Agent Orchestration — Multi-IDE    ') + bold(cyan('║'))));
  console.log(bold(cyan('  ╚══════════════════════════════════════════╝')));
  console.log('');
}

function ok(msg)   { console.log(green('  ✔') + '  ' + msg); }
function info(msg) { console.log(cyan('  →') + '  ' + msg); }
function warn(msg) { console.log(`${c.yellow}  ⚠${c.reset}  ${msg}`); }
function err(msg)  { console.log(red('  ✖') + '  ' + msg); }

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function resolveSquad(input) {
  if (!input) return null;
  const lower = input.toLowerCase();
  return SQUAD_ALIASES[lower] || (SQUADS.find(s => s.value === lower) ? lower : null);
}

// Copia o core do framework (sem squad-templates)
function installCore(src, dest) {
  const coreDirs = ['core', 'skills', '_memory', 'squads'];
  const coreFiles = ['.manifest.json', 'VERSION', 'CHANGELOG.md'];

  for (const dir of coreDirs) {
    copyDirRecursive(path.join(src, dir), path.join(dest, dir));
  }
  for (const file of coreFiles) {
    copyFile(path.join(src, file), path.join(dest, file));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('-'));
  const flags = process.argv.slice(2).filter(a => a.startsWith('-'));

  if (flags.includes('--version') || flags.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
  }

  if (flags.includes('--help') || flags.includes('-h')) {
    console.log(`
${bold('SYNAPOS')} — AI Agent Orchestration Framework

${bold('USAGE')}
  npx synapos [squad...] [options]

${bold('SQUADS')}
  front / frontend   🖥️  React, Vue, CSS, UX/UI
  back  / backend    ⚙️  APIs, banco de dados
  full  / fullstack  📦  Frontend + Backend
  produto            📋  Pesquisa, spec, docs
  mobile             📱  React Native, Flutter
  devops             🚀  CI/CD, containers, cloud
  ia / ia-dados      🤖  ML, pipelines, LLMs

${bold('OPTIONS')}
  -v, --version      Exibe a versão
  -h, --help         Exibe esta ajuda

${bold('EXEMPLOS')}
  npx synapos                    menu interativo (multi-select)
  npx synapos front              instala frontend
  npx synapos front back         instala frontend + backend
  npx synapos front back devops  instala três squads
`);
    process.exit(0);
  }

  header();

  const targetDir = process.cwd();
  const synaposSource = path.join(PACKAGE_DIR, '.synapos');

  if (!fs.existsSync(synaposSource)) {
    err('Arquivos do framework não encontrados no pacote.');
    process.exit(1);
  }

  // ── 1. Resolver squads dos args ─────────────────────────────────────────────
  let squadIds = [];

  // Args válidos → pré-selecionados; args inválidos → aviso
  const invalidArgs = [];
  for (const arg of args) {
    const resolved = resolveSquad(arg);
    if (resolved) {
      if (!squadIds.includes(resolved)) squadIds.push(resolved);
    } else {
      invalidArgs.push(arg);
    }
  }

  if (invalidArgs.length > 0) {
    for (const a of invalidArgs) warn(`Squad "${a}" não reconhecido — ignorado.`);
    console.log('');
  }

  // ── 2. Se nenhum squad via arg, mostrar multi-select ────────────────────────
  if (squadIds.length === 0) {
    const { selected } = await prompts({
      type:         'multiselect',
      name:         'selected',
      message:      'Selecione os squads para instalar:',
      choices:      SQUADS.map(s => ({
        title:       s.title,
        value:       s.value,
        description: s.description,
        selected:    false,
      })),
      hint:         '- Espaço para selecionar, Enter para confirmar',
      instructions: false,
      min:          1,
    }, { onCancel: () => { console.log(''); process.exit(0); } });

    squadIds = selected || [];
    if (squadIds.length === 0) process.exit(0);
  }

  const selectedSquads = squadIds.map(id => SQUADS.find(s => s.value === id));
  console.log('');
  info(`Squads: ${selectedSquads.map(s => bold(s.title.trim())).join(', ')}`);
  console.log('');

  // ── 3. Verificar se .synapos/ já existe ─────────────────────────────────────
  const synaposTarget = path.join(targetDir, '.synapos');
  if (fs.existsSync(synaposTarget)) {
    const { overwrite } = await prompts({
      type:    'confirm',
      name:    'overwrite',
      message: 'A pasta .synapos/ já existe. Deseja atualizar?',
      initial: true,
    }, { onCancel: () => { console.log(''); process.exit(0); } });

    if (!overwrite) {
      console.log('');
      warn('Instalação cancelada.');
      process.exit(0);
    }
    console.log('');
  }

  // ── 4. Selecionar IDEs ──────────────────────────────────────────────────────
  const { selectedIdes } = await prompts({
    type:         'multiselect',
    name:         'selectedIdes',
    message:      'Selecione as IDEs para configurar:',
    choices:      IDES.map(ide => ({
      title:    ide.title,
      value:    ide.value,
      selected: ide.checked,
    })),
    hint:         '- Espaço para selecionar, Enter para confirmar',
    instructions: false,
    min:          1,
  }, { onCancel: () => { console.log(''); process.exit(0); } });

  if (!selectedIdes || selectedIdes.length === 0) {
    err('Nenhuma IDE selecionada. Instalação cancelada.');
    process.exit(1);
  }

  console.log('');

  // ── 5. Copiar framework ─────────────────────────────────────────────────────
  info('Instalando Synapos Framework...');
  console.log('');

  try {
    installCore(synaposSource, synaposTarget);
    ok(`.synapos/core copiado ${gray('(core, skills, _memory)')}`);
  } catch (e) {
    err(`Erro ao copiar core: ${e.message}`);
    process.exit(1);
  }

  for (const squadId of squadIds) {
    const squad = SQUADS.find(s => s.value === squadId);
    const squadSrc  = path.join(synaposSource, 'squad-templates', squadId);
    const squadDest = path.join(synaposTarget, 'squad-templates', squadId);
    try {
      copyDirRecursive(squadSrc, squadDest);
      ok(`${squad.title.trim()} copiado ${gray(`(.synapos/squad-templates/${squadId}/)`)}`);
    } catch (e) {
      err(`Erro ao copiar squad ${squadId}: ${e.message}`);
    }
  }

  // ── 6. Configurar IDEs ──────────────────────────────────────────────────────
  for (const ideValue of selectedIdes) {
    const ide = IDES.find(i => i.value === ideValue);
    if (!ide) continue;
    try {
      for (const file of ide.files) {
        writeFile(path.join(targetDir, file.dest), file.content);
      }
      ok(`${ide.title} configurado ${gray('(' + ide.files.map(f => f.dest).join(', ') + ')')}`);
    } catch (e) {
      err(`Erro ao configurar ${ide.title}: ${e.message}`);
    }
  }

  // ── 7. Mensagem final ───────────────────────────────────────────────────────
  console.log('');
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log(green('  ✅') + bold(`  Synapos v${VERSION} instalado com sucesso!`));
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log('');

  const ideInstructions = {
    claude:      '  Claude Code  →  digite /init na conversa',
    cursor:      '  Cursor       →  inicie uma nova conversa com o agente',
    trae:        '  Trae         →  inicie uma nova conversa',
    opencode:    '  OpenCode     →  inicie uma nova conversa',
    antigravity: '  Antigravity  →  inicie uma nova conversa',
  };

  console.log(bold('  Próximos passos:'));
  console.log('');
  for (const ideValue of selectedIdes) {
    if (ideInstructions[ideValue]) {
      console.log(cyan('  →') + dim(ideInstructions[ideValue]));
    }
  }
  console.log('');
  console.log(gray(`  Squads: ${selectedSquads.map(s => s.title.trim()).join(' · ')}`));
  console.log('');
}

run().catch((e) => {
  console.error(red('\n  Erro inesperado:'), e.message);
  process.exit(1);
});
