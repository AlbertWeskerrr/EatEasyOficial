
Objetivo
- Tirar o “Aviso importante” grande do topo do questionário (onboarding), porque está chamando muita atenção e “poluindo” a tela.
- Manter, se necessário, uma mensagem bem discreta apenas na etapa final (Resumo), com texto leve e links para Termos/Privacidade.

O que está acontecendo hoje (diagnóstico)
- O aviso “horrível” é o componente `LegalNotice` (título “Aviso importante”) renderizado no topo do onboarding:
  - Arquivo: `src/components/onboarding/OnboardingQuestionnaire.tsx`
  - Trecho atual: dentro do Content, antes das etapas: `<LegalNotice />`

Decisão (conforme sua resposta)
- “Só no final”: o aviso não aparece durante as etapas 1–5.
- Na etapa de Resumo (final), exibimos uma linha de texto pequena e neutra, com links “Termos” e “Privacidade”, sem o bloco grande.

Mudanças planejadas (frontend)
1) Remover o aviso grande do topo do questionário
- Arquivo: `src/components/onboarding/OnboardingQuestionnaire.tsx`
- Ações:
  - Remover o import `LegalNotice`.
  - Remover o JSX do bloco:
    - ` <div className="max-w-xl mx-auto mb-4"> <LegalNotice /> </div> `
- Resultado: o questionário fica “limpo” em todas as etapas.

2) Adicionar aviso discreto somente no Resumo (final)
- Arquivo: `src/components/onboarding/StepSummary.tsx`
- Ações:
  - Inserir, acima dos botões finais (“Voltar” / “Ir para Dashboard”), um bloco bem sutil (texto pequeno, cor muted), por exemplo:
    - “Ao continuar, você confirma que leu os Termos de Uso e a Política de Privacidade. Este app não substitui orientação profissional.”
  - Incluir dois links (botões `variant="link"` sem padding) para abrir os documentos.
  - Para abrir os documentos com o modal existente, vamos reutilizar `LegalDocsDialog` diretamente dentro do `StepSummary` (igual o `LegalNotice` faz):
    - adicionar `useState` para `open` e para `tab` (`"terms"` | `"privacy"`)
    - renderizar `<LegalDocsDialog open={open} onOpenChange={setOpen} initialTab={tab} />`
- Importante: esse aviso será propositalmente pequeno e sem título “Aviso importante”, para ficar “tenue”.

Copy sugerida (bem leve e clara)
- Texto (uma linha ou duas no máximo):
  - “Ao continuar, você confirma que leu os Termos de Uso e a Política de Privacidade. Este app não substitui orientação profissional.”
- Links:
  - “Termos de Uso” | “Política de Privacidade”

Critérios de aceite (o que você vai ver no app)
- Durante as etapas 1–5 do questionário: não aparece mais o card “Aviso importante”.
- Na tela final “Resumo do seu Perfil”:
  - aparece apenas uma mensagem pequena e discreta perto dos botões finais
  - “Termos de Uso” e “Política de Privacidade” abrem o modal “Documentos Legais”
- Nada disso altera o resto do dashboard (apenas onboarding).

Plano de teste (end-to-end)
1) Abrir o onboarding (questionário) e passar pelas etapas 1–5:
   - confirmar que não existe mais o bloco grande “Aviso importante”.
2) Chegar na tela “Resumo do seu Perfil”:
   - confirmar que aparece só um texto pequeno e discreto no fim.
3) Clicar em “Termos de Uso” e “Política de Privacidade”:
   - confirmar que o modal abre na aba correta.
4) Finalizar (“Ir para Dashboard 🚀”):
   - confirmar que continua salvando e indo ao dashboard normalmente.

Arquivos que serão alterados
- `src/components/onboarding/OnboardingQuestionnaire.tsx` (remover LegalNotice do topo)
- `src/components/onboarding/StepSummary.tsx` (adicionar aviso discreto e links com modal)

Observações
- Isso resolve exatamente o “aviso importante do questionário” sem mexer nas outras áreas (ex.: tela de restrições pode continuar com `LegalNotice context="restrictions"` se você quiser, porque ali faz mais sentido).
