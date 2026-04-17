---
name: synapos-session
version: 3.0.0
description: Navegar sessions — listar, abrir, consolidar memórias
---

# COMANDO /session

> Ponto de acesso direto às sessions sem passar por /init.

---

## USO

```
/session                → lista sessions ativas
/session {slug}         → abre uma session específica
/session consolidate    → compacta memories.md da session ativa
```

---

## SEM ARGUMENTO — LISTAR

Liste os subdiretórios em `docs/.squads/sessions/`. Para cada um, leia `state.json` e extraia:

- `feature` (slug)
- `pipeline_runs` (contagem e último `completed_at`)

Exibir via AskUserQuestion:

```
AskUserQuestion({
  question: "Sessions ativas:",
  options: [
    {
      label: "📂 {feature-slug}",
      description: "{N} runs · última: {completed_at | started_at}"
    },
    { label: "↩ Voltar", description: "Fechar" }
  ]
})
```

Ao selecionar → execute o protocolo **Com slug** abaixo.

---

## COM SLUG — ABRIR

1. Leia `docs/.squads/sessions/{slug}/context.md`
2. Leia primeiras 30 linhas de `docs/.squads/sessions/{slug}/memories.md`
3. Leia `docs/.squads/sessions/{slug}/state.json`

Exiba:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: {feature-slug}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que é:    {primeira linha após "## O que é"}
Por que:    {primeira linha após "## Por que"}
Decisões:   {N itens em "## Decisões"}
Não fazer:  {N itens em "## Não fazer"}

Última run: {role} · {completed_at ou "em andamento"}
Runs totais: {pipeline_runs.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Depois:

```
AskUserQuestion({
  question: "Session {slug} — o que fazer?",
  options: [
    { label: "▶️ Retomar", description: "Executar /init nesta session" },
    { label: "📄 Ver context.md", description: "Ler contexto completo" },
    { label: "🧠 Ver memories.md", description: "Ler aprendizados" },
    { label: "🗜 Consolidar memórias", description: "Compactar memories.md" },
    { label: "↩ Voltar", description: "Voltar à lista" }
  ]
})
```

- **Retomar** → redirecione para `.synapos/core/orchestrator.md` passando `[FEATURE_SLUG] = {slug}` e pulando a detecção de slug.
- **Ver context.md** → Read + mostre o conteúdo.
- **Ver memories.md** → Read + mostre o conteúdo.
- **Consolidar** → execute "CONSOLIDATE" abaixo.

---

## CONSOLIDATE — COMPACTAR MEMÓRIAS

Use quando `memories.md` tiver mais de ~20 entradas ou estiver ilegível.

### Protocolo

1. Faça backup: `memories.md` → `memories.md.bak`.
2. Leia o arquivo completo.
3. Gere um resumo estruturado substituindo tudo por:

```markdown
# Memórias — {feature-slug}

## Resumo consolidado ({YYYY-MM-DD})

### Aprendizados principais
- ...

### Decisões recorrentes
- ...

### Armadilhas
- ...

---

## Entradas recentes

(as últimas 5 entradas do arquivo original, na íntegra)

---

(novas entradas vão aqui, no topo desta lista)
```

4. Log:

```
✅ memories.md consolidado
   Backup: docs/.squads/sessions/{slug}/memories.md.bak
   Entradas antes: {N}
   Entradas depois: 5 + resumo
```

---

## REGRAS

| Regra | Descrição |
|---|---|
| **Leitura apenas** | `/session` não modifica arquivos, exceto `consolidate` |
| **Consolidação manual** | Nunca consolida automaticamente. Só quando usuário pede. |
| **Backup sempre** | Consolidate cria `.bak` antes de reescrever |
| **Retomar vai pro /init** | Nunca executa pipeline direto — sempre passa pelo orchestrator |
