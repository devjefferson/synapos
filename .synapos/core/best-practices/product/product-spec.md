---
id: product-spec
version: "1.0.0"
domain: [produto]
whenToUse: "Quando o squad de produto escreve especificações"
---

# Product Spec

> Estrutura padrão para especificações de produto: do problema à solução pronta para desenvolvimento.

---

## Estrutura Completa

```
1. Contexto e Problema
2. Objetivo e Métricas de Sucesso
3. Usuários Afetados
4. Solução Proposta
5. Requisitos Funcionais
6. Requisitos Não Funcionais
7. Critérios de Aceite
8. Casos de Borda
9. Fora de Escopo
10. Dependências e Riscos
11. Open Questions
```

---

## 1. Contexto e Problema

Responda:
- **Situação atual**: como o usuário resolve esse problema hoje?
- **Problema**: o que está errado ou faltando?
- **Evidência**: dados, feedback de usuários, suporte, analytics

```markdown
## Contexto e Problema

Usuários que esquecem a senha precisam contatar o suporte via email,
o que gera ~200 tickets/mês e demora em média 4h para resolução.

**Evidência:**
- 200 tickets/mês de reset de senha (12% do total de suporte)
- NPS de usuários que passaram pelo suporte: 28 (vs 72 geral)
- Churn de 15% dos usuários que esperaram mais de 2h
```

---

## 2. Objetivo e Métricas de Sucesso

### Formato OKR mínimo

```markdown
## Objetivo
Permitir que usuários recuperem acesso à conta sem intervenção humana.

## Métricas de Sucesso (3 meses após lançamento)
- Tickets de reset de senha: reduzir de 200 para < 20/mês
- Tempo médio de recuperação de conta: de 4h para < 5min
- NPS de usuários que usaram o fluxo: > 60
```

---

## 3. Usuários Afetados

```markdown
## Personas Afetadas

**Primária: Ana — usuária casual**
- Acessa o app 1–2x por semana
- Frequentemente esquece senhas
- Baixa tolerância a fricção no login

**Secundária: Carlos — usuário enterprise**
- Gerencia 5 contas diferentes
- Prefere segurança à conveniência
- Usa autenticador 2FA
```

---

## 4. Solução Proposta

Descreva **o quê**, não o **como** (evite detalhes de implementação nesta seção).

```markdown
## Solução

Fluxo self-service de recuperação de senha via email:

1. Usuário clica em "Esqueci minha senha" na tela de login
2. Informa o email cadastrado
3. Recebe link de redefinição válido por 30 minutos
4. Define nova senha e é autenticado automaticamente
```

Inclua wireframes ou referências visuais quando disponíveis.

---

## 5. Requisitos Funcionais

Liste **o que o sistema deve fazer**, não como:

```markdown
## Requisitos Funcionais

RF-01: O sistema deve enviar email de recuperação para o endereço cadastrado
RF-02: O link de recuperação deve expirar em 30 minutos
RF-03: Um link usado não pode ser reutilizado
RF-04: O usuário deve ser autenticado automaticamente após redefinir a senha
RF-05: O sistema deve mostrar indicador de força de senha durante a redefinição
RF-06: O sistema deve bloquear tentativas após 5 links enviados em 1 hora
```

---

## 6. Requisitos Não Funcionais

```markdown
## Requisitos Não Funcionais

RNF-01: Email entregue em até 60 segundos (p95)
RNF-02: Fluxo completo acessível (WCAG 2.1 AA)
RNF-03: Links de recuperação com token criptograficamente seguro (min 32 bytes)
RNF-04: Sem exposição de informação sobre existência de email no sistema
```

---

## 7. Critérios de Aceite

Formato: **Dado** [contexto], **quando** [ação], **então** [resultado esperado].

```markdown
## Critérios de Aceite

**CA-01:** Dado usuário com email cadastrado,
quando solicitar recuperação de senha,
então deve receber email com link em até 60s.

**CA-02:** Dado link de recuperação gerado,
quando acessado após 30 minutos,
então deve exibir mensagem "link expirado" e oferecer gerar novo.

**CA-03:** Dado link de recuperação válido já utilizado,
quando acessado novamente,
então deve exibir mensagem "link já utilizado".

**CA-04:** Dado email não cadastrado no sistema,
quando usuário solicitar recuperação,
então deve exibir mensagem genérica sem confirmar ou negar existência do email.

**CA-05:** Dado usuário que tentou 5x em 1 hora,
quando tentar solicitar nova recuperação,
então deve ser bloqueado por 60 minutos com mensagem informativa.
```

---

## 8. Casos de Borda

Itens que precisam de comportamento definido, mas não são o caminho principal:

```markdown
## Casos de Borda

- Email digitado com espaços ou letras maiúsculas → normalizar antes de buscar
- Usuário clica no link em dispositivo diferente do que solicitou → permitido
- Usuário solicita 2 links em sequência → apenas o mais recente deve ser válido
- Email do usuário mudou desde o cadastro → usar email atual cadastrado no sistema
- Conta desativada/bloqueada → não enviar email, exibir mensagem de suporte
- Domínio de email com ponto extra (usuario@gmail..com) → validar formato antes de enviar
```

---

## 9. Fora de Escopo

Deixe explícito o que **não** está incluído para alinhar expectativas:

```markdown
## Fora de Escopo (v1)

- Recuperação via SMS / WhatsApp (próxima versão)
- Autenticação biométrica como fallback
- Histórico de senhas anteriores
- Notificação de segurança por email ao alterar senha
```

---

## 10. Dependências e Riscos

```markdown
## Dependências
- Serviço de email (SendGrid) deve estar configurado para o novo template
- Backend precisa de nova tabela `password_reset_tokens`
- Design system: componente de "força de senha" ainda não existe

## Riscos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Emails caindo em spam | Média | Alto | Configurar SPF/DKIM antes do lançamento |
| Rate limit insuficiente (abuse) | Baixa | Médio | Monitorar nas primeiras 2 semanas |
```

---

## 11. Open Questions

```markdown
## Open Questions

- [ ] Devemos notificar o usuário por email quando a senha for alterada com sucesso? (segurança vs ruído)
- [ ] Qual o comportamento para usuários que fazem login via Google OAuth? (não têm senha cadastrada)
- [ ] Precisamos de log de auditoria dos resets? (compliance)
```

---

## Checklist Antes de Enviar para Dev

- [ ] Critérios de aceite cobrem o caminho feliz?
- [ ] Casos de borda mapeados e com comportamento definido?
- [ ] "Fora de escopo" explícito para evitar scope creep?
- [ ] Métricas de sucesso são mensuráveis?
- [ ] Open questions resolvidas ou com responsável definido?
- [ ] Design (wireframe/protótipo) linkado ou anexado?
- [ ] Revisado por alguém de eng antes de enviar?
