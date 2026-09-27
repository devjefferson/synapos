---
name: synapos-session
version: 2.0.0
description: Gerenciamento de feature sessions — listar, visualizar, retomar e consolidar
---

# COMANDO /session

> Ponto de acesso direto às sessions do projeto.
> Use quando quiser ver o estado das features sem passar pelo /init completo.

---

## USO

```
/session                    → lista todas as sessions ativas
/session {slug}             → abre a session de uma feature específica
/session consolidate        → consolida memories.md e review-notes.md da session ativa
```

---

## PROTOCOLO

### Sem argumento — listar sessions

1. Liste todos os subdiretórios em `docs/.squads/sessions/`
2. Para cada session, leia `state.json` e extraia:
   - `feature` (slug)
   - `squads` — lista de roles que trabalharam + status de cada um
   - `updated_at` — data da última atividade

Exiba com AskUserQuestion:

```
AskUserQuestion({
  question: "Sessions ativas neste projeto:",
  options: [
    {
      label: "📂 {feature-slug}",
      description: "Roles: {lista} · Última atividade: {updated_at}"
    },
    // uma por session encontrada
    { label: "↩ Voltar ao menu", description: "Ir para /init" }
  ]
})
```

Ao selecionar uma session → execute o protocolo **Com argumento** abaixo.

---

### Com argumento `{slug}` — abrir session

1. Leia `## Resumo` de `docs/.squads/sessions/{slug}/context.md` (sessions antigas: `## O que é`)
2. Leia os cabeçalhos de `memories.md` (`### [TIPO] …` e legados `## [`)
3. Leia `state.json`

**Frescor:** data de modificação de `context.md` (via git ou sistema de arquivos). > 14 dias → `⚠️ STALE ({N} dias)`; senão `✅ Atualizado ({N} dias)`.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: {feature-slug}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resumo: {## Resumo}
Memórias: {N} ({N} normativas · {N} stale)
Artefatos: {spec.md · architecture.md · plan.md · review-notes.md presentes}
Contexto: {✅ Atualizado | ⚠️ STALE}
Roles que trabalharam: {state.json}
Última atividade: {updated_at}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
AskUserQuestion({
  question: "Session {feature-slug} — o que você quer fazer?",
  options: [
    { label: "▶️ Retomar com role ativo", description: "Continuar de onde parou" },
    { label: "📄 Ver context.md", description: "Ler contexto completo da feature" },
    { label: "🧠 Ver memories.md", description: "Ver memórias da feature" },
    { label: "🗜 Consolidar", description: "Mesclar duplicatas, limpar temporárias, promover globais" }
  ]
})
```

- **Retomar** → `/init` com o slug da session como contexto
- **Ver context.md / memories.md** → exiba inline
- **Consolidar** → protocolo abaixo

---

### Com argumento `consolidate` — consolidar session ativa

> Consolidar reorganiza — não perde informação útil. Formato de entrada: `.synapos/core/context-engine.md` §2.

Sem session no contexto → liste as sessions e peça para escolher. Antes de modificar: `memories.md.bak`.

**memories.md:**
1. Entradas legadas (`## [{squad} · {agent}] — data`) → converta para `### [LEARNING] {resumo}` (ou o tipo evidente), preservando data e autor em `source:`.
2. Mescle entradas sobre o mesmo assunto em uma (mais recente vence; mantenha a evidência).
3. Remova `TEMPORARY` de execuções concluídas.
4. Entradas úteis para outras features → proponha promover para `docs/_memory/project-memory.md` (normativas exigem confirmação).
5. Entradas `[DECISÃO CRÍTICA]` legadas → `### [DECISION]` com `confidence: high` — nunca removidas.
6. Entradas `status: stale` sem uso → pergunte: atualizar com a evidência atual ou remover.

**review-notes.md:** crie no topo `## Revisões Consolidadas até {YYYY-MM-DD}` agrupando por tema; marque as antigas com `<!-- consolidado {data} -->`.

```
✅ Consolidação concluída
   memories.md: {N} → {M} entradas · {P} promovidas · {T} temporárias removidas
   review-notes.md: {N} entradas consolidadas
```

---

## REGRAS

| Regra | Descrição |
|-------|-----------|
| **Leitura apenas** | `/session` nunca modifica arquivos — exceto `consolidate` |
| **Consolidar é manual** | Nunca consolide automaticamente — só quando o usuário executar `/session consolidate` |
| **Resumo primeiro** | Sempre exiba `## Resumo` de context.md no cabeçalho da session |
| **Sem pipeline** | `/session` não inicia pipeline — apenas navega e organiza |
