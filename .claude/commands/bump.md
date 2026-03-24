Leia `.synapos/core/versioning.md` e execute o protocolo de bump abaixo.

## PROTOCOLO DE BUMP

### 1 — Ler estado atual
- Leia `.synapos/VERSION` → versão atual do framework
- Leia `.synapos/.manifest.json` → inventário completo
- Leia `.synapos/CHANGELOG.md` → histórico de mudanças

### 2 — Identificar o que mudou
Pergunte ao usuário (se não informado nos argumentos):
```
O que foi alterado?
  [1] Agent (qual?)
  [2] Template de squad (qual?)
  [3] Core (orchestrator / pipeline-runner / gate-system / skills-engine)
  [4] Múltiplos

Tipo de mudança:
  [M] MAJOR — quebra compatibilidade
  [m] MINOR — adiciona sem quebrar
  [p] PATCH — corrige sem quebrar
```

### 3 — Calcular nova versão
Use semver: `MAJOR.MINOR.PATCH`
- PATCH: Z+1 (ex: 1.0.0 → 1.0.1)
- MINOR: Y+1, Z=0 (ex: 1.0.3 → 1.1.0)
- MAJOR: X+1, Y=0, Z=0 (ex: 1.2.1 → 2.0.0)

### 4 — Executar o bump
Execute em ordem:

**4a.** Atualizar `version:` no frontmatter do(s) arquivo(s) modificado(s)

**4b.** Atualizar `.synapos/.manifest.json`:
- Versão do componente alterado
- Versão do framework (`framework.version` e `framework.released_at`)

**4c.** Atualizar `.synapos/VERSION` com a nova versão do framework

**4d.** Adicionar entrada no `.synapos/CHANGELOG.md`:
```markdown
## [{nova_versão}] — {YYYY-MM-DD}

### {Adicionado | Modificado | Corrigido | Removido}
- `{componente}` v{versão} — {descrição da mudança}
```

### 5 — Confirmar
Apresente um resumo do bump realizado:
```
Bump concluído!

Versão: {anterior} → {nova}
Arquivos atualizados:
  ✅ .synapos/VERSION
  ✅ .synapos/.manifest.json
  ✅ .synapos/CHANGELOG.md
  ✅ {arquivo do componente alterado}
```
