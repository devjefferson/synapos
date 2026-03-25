---
id: nf-02-validar-requisito
name: "Validar Requisito"
execution: checkpoint
---

# Validar Requisito

Antes de qualquer spec, o requisito precisa estar sólido. Não assuma nada — pergunte.

## Entrada

O requisito foi passado como argumento ou descrito pelo usuário:

```
<requirement>
#$ARGUMENTS
</requirement>
```

Se nenhum argumento foi passado, pergunte:

```
Descreva o requisito ou feature que vamos especificar.
Inclua: o que é, por que existe, para quem é.
```

---

## Validação obrigatória

Verifique se o requisito contém as três dimensões:

| Dimensão | Pergunta | Presente? |
|---|---|---|
| **POR QUÊ** | Qual problema de negócio isto resolve? | ✅ / ❓ |
| **O QUÊ** | O que exatamente está sendo construído? | ✅ / ❓ |
| **COMO** | Há alguma diretriz técnica ou de produto? (opcional) | ✅ / — |

Se qualquer dimensão obrigatória estiver ausente ou vaga, faça perguntas diretas:

```
Preciso esclarecer alguns pontos antes de continuar:

[Para POR QUÊ ausente]
- Qual problema de negócio ou dor do usuário motivou esse requisito?
- O que acontece se não fizermos isso?

[Para O QUÊ vago]
- Pode descrever o comportamento esperado em 2-3 frases?
- O que está dentro do escopo desta entrega? O que está fora?
```

Iterate até ter clareza completa. Não prossiga com requisito incompleto.

---

## Output

Ao validar, apresente resumo confirmando o entendimento:

```
✅ Requisito validado

POR QUÊ: {resumo do problema/motivação}
O QUÊ: {resumo do que será construído}
PARA QUEM: {persona ou usuário alvo}
FORA DE ESCOPO: {o que não será feito}

Posso prosseguir para verificação dos docs?
```

Aguarde confirmação do usuário antes de avançar.
