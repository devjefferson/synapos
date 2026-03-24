---
id: technical-writing
version: "1.0.0"
domain: [produto, backend, frontend]
whenToUse: "Quando o squad produz documentação técnica ou de produto"
---

# Technical Writing

> Guia para escrever ADRs, decisions logs, handoffs e documentação técnica com clareza e estrutura.

---

## Princípios

- **Escreva para o leitor futuro** — você em 6 meses, novo membro do time, outro squad
- **Contexto antes de decisão** — explique o problema antes de apresentar a solução
- **Registre o que foi rejeitado** — alternativas descartadas são tão valiosas quanto a escolha feita
- **Documentação boa é manutenível** — curta e atualizada > longa e desatualizada
- **Estrutura facilita leitura** — use headers, listas e tabelas em vez de parágrafos densos

---

## ADR — Architecture Decision Record

> Registra decisões arquiteturais significativas: contexto, opções consideradas e escolha feita.

### Quando escrever
- Mudança de stack ou biblioteca principal
- Decisão de design de API ou banco de dados
- Escolha de padrão arquitetural (ex: monolito → microsserviços)
- Qualquer decisão que você terá que explicar para novos membros

### Template

```markdown
# ADR-{NNN}: {Título da Decisão}

**Data:** YYYY-MM-DD
**Status:** Proposto | Aceito | Deprecado | Substituído por ADR-XXX
**Decisores:** {nomes ou times envolvidos}

## Contexto

{Descreva o problema ou situação que forçou essa decisão.
Inclua restrições técnicas, de negócio ou de time.}

## Opções Consideradas

### Opção 1: {nome}
**Prós:** ...
**Contras:** ...

### Opção 2: {nome}
**Prós:** ...
**Contras:** ...

### Opção 3: {nome}
**Prós:** ...
**Contras:** ...

## Decisão

Escolhemos a **Opção {N}** porque {justificativa principal}.

## Consequências

**Positivas:**
- ...

**Negativas / Trade-offs:**
- ...

**Neutras:**
- ...

## Notas

{Referências, links, discussões relacionadas}
```

### Exemplo Real

```markdown
# ADR-003: Adotar PostgreSQL em vez de MongoDB

**Data:** 2026-03-23
**Status:** Aceito
**Decisores:** Time de Backend, CTO

## Contexto

Nossa estrutura de dados para transações financeiras tem relacionamentos
complexos entre usuários, cobranças e pagamentos. O schema variável do
MongoDB está causando inconsistências de dados em produção e dificultando
queries de relatório.

## Opções Consideradas

### Opção 1: PostgreSQL
**Prós:** Transações ACID, joins eficientes, schema estrito evita dados inconsistentes
**Contras:** Migração de dados existentes, curva de aprendizado para queries complexas

### Opção 2: Manter MongoDB com schema validation
**Prós:** Zero migração, time já conhece
**Contras:** Validação fraca, joins custosos via $lookup, histórico de inconsistências

## Decisão

Escolhemos **PostgreSQL** porque a consistência de dados é crítica para
produto financeiro e os problemas atuais com MongoDB são estruturais, não operacionais.

## Consequências

**Positivas:** Queries de relatório 10x mais simples, zero inconsistências de schema
**Negativas:** 2 semanas de migração, 1 sprint de adaptação do time
```

---

## Decisions Log

> Registro contínuo de decisões do dia a dia — menos formal que ADR, mais rastreável que Slack.

### Quando usar
- Decisões de product que não chegam a ser ADR
- Mudanças de escopo, priorização, trade-offs aceitos
- Qualquer "por que fizemos assim?"

### Template

```markdown
# Decisions Log — {Squad ou Projeto}

---

## {YYYY-MM-DD} — {Título da decisão}

**Decidido por:** {nome(s)}
**Contexto:** {1–3 linhas do problema}
**Decisão:** {o que foi decidido}
**Motivo:** {por que essa opção}
**Trade-off aceito:** {o que deixamos de fora ou comprometemos}
**Revisão:** {quando reavaliar, se aplicável}

---
```

### Exemplo

```markdown
## 2026-03-23 — Lançar sem notificação por SMS na v1

**Decidido por:** Priscila (PM), Bruno (Tech Lead)
**Contexto:** SMS aumentaria cobertura para usuários sem acesso estável a email,
mas o provedor de SMS custa R$0,15/msg e precisamos validar adoção primeiro.
**Decisão:** Lançar v1 apenas com email. SMS entra no roadmap para v1.2.
**Motivo:** Reduzir custo operacional antes de validar demanda real.
**Trade-off aceito:** Usuários sem acesso a email não serão atendidos nesta versão.
**Revisão:** Após 90 dias — avaliar volume de tickets pedindo SMS.
```

---

## Handoff Document

> Transfere contexto de um squad para o próximo (dev, QA, suporte, outro time).

### Estrutura

```markdown
# Handoff — {Feature ou Projeto}

**Data:** YYYY-MM-DD
**De:** {squad / pessoa}
**Para:** {squad / pessoa}
**Versão:** {versão que está sendo entregue}

## O que foi construído

{Descrição clara e objetiva da feature ou sistema entregue}

## Como funciona

{Fluxo principal em passos ou diagrama}

## Onde está

| Artefato | Localização |
|----------|-------------|
| Código | {link ou path} |
| Deploy | {ambiente, URL} |
| Documentação | {link} |
| Designs | {link Figma} |

## O que testar (QA Checklist)

- [ ] Caminho feliz: {descrever}
- [ ] Casos de erro: {descrever}
- [ ] Casos de borda: {listar}

## Configurações necessárias

{Env vars, feature flags, permissões, dependências externas}

## Limitações conhecidas

{Bugs conhecidos, débito técnico aceito, limitações de escopo}

## Open Questions / Próximos passos

- [ ] {item não resolvido com responsável}
```

---

## Clareza e Estrutura

### Escrita objetiva

```markdown
❌ "O sistema foi desenvolvido de forma a possibilitar que os usuários
    possam realizar a recuperação de suas senhas de acesso através de
    um processo automatizado via email."

✅ "Usuários podem redefinir a senha via email sem interação do suporte."
```

### Use estrutura visual

```markdown
❌ "A feature tem três estados possíveis: ativo que significa que está
    funcionando normalmente, pausado que significa que foi suspenso
    temporariamente e inativo que foi encerrado."

✅ **Estados da feature:**
   - **Ativo** — funcionando normalmente
   - **Pausado** — suspenso temporariamente
   - **Inativo** — encerrado
```

### Hierarquia de headers

```
# Título do documento
## Seção principal
### Subseção
#### Detalhe (usar com moderação)
```

---

## Checklist de Qualidade

Antes de entregar qualquer documento técnico:

- [ ] O problema está claro antes da solução?
- [ ] O documento responde "por quê", não só "o quê"?
- [ ] Alternativas rejeitadas estão documentadas?
- [ ] Está escrito para o leitor certo (eng? produto? suporte?)?
- [ ] Sem jargão não explicado para o público-alvo?
- [ ] Links e referências funcionam?
- [ ] Data e autoria registrados?
- [ ] Precisa de revisão por outra pessoa antes de publicar?
