---
id: nf-08-criar-tarefas
name: "Criar Tarefas"
execution: checkpoint
---

# Criar Tarefas

A spec está aprovada. Transforme os requisitos em tarefas acionáveis.

## Plataforma

```
Onde criar as tarefas?
📁 Local — docs/specs/{feature-slug}-tasks.md
🐙 GitHub — issues via gh CLI
📐 Linear — issues no workspace
🔲 Jira — issues no projeto
📋 Outro — gero formatado para colar
```

## Preparar tarefas

Leia `docs/specs/{feature-slug}-v1.md` e para cada **RF** extraia:
- Título: `[{feature-slug}] RF-{N}: {descrição curta}`
- Critério de aceite exato
- Prioridade: P0 / P1 / P2
- Labels: `feature`, domínio técnico

Inclua: 1 tarefa de testes de aceitação (validar todos os P0).

---

## Execução por plataforma

### 📁 Local

Crie `docs/specs/{feature-slug}-tasks.md`:

```markdown
# Tarefas: {Nome da Feature}
Spec: [docs/specs/{feature-slug}-v1.md](../specs/{feature-slug}-v1.md)
Criado em: {YYYY-MM-DD} | Total: {N} tarefas

## 🔴 P0 — Alta Prioridade
- [ ] **[{feature-slug}] RF-01: {descrição}**
  Critério: {critério de aceite}

## 🟡 P1 — Média Prioridade
- [ ] **[{feature-slug}] RF-0X: {descrição}**

## 🟢 P2 — Baixa Prioridade
- [ ] **[{feature-slug}] RF-0X: {descrição}**

## ✅ Validação
- [ ] **Testes de aceitação** — validar todos os critérios P0
```

### 🐙 GitHub

Verifique `gh --version`. Para cada RF:
```bash
gh issue create \
  --title "[{feature-slug}] RF-{N}: {descrição}" \
  --body "## Critério de Aceite\n{critério}\n\nSpec: docs/specs/{feature-slug}-v1.md" \
  --label "feature" --label "{high|medium|low}"
```

Se `gh` indisponível: use fallback Local.

### 📐 Linear

Se Linear MCP disponível: pergunte o team ID e crie diretamente.

Senão, gere bloco para importação manual:
```
[RF-01] {título} | Priority: {Urgent|High|Medium|Low}
  {critério de aceite}
  Spec: docs/specs/{feature-slug}-v1.md
```

### 🔲 Jira / 📋 Outro

Gere lista universal:
```
TAREFAS — {Nome da Feature} | {N} tarefas | P0:{X} P1:{Y} P2:{Z}
Spec: docs/specs/{feature-slug}-v1.md

P0: □ {título} — {critério}
P1: □ {título} — {critério}
✅  □ Testes de aceitação — todos os critérios P0
```

---

## Atualizar CHANGELOG

Append no topo de `docs/CHANGELOG.md`:
```markdown
## [{YYYY-MM-DD}] — Tarefas: {Nome da Feature}
- {N} tarefas criadas em {plataforma} para `{feature-slug}-v1.md` (P0:{X} P1:{Y} P2:{Z})
```

---

## Confirmação

```
✅ {Nome da Feature} pronta para desenvolvimento!

Spec:    docs/specs/{feature-slug}-v1.md
Handoff: docs/specs/{feature-slug}-handoff.md
Tarefas: {N} criadas em {plataforma}

Para iniciar: /init → squad → "implementar {feature-slug}"
```
