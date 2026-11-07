---
id: 04-frontend
name: "Implementação Frontend"
agent: rodrigo-react
execution: subagent
model_tier: powerful
---

# Implementação Frontend

**Agent:** Rodrigo React ⚛️
**Contexto injetado:** squad.yaml, api-contract.md, memories.md

## Instruções

Leia `.synapos/squads/{slug}/agents/rodrigo-react.agent.md` e execute como Rodrigo React.

**Contexto disponível:**
- Contrato de API: `docs/api-contract.md`
- Task da sessão: {task do memories.md}
- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← aplique todas as regras durante a implementação

## Tarefa

1. Implemente os componentes e páginas seguindo o contrato de API
2. Use mock do contrato enquanto o backend ainda não está disponível
3. Trate todos os estados: loading, error, empty, success
4. Siga a arquitetura definida em `docs/.squads/sessions/{feature-slug}/architecture.md`

## Validação visual

Skill declarada no step: `playwright-browser` (ou browser nativo equivalente). Rode a aplicação, abra a tela nova e compare com uma página existente (layout, estados loading/error/empty, mobile e desktop). Sem browser: revisão estrutural lado a lado. Registre: `Skills: playwright-browser — usada | indisponível: {motivo}`.

## Qualidade obrigatória — SEO, acessibilidade e performance

Toda alteração de frontend segue `.synapos/core/best-practices/dev/frontend-quality.md`: Core Web Vitals (LCP/INP/CLS), WCAG 2.2 AA, SEO técnico, palavras-chave por intenção, schema.org (JSON-LD) e metadados de compartilhamento (Open Graph/Twitter). Página privada → `noindex` e SEO `n/a`; acessibilidade e performance sempre. Meça (Lighthouse/axe/validadores) ou declare `não medido`. **Antes de entregar, verifique a integridade visual** (§7): texto quebrando layout, scroll desnecessário, container quebrado, texto escapando de container/botão, desalinhamento — em 320/390/768/1280/1920 px e com texto de pior caso; use `playwright-browser`, `break-ui` e `impeccable` quando disponíveis. Entregue o **Relatório de Qualidade Frontend** (§8).

## Critérios de Qualidade

- [ ] Todo componente async com loading + error + empty + success
- [ ] Props/tipos definidos sem tipos genéricos não justificados
- [ ] Mock do contrato implementado para desenvolvimento paralelo
- [ ] Integração com API seguindo o contrato aprovado
