import { Diet } from "@/types";
import { useLayoutEffect } from "react";

interface DietPdfDocumentProps {
  diet: Diet;
  onRendered?: () => void;
}

function formatPortion(quantidade: number, unidade: string, porcaoDescricao?: string) {
  const base = `${Math.round(quantidade * 10) / 10}${unidade}`;
  return porcaoDescricao ? `${base} (${porcaoDescricao})` : base;
}

export function DietPdfDocument({ diet, onRendered }: DietPdfDocumentProps) {
  // Signal to the PDF capture hook that React has committed the DOM.
  useLayoutEffect(() => {
    onRendered?.();
  }, [onRendered]);

  const orderedMeals = [...diet.mealTypes].sort((a, b) => a.ordem - b.ordem);

  const meals = orderedMeals
    .map((mt) => {
      const items = diet.mealItems.filter((i) => i.mealTypeId === mt.id);
      return { ...mt, items };
    })
    .filter((m) => m.items.length > 0);

  // Fallback: if there are items but mealTypes mismatch (corrupt/legacy), show them under "Outros"
  const orphanItems = diet.mealItems.filter((i) => !diet.mealTypes.some((mt) => mt.id === i.mealTypeId));
  if (orphanItems.length > 0) {
    meals.push({
      id: "outros",
      nome: "Outros",
      icone: "🍴",
      cor: "muted",
      ordem: 999,
      items: orphanItems,
    });
  }

  return (
    <article
      // IMPORTANT: do not use display:none; html2canvas needs it rendered.
      className="pdf-export bg-background text-foreground"
    >
      <header className="pb-3 border-b border-border">
        <h2 className="text-lg font-bold leading-tight">{diet.nome}</h2>
        <p className="text-xs text-muted-foreground">Plano alimentar — exportação compacta (1 página)</p>
      </header>

      <main className="pt-3">
        {/* Use 2 columns to maximize A4 width, but keep cards intact */}
        <section className="grid grid-cols-2 gap-3">
          {meals.length === 0 ? (
            <div className="col-span-2 text-sm text-muted-foreground">
              Nenhuma refeição/adaptação cadastrada nesta dieta.
            </div>
          ) : (
            meals.map((meal) => (
              <section
                key={meal.id}
                className="rounded-md border border-border bg-card px-3 py-2 break-inside-avoid"
              >
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span aria-hidden="true">{meal.icone}</span>
                  <span className="truncate">{meal.nome}</span>
                </h3>

                <ul className="mt-2 space-y-1">
                  {meal.items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3">
                      <span className="text-xs leading-snug font-medium truncate">{item.food.nome}</span>
                      <span className="text-[11px] leading-snug text-muted-foreground whitespace-nowrap">
                        {formatPortion(item.quantidade, item.food.unidade, item.food.porcaoDescricao)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </section>
      </main>
    </article>
  );
}
