---
id: 02-preparacao
name: "Preparação"
agent: leo-engenheiro
execution: inline
model_tier: fast
---

# Preparação

## 1. Verificar branch de feature

Execute:
```bash
git branch --show-current
```

- Se estiver em `main` ou `master`: apresente opção de criar branch de feature
- Se já estiver em branch de feature: confirme e prossiga
- Se o humano quiser criar: solicite o nome e execute `git checkout -b feature/{slug}`

```
[DECISÃO PENDENTE] branch-name
Contexto: não há branch de feature ativa
Opções:
  A) Criar agora: git checkout -b feature/{nome-sugerido}
  B) Continuar sem criar branch (não recomendado)
Aguardando aprovação.
```

## 2. Verificar sessão anterior

Verifique se `docs/.squads/sessions/{feature-slug}/context.md` já existe.

**Se existir:**
```
📂 Sessão existente: docs/.squads/sessions/{feature-slug}/

Arquivos encontrados:
  - context.md ✓
  - architecture.md ✓ / ✗

- ▶️ Continuar de onde parou
- 🔄 Começar do zero
```

Aguarde seleção.

## 3. Solicitar dados de entrada

```
Pronto para iniciar a investigação.

Forneça os dados da feature:
  - Cole os cartões do Linear (ID + descrição) ou descreva livremente
  - Se houver spec de negócio, indique o arquivo ou cole o conteúdo
```

Aguarde a resposta antes de avançar.
