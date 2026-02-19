import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LegalDocsDialog, type LegalDocTab } from "@/components/legal/LegalDocsDialog";

type LegalNoticeContext = "default" | "restrictions" | "builder";

type LegalNoticeProps = {
  context?: LegalNoticeContext;
  className?: string;
};

export function LegalNotice({ context = "default", className }: LegalNoticeProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LegalDocTab>("terms");

  const extraLine = useMemo(() => {
    if (context === "restrictions") {
      return "Os alertas de restrições/alergias são um apoio e podem não identificar todos os casos.";
    }
    if (context === "builder") {
      return "Para sua segurança, confira rótulos/ingredientes e siga orientações profissionais — principalmente em alergias.";
    }
    return null;
  }, [context]);

  const openDocs = (nextTab: LegalDocTab) => {
    setTab(nextTab);
    setOpen(true);
  };

  return (
    <>
      <Alert className={className}>
        <AlertTitle>Aviso importante</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>
              Este app ajuda você com orientações e um plano alimentar personalizado a partir das informações que você
              informar. Ele não substitui a orientação de um médico ou nutricionista. Em caso de dúvidas, sintomas ou
              alergias importantes, busque avaliação profissional. Ao continuar, você confirma que leu e concorda com os
              Termos de Uso e a Política de Privacidade.
            </p>
            {extraLine && <p className="text-muted-foreground">{extraLine}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => openDocs("terms")}>
                Termos de Uso
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => openDocs("privacy")}>
                Política de Privacidade
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <LegalDocsDialog open={open} onOpenChange={setOpen} initialTab={tab} />
    </>
  );
}
