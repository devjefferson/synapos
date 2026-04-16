---
name: synapos-session
version: 1.0.0
description: Gerenciamento de feature sessions — listar, visualizar, retomar e consolidar
---

# COMANDO /session

> Ponto de acesso direto às sessions do projeto.
> Use quando quiser ver o estado das features sem passar pelo /init completo.

---

## USO

```
/session              → lista todas as sessions ativas
/session {slug}       → abre a session de uma feature específica
/session consolidate  → consolida memories.md e review-notes.md da session ativa
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

1. Leia `docs/.squads/sessions/{slug}/session.manifest.json` (se existir)
2. Leia `docs/.squads/sessions/{slug}/context.snapshot` (se existir e hash válido) ou `context.md`
3. Leia o bloco `<!-- RECENTES -->` de `docs/.squads/sessions/{slug}/memories.md`
4. Leia `docs/.squads/sessions/{slug}/state.json`

**Calcular frescor do contexto:**
- Se `session.manifest.json` existe e `files.context.md.loaded_at` está preenchido:
  - Calcule dias desde `loaded_at`
  - Se > 14 dias: exibir `⚠️ STALE ({N} dias sem atualização)`
  - Se ≤ 14 dias: exibir `✅ Atualizado ({N} dias atrás)`
- Se manifest não existe: exibir `❓ Frescor desconhecido (manifest ausente)`

Exiba resumo e menu de ações:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: {feature-slug}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que é: {primeira linha de context.md ## O que é}
Decisões: {contagem de itens em ## Decisões tomadas}
Memórias: {entry_count do manifest OU contagem de ## em memories.md} entradas
Contexto: {✅ Atualizado | ⚠️ STALE | ❓ Frescor desconhecido}
Roles que trabalharam: {lista do state.json}

Última atividade: {updated_at do state.json}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
AskUserQuestion({
  question: "Session {feature-slug} — o que você quer fazer?",
  options: [
    { label: "▶️ Retomar com role ativo", description: "Continuar de onde parou" },
    { label: "📄 Ver context.md", description: "Ler contexto completo da feature" },
    { label: "🧠 Ver memories.md", description: "Ver aprendizados acumulados" },
    { label: "🗜 Consolidar", description: "Compactar memories e review-notes" },
    { label: "↩ Voltar", description: "Voltar à lista de sessions" }
  ]
})
```

- **Retomar com role ativo** → redirecione para o `/init` passando o slug da session como contexto
- **Ver context.md** → exiba o conteúdo do arquivo inline
- **Ver memories.md** → exiba o conteúdo do arquivo inline
- **Consolidar** → execute o protocolo de consolidação abaixo

---

### Com argumento `consolidate` — consolidar session ativa

> Use quando memories.md ou review-notes.md estiverem grandes e difíceis de ler.
> Consolidar não deleta informação — apenas reorganiza.

**Pré-condição:** deve haver uma session ativa no contexto (slug conhecido).
Se não houver, liste as sessions e peça ao usuário para escolher.

**Protocolo de consolidação de `memories.md`:**

memories.md usa estrutura de janela deslizante com dois blocos:
- `<!-- SUMMARY --> ... <!-- /SUMMARY -->` — histórico consolidado
- `<!-- RECENTES --> ... <!-- /RECENTES -->` — últimas entradas (lidas pelo pipeline-runner)

**Antes de qualquer modificação:** crie backup `memories.md.bak` na mesma pasta. Log: `📦 Backup criado: memories.md.bak`

1. Leia o arquivo completo
2. Identifique entradas no bloco `<!-- RECENTES -->` com mais de 7 dias OU se o bloco tiver mais de 10 entradas
3. Para cada entrada a consolidar, mova o conteúdo para o bloco `<!-- SUMMARY -->`:
   ```markdown
   <!-- SUMMARY -->
   (consolidado em: {YYYY-MM-DD})

   ### Aprendizados principais
   {resumo estruturado preservando todas as informações relevantes}

   ### Armadilhas identificadas
   {lista das armadilhas mais importantes}

   ### Decisões registradas
   {decisões que não estão em context.md}
   <!-- /SUMMARY -->
   ```
4. Remova as entradas consolidadas do bloco `<!-- RECENTES -->` (não delete — elas estão no SUMMARY)
5. Atualize `session.manifest.json` → `files.memories.md.entry_count` com a contagem atual do bloco RECENTES

> **Legado:** Se memories.md não tem a estrutura de blocos, crie os blocos durante a consolidação: mova tudo para SUMMARY e deixe RECENTES vazio.

**Protocolo de consolidação de `review-notes.md`:**

1. Leia o arquivo completo
2. Crie nova seção no topo:
   ```markdown
   ## Revisões Consolidadas até {YYYY-MM-DD}

   {resumo estruturado das revisões antigas, agrupado por tema}
   ```
3. Marque entradas consolidadas com `<!-- consolidado {data} -->`

**Log ao concluir:**
```
✅ Consolidação concluída
   memories.md: {N} entradas → 1 bloco consolidado
   review-notes.md: {N} entradas → 1 bloco consolidado
   Session: docs/.squads/sessions/{feature-slug}/
```

> **`project-learnings.md` não é consolidado aqui** — é um arquivo global do projeto, não da feature. Cresce de forma controlada (append-only, entrada por pipeline concluído). Não há necessidade de consolidação automática.

---

## REGRAS

| Regra | Descrição |
|-------|-----------|
| **Leitura apenas** | `/session` nunca modifica arquivos — exceto `/session consolidate` |
| **Consolidar é manual** | Nunca consolide automaticamente — só quando o usuário executar `/session consolidate` |
| **context.md é a estrela** | Sempre exiba o resumo de context.md no cabeçalho da session |
| **Sem pipeline** | `/session` não inicia pipeline — apenas navega e organiza |
