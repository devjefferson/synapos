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


const COMMANDS = [
  { file: 'init.md',                  src: '.synapos/core/orchestrator.md' },
  { file: 'bump.md',                  src: '.synapos/core/commands/bump.md' },
  { file: 'setup/start.md',           src: '.synapos/core/commands/setup/start.md' },
  { file: 'setup/build-business.md',  src: '.synapos/core/commands/setup/build-business.md' },
  { file: 'setup/build-tech.md',      src: '.synapos/core/commands/setup/build-tech.md' },
  { file: 'setup/discover.md',        src: '.synapos/core/commands/setup/discover.md' },
];

const IDES = [
  { value: 'claude',   title: 'Claude Code', commandsDir: '.claude/commands',   hint: '/init na conversa'   },
  { value: 'opencode', title: 'OpenCode',    commandsDir: '.opencode/commands', hint: '/init no chat'       },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function header() {
  console.log('');
  console.log(bold(cyan('  ╔══════════════════════════════════════════╗')));
  console.log(bold(cyan('  ║') + bold(`        SYNAPOS FRAMEWORK v${VERSION}        `) + bold(cyan('║'))));
  console.log(bold(cyan('  ║') + gray('     AI Agent Orchestration — Claude      ') + bold(cyan('║'))));
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

// Copia o core do framework (sem squad-templates e sem dados de projeto)
function installCore(src, dest) {
  const coreDirs = ['core', 'skills'];
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
  const flags = process.argv.slice(2).filter(a => a.startsWith('-'));

  if (flags.includes('--version') || flags.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
  }

  if (flags.includes('--help') || flags.includes('-h')) {
    console.log(`
${bold('SYNAPOS')} — AI Agent Orchestration Framework

${bold('USAGE')}
  npx synapos [options]

${bold('OPTIONS')}
  -v, --version      Exibe a versão
  -h, --help         Exibe esta ajuda
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

  // ── Instalar todos os squads ─────────────────────────────────────────────────
  const squadIds = SQUADS.map(s => s.value);

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

  // ── 4. Selecionar IDE ────────────────────────────────────────────────────────
  const { selectedIdes } = await prompts({
    type:         'multiselect',
    name:         'selectedIdes',
    message:      'Qual IDE você usa?',
    choices:      IDES.map(ide => ({ title: ide.title, value: ide.value, selected: false })),
    hint:         '- Espaço para selecionar, Enter para confirmar',
    instructions: false,
    min:          1,
  }, { onCancel: () => { console.log(''); process.exit(0); } });

  if (!selectedIdes || selectedIdes.length === 0) process.exit(0);
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

  // ── 6. Configurar IDEs ───────────────────────────────────────────────────────
  for (const ideId of selectedIdes) {
    const ide = IDES.find(i => i.value === ideId);
    try {
      for (const cmd of COMMANDS) {
        const dest = path.join(targetDir, ide.commandsDir, cmd.file);
        writeFile(dest, `Leia e execute exatamente o protocolo em: ${cmd.src}\n`);
      }
      ok(`${ide.title} configurado ${gray(`(${ide.commandsDir}/, ${COMMANDS.length} comandos)`)}`);
    } catch (e) {
      err(`Erro ao configurar ${ide.title}: ${e.message}`);
    }
  }

  // ── 7. Mensagem final ───────────────────────────────────────────────────────
  const configuredIdes = selectedIdes.map(id => IDES.find(i => i.value === id));
  console.log('');
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log(green('  ✅') + bold(`  Synapos v${VERSION} instalado com sucesso!`));
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log('');
  console.log(bold('  Próximos passos:'));
  console.log('');
  for (const ide of configuredIdes) {
    console.log(cyan('  →') + dim(`  ${ide.title.padEnd(12)} →  digite /init — ${ide.hint}`));
  }
  console.log('');
}

run().catch((e) => {
  console.error(red('\n  Erro inesperado:'), e.message);
  process.exit(1);
});
