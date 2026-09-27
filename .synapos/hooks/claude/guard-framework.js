#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit|NotebookEdit): .synapos/ belongs to the framework.
// Only .synapos/squads/ (created by /setup:squad) may be written by the AI.

const path = require('path');
const { readInput, projectDir, disabled, isFrameworkRepo, block, safe } = require('./_lib');

safe(() => {
  if (disabled() || process.env.SYNAPOS_ALLOW_FRAMEWORK_EDIT === '1') process.exit(0);
  const input = readInput();
  const root = projectDir(input);
  if (isFrameworkRepo(root)) process.exit(0);

  const target = input.tool_input?.file_path || input.tool_input?.notebook_path;
  if (!target) process.exit(0);

  const rel = path.relative(root, path.resolve(root, target)).split(path.sep).join('/');
  if (rel.startsWith('.synapos/') && !rel.startsWith('.synapos/squads/')) {
    block(`Synapos: "${rel}" é arquivo do framework — .synapos/ é somente leitura (exceção: .synapos/squads/).
Artefatos da feature vão para docs/.squads/sessions/{feature}/; memória para docs/_memory/.
Se a alteração no framework for intencional, o usuário pode definir SYNAPOS_ALLOW_FRAMEWORK_EDIT=1.`);
  }
});
