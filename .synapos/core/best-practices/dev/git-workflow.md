---
id: git-workflow
version: "1.0.0"
domain: [frontend, backend, fullstack, mobile, devops]
whenToUse: "Quando o squad trabalha com branches, commits e PRs"
---

# Git Workflow

> Convenções de branching, commits semânticos, PRs e estratégia de merge.

---

## Branch Strategy

### Modelo: GitHub Flow (recomendado para a maioria dos projetos)

```
main
 ├── feat/auth-login
 ├── feat/checkout-v2
 ├── fix/payment-timeout
 └── chore/upgrade-deps
```

**Regras:**
- `main` é sempre deployável
- Todo trabalho acontece em feature branches
- Merge via PR com ao menos 1 aprovação
- Branch de curta duração (idealmente < 3 dias)

### Modelo: Git Flow (projetos com releases cadenciadas)

```
main        ← produção
develop     ← integração contínua
 ├── feat/  ← features
 ├── fix/   ← bugfixes
 ├── hotfix/← correções urgentes em prod
 └── release/← preparação de release
```

Use quando: produto mobile com release na loja, projetos com janelas de deploy fixas.

---

## Nomenclatura de Branches

```
{tipo}/{descricao-curta}
```

| Tipo | Uso |
|------|-----|
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `chore/` | Manutenção, deps, configs |
| `refactor/` | Refatoração sem mudança de comportamento |
| `test/` | Adição ou melhoria de testes |
| `docs/` | Documentação |
| `hotfix/` | Correção urgente em produção |

### Exemplos

```
feat/user-authentication
feat/checkout-pix-payment
fix/cart-total-calculation
fix/login-redirect-loop
chore/upgrade-react-19
refactor/extract-payment-service
hotfix/payment-gateway-timeout
```

---

## Commits Semânticos

Formato: `{tipo}({escopo}): {descrição}`

```
feat(auth): adicionar autenticação via Google OAuth
fix(cart): corrigir cálculo de desconto com cupom
chore(deps): atualizar react para v19
refactor(api): extrair camada de serviço de pagamentos
test(checkout): adicionar testes E2E do fluxo de compra
docs(api): documentar endpoints de usuário
perf(dashboard): lazy load de gráficos pesados
ci: configurar deploy automático para staging
```

### Tipos válidos

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Tarefas de manutenção, deps, scripts |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Testes novos ou melhorados |
| `docs` | Documentação |
| `perf` | Melhoria de performance |
| `ci` | Mudanças em CI/CD |
| `build` | Build system, packaging |
| `revert` | Reversão de commit anterior |

### Regras para a mensagem
- **Imperativo presente**: "adicionar" não "adicionei" ou "adicionando"
- **Sem ponto final**
- **Máx 72 caracteres** na primeira linha
- Body opcional para contexto: o quê, por quê (não o como)

```
fix(auth): corrigir expiração de token em fuso UTC-3

O token era validado em UTC mas comparado com timestamp local,
causando logout prematuro para usuários no Brasil.

Closes #342
```

---

## Pull Requests

### Antes de abrir o PR
- [ ] Branch está atualizada com `main` (ou `develop`)
- [ ] CI local passa (testes + lint)
- [ ] Código auto-revisado (leia seu próprio diff antes de pedir review)
- [ ] PR é pequeno e focado em um objetivo

### Descrição do PR

```markdown
## O que esse PR faz
Implementa autenticação via Google OAuth usando a estratégia Passport.js.

## Por que
Usuários solicitaram login social — reduz fricção de cadastro.

## Como testar
1. Configurar `.env` com `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
2. Acessar `/auth/google`
3. Completar fluxo OAuth
4. Verificar redirecionamento para dashboard

## Checklist
- [x] Testes passando
- [x] Sem console.log esquecidos
- [x] Variáveis de ambiente documentadas no .env.example
```

### Tamanho do PR

| Tamanho | Linhas | Recomendação |
|---------|--------|--------------|
| Ideal | < 200 | Revisar no mesmo dia |
| Aceitável | 200–400 | Revisar em até 24h |
| Problemático | > 400 | Quebrar em PRs menores |

---

## Squash vs Merge vs Rebase

| Estratégia | Quando usar | Resultado |
|------------|-------------|-----------|
| **Squash merge** | Feature branches | 1 commit limpo no main |
| **Merge commit** | Release branches, histórico importante | Todos os commits preservados |
| **Rebase** | Branches próprias antes do PR | Histórico linear, sem merge commits |

### Recomendação padrão
- Feature branches → **Squash merge** (histórico limpo no main)
- Hotfixes → **Merge commit** (rastreabilidade de emergência)
- Nunca force-push em `main` ou `develop`

---

## Proteção de Branch

Configure no GitHub/GitLab:

```yaml
main:
  - Require PR before merging
  - Require at least 1 approval
  - Require status checks: CI, lint, tests
  - Dismiss stale approvals on new commits
  - Restrict force-push
```

---

## Git Hooks Recomendados

Use **Husky** + **lint-staged**:

```json
{
  "pre-commit": "lint-staged",
  "commit-msg": "commitlint --edit $1"
}
```

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml}": ["prettier --write"]
  }
}
```

---

## Resolução de Conflitos

```bash
# Atualizar branch com main antes do PR
git fetch origin
git rebase origin/main

# Se conflito: resolver manualmente, depois
git add .
git rebase --continue

# Em caso de confusão, abortar e recomeçar
git rebase --abort
```

**Regras:**
- Resolva conflitos na sua branch, não em `main`
- Nunca resolva conflito em `main` diretamente
- Em caso de conflito complexo, pair com o autor do código conflitante

---

## Fluxo Resumido

```
git checkout -b feat/minha-feature

# ... trabalho ...

git add src/feature.ts
git commit -m "feat(feature): implementar nova funcionalidade"

git fetch origin
git rebase origin/main

git push origin feat/minha-feature
# → Abre PR no GitHub
# → CI passa
# → Code review aprovado
# → Squash merge em main
# → Branch deletada automaticamente
```
