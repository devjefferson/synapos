// Shared helpers for Synapos Claude Code hooks. Hooks must never break a session:
// any unexpected error ends with exit 0 (no decision).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

function disabled() {
  return process.env.SYNAPOS_HOOKS === 'off';
}

// The Synapos package repo itself edits .synapos/ by design.
function isFrameworkRepo(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name === 'synapos';
  } catch {
    return false;
  }
}

function git(dir, args) {
  try {
    return execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function block(message) {
  process.stderr.write(message + '\n');
  process.exit(2);
}

function safe(fn) {
  try {
    fn();
  } catch {
    process.exit(0);
  }
}

module.exports = { readInput, projectDir, disabled, isFrameworkRepo, git, block, safe };
