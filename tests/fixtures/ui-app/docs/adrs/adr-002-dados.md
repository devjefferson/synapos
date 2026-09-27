---
id: adr-002
title: "Leitura de dados em Server Components via src/lib/api.ts"
domain: [frontend]
scope: [data fetching, src/app/**/page.tsx, src/lib/api.ts]
status: accepted
date: 2026-03-10
---

# ADR-002: Leitura de dados em Server Components

## Status
accepted

## Contexto
Páginas misturavam fetch no cliente com useEffect e bibliotecas de cache diferentes.

## Decisão
Decidimos que páginas são Server Components que leem dados chamando funções de `src/lib/api.ts`. Mutations usam Server Actions (`actions.ts` ao lado da página). Não usamos React Query/SWR nem fetch no cliente.

## Consequências
**Positivas:** um único caminho de dados; loading/error via `loading.tsx` e `error.tsx` da rota.
**Negativas:** interações client-heavy precisam de avaliação caso a caso.

## Alternativas Consideradas
- React Query — descartado: duplicaria o cache do Next.
