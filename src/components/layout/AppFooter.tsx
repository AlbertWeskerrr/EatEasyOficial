import { useState } from "react";

import logoEasyEat from "@/assets/logo-easyeat.png";
import { LegalDocsDialog, type LegalDocTab } from "@/components/legal/LegalDocsDialog";

export function AppFooter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LegalDocTab>("terms");

  const openDocs = (nextTab: LegalDocTab) => {
    setTab(nextTab);
    setOpen(true);
  };

  return (
    <>
      <footer className="border-t border-border bg-card/50 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoEasyEat} alt="Easy Eat" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-semibold text-foreground">Easy Eat</span>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">© 2026 Easy Eat. Seu Plano Alimentar Personalizado.</p>
              <p className="text-xs text-muted-foreground">
                Aviso: orientações e plano personalizado para apoiar sua rotina; não substitui orientação profissional.
              </p>
            </div>

            <nav className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Links legais">
              <button
                type="button"
                className="hover:text-foreground transition-colors"
                onClick={() => openDocs("terms")}
              >
                Termos de Uso
              </button>
              <span aria-hidden>•</span>
              <button
                type="button"
                className="hover:text-foreground transition-colors"
                onClick={() => openDocs("privacy")}
              >
                Privacidade
              </button>
              <span aria-hidden>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Contato
              </a>
            </nav>
          </div>
        </div>
      </footer>

      <LegalDocsDialog open={open} onOpenChange={setOpen} initialTab={tab} />
    </>
  );
}
