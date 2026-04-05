## PROTOCOLO DE BUMP

Versiona o **pacote npm** do Synapos. Não versiona arquivos markdown internos.

### 1 — Ler estado atual
- Leia `package.json` → versão atual

### 2 — Detectar tipo de bump

**Se argumento fornecido** (ex: `/bump minor`): use diretamente.

**Se sem argumento:**
```
AskUserQuestion({
  question: "Versão atual: {versão}\n\nQual tipo de bump?",
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

**4a.** Atualizar `version` em `package.json`

**4b.** Adicionar entrada no `CHANGELOG.md` na raiz do projeto

### 5 — Resumo
```
✅ Bump: {anterior} → {nova}
```
