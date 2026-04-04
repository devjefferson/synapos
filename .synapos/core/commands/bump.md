## PROTOCOLO DE BUMP

### 1 — Ler estado atual
- Leia `.synapos/VERSION` → versão atual do framework
- Leia `.synapos/.manifest.json` → inventário completo
- Execute `git diff --name-only HEAD` para detectar arquivos modificados

### 2 — Detectar o que mudou (via git)

O sistema detecta automaticamente:
- Quais arquivos em `.synapos/` foram modificados
- Se arquivos de agents, templates, core ou múltiplos foram alterados

**Se argumentos fornecidos** (ex: `/bump minor`):
- Use o tipo fornecido diretamente
- Ignore a detecção automática para o tipo

**Se sem argumentos:**
```
AskUserQuestion({
  question: "Versão atual: {versão}\nArquivos modificados: {lista}\n\nQual tipo de bump?",
  options: [
    { label: "PATCH", description: "Correção sem quebrar (~1.0.1)" },
    { label: "MINOR", description: "Feature sem quebrar (~1.1.0)" },
    { label: "MAJOR", description: "Breaking change (~2.0.0)" }
  ]
})
```

### 3 — Calcular nova versão
Use semver: `MAJOR.MINOR.PATCH`
- PATCH: Z+1
- MINOR: Y+1, Z=0
- MAJOR: X+1, Y=0, Z=0

### 4 — Executar o bump

**4a.** Atualizar `version:` no frontmatter dos arquivos modificados

**4b.** Atualizar `.synapos/.manifest.json`:
- Versão do(s) componente(s) alterado(s)
- `framework.version` e `framework.released_at`

**4c.** Atualizar `.synapos/VERSION`

**4d.** Adicionar entrada no `.synapos/CHANGELOG.md`

### 5 — Resumo
```
✅ Bump: {anterior} → {nova}
   {arquivos atualizados}
```
