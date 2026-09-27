---
id: adr-001
title: "Formulários com react-hook-form + zod"
domain: [frontend]
scope: [formulários, src/app/**/*Form.tsx]
status: accepted
date: 2026-03-02
---

# ADR-001: Formulários com react-hook-form + zod

## Status
accepted

## Contexto
Formulários eram escritos com useState e validação manual, cada um de um jeito.

## Decisão
Decidimos que todo formulário usa react-hook-form com zodResolver, schema zod no próprio arquivo do form e campos envolvidos por `FormField`.

## Consequências
**Positivas:** validação consistente, tipos derivados do schema.
**Negativas:** dependência de duas libs.

## Alternativas Consideradas
- Formik — descartado: manutenção fraca.
