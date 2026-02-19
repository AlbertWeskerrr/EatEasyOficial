import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type LegalDocTab = "terms" | "privacy";

type LegalDocsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: LegalDocTab;
};

export function LegalDocsDialog({ open, onOpenChange, initialTab = "terms" }: LegalDocsDialogProps) {
  const [tab, setTab] = useState<LegalDocTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Documentos Legais</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as LegalDocTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="terms" className="flex-1">
              Termos de Uso
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">
              Política de Privacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="mt-4">
            <div className="space-y-4 text-sm text-foreground">
              <section className="space-y-2">
                <h3 className="text-base font-semibold">1) Natureza do serviço</h3>
                <p className="text-muted-foreground">
                  Este aplicativo fornece orientações e um plano alimentar personalizado com base nas informações informadas
                  pelo usuário. O conteúdo tem finalidade informativa e de apoio.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">2) Não substitui profissionais</h3>
                <p className="text-muted-foreground">
                  O aplicativo não substitui avaliação, diagnóstico, prescrição ou acompanhamento de profissionais de saúde
                  (médico/nutricionista). Consulte um profissional para orientações adequadas ao seu caso.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">3) Alergias e segurança</h3>
                <p className="text-muted-foreground">
                  Alertas de alergias/restrições são auxiliares e podem não detectar 100% dos casos. Verifique rótulos,
                  composição e orientações médicas, especialmente em situações de alergias graves.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">4) Emergências</h3>
                <p className="text-muted-foreground">
                  Se você tiver sintomas, reações adversas ou qualquer preocupação importante, busque orientação/atendimento
                  adequado.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">5) Aceite</h3>
                <p className="text-muted-foreground">
                  Ao utilizar o aplicativo, você declara que leu e concorda com estes Termos de Uso e com a Política de
                  Privacidade.
                </p>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="mt-4">
            <div className="space-y-4 text-sm text-foreground">
              <section className="space-y-2">
                <h3 className="text-base font-semibold">1) Dados coletados</h3>
                <p className="text-muted-foreground">
                  Podemos coletar dados de conta (ex.: email) e dados informados por você para personalização do plano (ex.:
                  objetivos, preferências, restrições e dados corporais).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">2) Finalidade</h3>
                <p className="text-muted-foreground">
                  Usamos esses dados para gerar e melhorar sua experiência, personalizar recomendações e manter o
                  funcionamento do aplicativo.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">3) Compartilhamento</h3>
                <p className="text-muted-foreground">
                  Não vendemos seus dados. Compartilhamentos podem ocorrer apenas quando necessário para operar o serviço
                  (ex.: infraestrutura) ou para cumprimento de obrigações legais.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">4) Segurança</h3>
                <p className="text-muted-foreground">
                  Adotamos medidas razoáveis para proteger dados, mas nenhum sistema é 100% seguro.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-semibold">5) Seus direitos</h3>
                <p className="text-muted-foreground">
                  Você pode solicitar informações, correções e exclusão de dados conforme aplicável. (Conteúdo provisório;
                  substituível por texto jurídico oficial.)
                </p>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
