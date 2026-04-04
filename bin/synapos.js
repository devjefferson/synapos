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

const bold   = (s) => `${c.bold}${s}${c.reset}`;
const cyan   = (s) => `${c.cyan}${s}${c.reset}`;
const green  = (s) => `${c.green}${s}${c.reset}`;
const yellow = (s) => `${c.yellow}${s}${c.reset}`;
const gray   = (s) => `${c.gray}${s}${c.reset}`;
const red    = (s) => `${c.red}${s}${c.reset}`;
const dim    = (s) => `${c.dim}${s}${c.reset}`;

// ─── Constants ────────────────────────────────────────────────────────────────
const PACKAGE_DIR = path.join(__dirname, '..');
const VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(PACKAGE_DIR, 'package.json'), 'utf8')).version;
  } catch { return '2.5.0'; }
})();

// Squad definitions — value = folder name in squad-templates/
const SQUADS = [
  { value: 'frontend',  aliases: ['front', 'fe'],        title: '🖥️  Frontend',   description: 'React, Vue, CSS, UX/UI, testes' },
  { value: 'backend',   aliases: ['back', 'be'],         title: '⚙️  Backend',    description: 'APIs, banco de dados, segurança' },
  { value: 'fullstack', aliases: ['full', 'fs'],         title: '📦  Fullstack',  description: 'Frontend + Backend integrados' },
  { value: 'produto',   aliases: ['product', 'prod'],    title: '📋  Produto',    description: 'Pesquisa, spec, documentação' },
  { value: 'mobile',    aliases: ['mob'],                title: '📱  Mobile',     description: 'React Native, Flutter, iOS, Android' },
  { value: 'devops',    aliases: ['ops', 'infra'],       title: '🚀  DevOps',     description: 'CI/CD, containers, cloud, infra' },
  { value: 'ia-dados',  aliases: ['ia', 'ml', 'data'],  title: '🤖  IA / Dados', description: 'ML, pipelines de dados, LLMs' },
  { value: 'engineer',  aliases: ['eng'],                title: '🧠  Engineer',   description: 'Feature engineering guiado por ADRs' },
];

// Commands installed for each IDE
const COMMANDS = [
  { file: 'init.md',                  content: 'Leia e execute exatamente o protocolo em: .synapos/core/orchestrator.md\n' },
  { file: 'bump.md',                  content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/bump.md\n' },
  { file: 'set-model.md',             content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/set-model.md\n' },
  { file: 'setup/start.md',           content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/setup/start.md\n' },
  { file: 'setup/build-business.md',  content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/setup/build-business.md\n' },
  { file: 'setup/build-tech.md',      content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/setup/build-tech.md\n' },
  { file: 'setup/discover.md',        content: 'Leia e execute exatamente o protocolo em: .synapos/core/commands/setup/discover.md\n' },
];

// IDE definitions
const IDES = [
  { value: 'claude',   title: 'Claude Code', commandsDir: '.claude/commands',   hint: '/init na conversa'               },
  { value: 'copilot',  title: 'Copilot',     commandsDir: null,                 hint: 'synapos:init no chat do Copilot' },
  { value: 'opencode', title: 'OpenCode',    commandsDir: '.opencode/commands', hint: '/init no chat'                   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function header() {
  console.log('');
  console.log(bold(cyan('  ╔══════════════════════════════════════════╗')));
  console.log(bold(cyan('  ║') + bold(`       SYNAPOS FRAMEWORK v${VERSION}        `) + bold(cyan('║'))));
  console.log(bold(cyan('  ║') + gray('    AI Agent Orchestration — Multi-IDE    ') + bold(cyan('║'))));
  console.log(bold(cyan('  ╚══════════════════════════════════════════╝')));
  console.log('');
}

function ok(msg)   { console.log(green('  ✔') + '  ' + msg); }
function info(msg) { console.log(cyan('  →') + '  ' + msg); }
function warn(msg) { console.log(yellow('  ⚠') + '  ' + msg); }
function err(msg)  { console.log(red('  ✖') + '  ' + msg); }
function nl()      { console.log(''); }

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

// Copia o core do framework (sem squad-templates)
function installCore(src, dest) {
  const coreDirs  = ['core', 'skills'];
  const coreFiles = ['.manifest.json', 'VERSION', 'CHANGELOG.md'];

  for (const dir of coreDirs) {
    copyDirRecursive(path.join(src, dir), path.join(dest, dir));
  }
  for (const file of coreFiles) {
    copyFile(path.join(src, file), path.join(dest, file));
  }
}

// Resolve aliases de CLI para valores canônicos de squad
// ex: 'front' → 'frontend', 'ia' → 'ia-dados'
function resolveSquadArgs(args) {
  const resolved = new Set();
  for (const arg of args) {
    const lower = arg.toLowerCase();
    const match = SQUADS.find(
      s => s.value === lower || s.aliases.includes(lower)
    );
    if (match) {
      resolved.add(match.value);
    } else {
      warn(`Squad desconhecido: "${arg}" — ignorado`);
    }
  }
  return [...resolved];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const argv  = process.argv.slice(2);
  const flags = argv.filter(a => a.startsWith('-'));
  const args  = argv.filter(a => !a.startsWith('-'));

  if (flags.includes('--version') || flags.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
  }

  if (flags.includes('--help') || flags.includes('-h')) {
    console.log(`
${bold('SYNAPOS')} — AI Agent Orchestration Framework v${VERSION}

${bold('USO')}
  npx synapos [squads...] [options]

${bold('SQUADS')} (aliases aceitos)
${SQUADS.map(s => `  ${s.value.padEnd(12)} ${gray(s.aliases.join(', ').padEnd(18))}  ${s.description}`).join('\n')}

${bold('OPÇÕES')}
  -v, --version      Exibe a versão
  -h, --help         Exibe esta ajuda

${bold('EXEMPLOS')}
  npx synapos                     Seleção interativa de squads
  npx synapos front               Instala squad Frontend
  npx synapos front back          Instala Frontend + Backend
  npx synapos front back devops   Instala múltiplos squads
`);
    process.exit(0);
  }

  header();

  const targetDir     = process.cwd();
  const synaposSource = path.join(PACKAGE_DIR, '.synapos');

  if (!fs.existsSync(synaposSource)) {
    err('Arquivos do framework não encontrados no pacote.');
    process.exit(1);
  }

  // ── 1. Resolver squads via args ou seleção interativa ────────────────────────
  let selectedSquadIds = [];

  if (args.length > 0) {
    // Squads passados como argumento: npx synapos front back
    selectedSquadIds = resolveSquadArgs(args);
    if (selectedSquadIds.length === 0) {
      err('Nenhum squad válido nos argumentos. Use --help para ver as opções.');
      process.exit(1);
    }
    nl();
    info(`Squads selecionados via argumento: ${selectedSquadIds.join(', ')}`);
    nl();
  } else {
    // Seleção interativa
    const { selected } = await prompts({
      type:         'multiselect',
      name:         'selected',
      message:      'Quais squads você quer instalar?',
      choices:      SQUADS.map(s => ({
        title:       s.title,
        value:       s.value,
        description: s.description,
        selected:    false,
      })),
      hint:         '- Espaço para selecionar, Enter para confirmar',
      instructions: false,
      min:          1,
    }, { onCancel: () => { nl(); process.exit(0); } });

    if (!selected || selected.length === 0) process.exit(0);
    selectedSquadIds = selected;
    nl();
  }

  // ── 2. Verificar se .synapos/ já existe ─────────────────────────────────────
  const synaposTarget = path.join(targetDir, '.synapos');
  if (fs.existsSync(synaposTarget)) {
    const { overwrite } = await prompts({
      type:    'confirm',
      name:    'overwrite',
      message: 'A pasta .synapos/ já existe. Deseja atualizar o framework?',
      initial: true,
    }, { onCancel: () => { nl(); process.exit(0); } });

    if (!overwrite) {
      nl();
      warn('Instalação cancelada.');
      process.exit(0);
    }
    nl();
  }

  // ── 3. Selecionar IDE ────────────────────────────────────────────────────────
  const { selectedIdes } = await prompts({
    type:         'multiselect',
    name:         'selectedIdes',
    message:      'Qual IDE você usa?',
    choices:      IDES.map(ide => ({ title: ide.title, value: ide.value, selected: false })),
    hint:         '- Espaço para selecionar, Enter para confirmar',
    instructions: false,
    min:          1,
  }, { onCancel: () => { nl(); process.exit(0); } });

  if (!selectedIdes || selectedIdes.length === 0) process.exit(0);
  nl();

  // ── 4. Instalar core ─────────────────────────────────────────────────────────
  info('Instalando Synapos Framework...');
  nl();

  try {
    installCore(synaposSource, synaposTarget);
    ok(`.synapos/core instalado ${gray('(orchestrator, pipeline-runner, gates, model-adapter, skills)')}`);
  } catch (e) {
    err(`Erro ao copiar core: ${e.message}`);
    process.exit(1);
  }

  // ── 5. Instalar squads selecionados ─────────────────────────────────────────
  for (const squadId of selectedSquadIds) {
    const squad    = SQUADS.find(s => s.value === squadId);
    const squadSrc = path.join(synaposSource, 'squad-templates', squadId);
    const squadDst = path.join(synaposTarget, 'squad-templates', squadId);

    if (!fs.existsSync(squadSrc)) {
      warn(`Template "${squadId}" não encontrado no pacote — pulando`);
      continue;
    }

    try {
      copyDirRecursive(squadSrc, squadDst);
      ok(`${squad.title.trim()} instalado ${gray(`(.synapos/squad-templates/${squadId}/)`)}`);
    } catch (e) {
      err(`Erro ao copiar squad ${squadId}: ${e.message}`);
    }
  }

  // ── 6. Configurar IDEs ───────────────────────────────────────────────────────
  nl();
  for (const ideId of selectedIdes) {
    const ide = IDES.find(i => i.value === ideId);
    try {
      if (ideId === 'copilot') {
        // Copilot usa .github/copilot-instructions.md em vez de comandos
        const copilotSrc  = path.join(PACKAGE_DIR, '.github', 'copilot-instructions.md');
        const copilotDest = path.join(targetDir, '.github', 'copilot-instructions.md');
        copyFile(copilotSrc, copilotDest);
        ok(`${ide.title} configurado ${gray('(.github/copilot-instructions.md)')}`);
      } else {
        for (const cmd of COMMANDS) {
          writeFile(path.join(targetDir, ide.commandsDir, cmd.file), cmd.content);
        }
        ok(`${ide.title} configurado ${gray(`(${ide.commandsDir}/, ${COMMANDS.length} comandos)`)}`);
      }
    } catch (e) {
      err(`Erro ao configurar ${ide.title}: ${e.message}`);
    }
  }

  // ── 7. Resumo final ──────────────────────────────────────────────────────────
  const configuredIdes = selectedIdes.map(id => IDES.find(i => i.value === id));
  const installedSquads = selectedSquadIds.map(id => SQUADS.find(s => s.value === id));

  nl();
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log(green('  ✅') + bold(`  Synapos v${VERSION} instalado!`));
  console.log(bold(green('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  nl();
  console.log(bold('  Squads instalados:'));
  for (const s of installedSquads) {
    console.log(cyan('  ·') + `  ${s.title.trim()}`);
  }
  nl();
  console.log(bold('  Próximos passos:'));
  nl();
  for (const ide of configuredIdes) {
    console.log(cyan('  →') + dim(`  ${ide.title.padEnd(12)} →  ${ide.hint}`));
  }
  nl();
  console.log(dim('  Dica: /init detecta automaticamente o contexto do projeto'));
  console.log(dim('        e escolhe o modo certo (Bootstrap / Standard / Strict)'));
  nl();
}

run().catch((e) => {
  console.error(red('\n  Erro inesperado:'), e.message);
  process.exit(1);
});
