---
id: nf-08-criar-tarefas
name: "Criar Tarefas"
execution: checkpoint
---

# Criar Tarefas

A spec está aprovada. Agora vamos transformar os requisitos em tarefas acionáveis.

## Plataforma

Pergunte ao usuário onde criar as tarefas:

```
Onde você quer criar as tarefas desta feature?

📁 Local       — arquivo docs/specs/{feature-slug}-tasks.md
🐙 GitHub      — issues no repositório atual (usa gh CLI)
📐 Linear      — issues no workspace Linear
🔲 Jira        — issues no projeto Jira
📋 Outro       — gero as tarefas formatadas e você cola onde quiser
```

Aguarde a seleção antes de continuar.

---

## Preparar tarefas

Leia `docs/specs/{feature-slug}-v1.md` e extraia:

Para cada **RF** (Requisito Funcional):
- Título: `[{feature-slug}] RF-{N}: {descrição curta}`
- Descrição: critério de aceite + contexto
- Prioridade: P0 → alta / P1 → média / P2 → baixa
- Labels: `feature`, domínio técnico (ex: `backend`, `frontend`)
- Referência: link para a spec

Inclua também:
- 1 tarefa de setup/configuração se houver dependências técnicas a preparar
- 1 tarefa de testes de aceitação (validar todos os critérios de aceite P0)

---

## Execução por plataforma

### 📁 Local — `docs/specs/{feature-slug}-tasks.md`

Crie o arquivo:

```markdown
# Tarefas: {Nome da Feature}

**Spec:** [docs/specs/{feature-slug}-v1.md](../specs/{feature-slug}-v1.md)
**Criado em:** {YYYY-MM-DD}
**Total:** {N} tarefas

---

## 🔴 Alta Prioridade (P0)

- [ ] **[{feature-slug}] RF-01: {descrição}**
  Critério: {critério de aceite exato da spec}
  Labels: feature, {domínio}

- [ ] **[{feature-slug}] RF-0X: ...**

## 🟡 Média Prioridade (P1)

- [ ] **[{feature-slug}] RF-0X: {descrição}**
  Critério: {critério de aceite}

## 🟢 Baixa Prioridade (P2)

- [ ] **[{feature-slug}] RF-0X: {descrição}**

## ✅ Validação

- [ ] **[{feature-slug}] Testes de aceitação**
  Validar todos os critérios P0 conforme a spec aprovada.
  Referência: docs/specs/{feature-slug}-v1.md
```

---

### 🐙 GitHub Issues

Verifique se o `gh` CLI está disponível:
```bash
gh --version
```

Se disponível, crie uma issue por RF usando o template abaixo. Execute cada comando separadamente e aguarde confirmação entre eles:

```bash
gh issue create \
  --title "[{feature-slug}] RF-{N}: {descrição curta}" \
  --body "## Descrição
{descrição do RF}

## Critério de Aceite
{critério de aceite exato}

## Referência
Spec: docs/specs/{feature-slug}-v1.md

## Prioridade
{P0 | P1 | P2}" \
  --label "feature" \
  --label "{prioridade: high | medium | low}"
```

Ao final, liste todas as issues criadas com seus números e links.

Se `gh` não estiver disponível: informe o usuário e ofereça a opção **Local** como fallback.

---

### 📐 Linear

Gere um bloco de tarefas formatado para importação manual ou API:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREFAS PARA LINEAR — {Nome da Feature}

[RF-01] {título}
Priority: {Urgent | High | Medium | Low}
Description:
  {critério de aceite}
  Spec: docs/specs/{feature-slug}-v1.md
Labels: feature

[RF-02] ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Se o usuário tiver o Linear MCP configurado (`linear` disponível como ferramenta), pergunte:
```
Detectei Linear disponível. Quer que eu crie as issues diretamente?
→ Informe o team ID ou nome do projeto Linear.
```

---

### 🔲 Jira

Gere bloco formatado para importação:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREFAS PARA JIRA — {Nome da Feature}

Summary: [{feature-slug}] RF-{N}: {título}
Issue Type: Story
Priority: {Highest | High | Medium | Low}
Description:
  h3. Critério de Aceite
  {critério}

  h3. Referência
  Spec: docs/specs/{feature-slug}-v1.md
Labels: feature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 📋 Outro

Gere lista universal copiável:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREFAS — {Nome da Feature}
Spec: docs/specs/{feature-slug}-v1.md

{N} tarefas | P0: {X} | P1: {Y} | P2: {Z}

ALTA PRIORIDADE (P0):
□ {título} — {critério de aceite}
□ {título} — {critério de aceite}

MÉDIA PRIORIDADE (P1):
□ {título} — {critério de aceite}

BAIXA PRIORIDADE (P2):
□ {título} — {critério de aceite}

VALIDAÇÃO:
□ Testes de aceitação — todos os critérios P0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Atualizar CHANGELOG

Adicione ao `docs/CHANGELOG.md` (append no topo):

```markdown
## [{YYYY-MM-DD}] — Tarefas: {Nome da Feature}

### Adicionado
- {N} tarefas criadas em {plataforma} para `docs/specs/{feature-slug}-v1.md`
  {P0: X alta / P1: Y média / P2: Z baixa}

---
```

---

## Confirmação final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Feature {Nome da Feature} pronta para desenvolvimento!

📄 Spec:    docs/specs/{feature-slug}-v1.md
🤝 Handoff: docs/specs/{feature-slug}-handoff.md
{SE LOCAL:}
✅ Tarefas: docs/specs/{feature-slug}-tasks.md
{SE GITHUB:}
✅ Issues:  {N} issues criadas — {repo}/issues
{SE LINEAR/JIRA/OUTRO:}
✅ Tarefas: {N} tarefas formatadas acima

Para iniciar o desenvolvimento:
  /init → selecione o squad → informe: "implementar {feature-slug}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
