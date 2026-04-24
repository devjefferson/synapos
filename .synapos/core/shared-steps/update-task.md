---
id: update-task
name: "Atualizar Tarefa"
execution: checkpoint
---

# Atualizar Tarefa

A implementação foi concluída. Registre o progresso onde as tarefas estão sendo gerenciadas.

## Identificar tarefa e plataforma

Leia `docs/.squads/sessions/{feature-slug}/memories.md` da sessão atual:
- `Task:` — descrição do que foi feito
- `Issue:` — referência da tarefa (número, plataforma, local ou —)

Apresente ao usuário:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSÃO CONCLUÍDA

Task: {Task da sessão}
Issue: {Issue registrada}

A tarefa foi concluída?

✅ Sim — marcar como concluída
🔄 Parcial — registrar progresso e manter aberta
⏭️  Pular — não atualizar agora
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Aguarde a seleção. Se **Pular**, encerre aqui.

---

## Executar por plataforma

### 📁 Local — `docs/specs/*-tasks.md`

Abra o arquivo de tarefas identificado no `Issue:` do memories.md.

Localize o item correspondente e marque como concluído:
- `- [ ]` → `- [x]`

Se parcial, adicione nota abaixo do item:
```markdown
- [~] RF-{N}: {título}
  > Parcial — {YYYY-MM-DD}: {o que foi feito}. Pendente: {o que falta}
```

---

### 🐙 GitHub Issues

**Se concluída:**
```bash
gh issue close {número} --comment "Implementado. Referência: {branch ou PR}"
```

**Se parcial:**
```bash
gh issue comment {número} --body "Progresso — {YYYY-MM-DD}: {o que foi implementado}. Pendente: {o que falta}"
gh issue edit {número} --add-label "in-progress"
```

---

### 📐 Linear

**Se concluída:**
- Se Linear MCP disponível: atualize o status para `Done` / `Completed`
- Caso contrário:

```
Linear — Atualizar manualmente:
Issue: {ID registrado no memories.md}
Novo status: Done
Comentário: Implementado em {YYYY-MM-DD}
```

**Se parcial:**
```
Linear — Issue: {ID} | Status: In Progress | Comentário: {progresso + pendências}
```

---

### 🔲 Jira

```
Jira — Atualizar manualmente:
Issue: {ID registrado no memories.md}
Transição: {Done | In Progress}
Comentário: {resumo do que foi feito}
```

---

## Registrar no memories.md

Adicione entrada em `docs/.squads/sessions/{feature-slug}/memories.md` dentro do bloco `<!-- RECENTES -->`:

```markdown
## [{squad-slug} · usuario] — {YYYY-MM-DD}
Tarefa {concluída | parcial}: {descrição}
Issue: {referência}
{SE PARCIAL:} Pendente: {o que falta}
```

---

## Confirmação

```
✅ Progresso registrado!

Task: {descrição}
Status: {concluída | parcial}
Plataforma: {local | GitHub #{N} | Linear | Jira | —}

{SE CONCLUÍDA E TODAS AS TAREFAS DONE:}
🎉 Todas as tarefas da feature estão concluídas.
   Próximo passo: verificar handoff em docs/specs/{feature-slug}-handoff.md
```
