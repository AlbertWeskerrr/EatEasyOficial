import { useCallback, useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Diet } from "@/types";

interface ExportOptions {
  diet: Diet;
  dietName?: string;
  /** Nome vindo do profile (preferencial, ex.: profile.nome). */
  profileName?: string;
  /** Nome do usuário (fallback). */
  userName?: string;
  /** Mantido por compatibilidade com chamadas existentes (pode ser ignorado). */
  debug?: boolean;
}

function makeSafeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "")
    .slice(0, 80);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPortion(
  quantidade: number,
  unidade: string,
  porcaoDescricao?: string
) {
  const base = `${Math.round(quantidade * 10) / 10}${unidade}`;
  return porcaoDescricao ? `${base} (${porcaoDescricao})` : base;
}

function createPdfHtml(diet: Diet, userName?: string): string {
  const mealTypes = Array.isArray(diet.mealTypes) ? diet.mealTypes : [];
  const mealItems = Array.isArray(diet.mealItems) ? diet.mealItems : [];

  const orderedMeals = [...mealTypes].sort((a, b) => a.ordem - b.ordem);
  const mealTypeIds = new Set(orderedMeals.map((m) => m.id));

  const meals = orderedMeals
    .map((mt) => {
      const items = mealItems.filter((i) => i.mealTypeId === mt.id);
      return { ...mt, items };
    })
    .filter((m) => m.items.length > 0);

  const orphanItems = mealItems.filter(
    (i) => !i.mealTypeId || !mealTypeIds.has(i.mealTypeId)
  );

  const today = new Date().toLocaleDateString("pt-BR");
  const userDisplay = userName?.trim() ? userName.trim() : "Paciente";

  const mealTableHtml = (meal: {
    nome: string;
    icone: string;
    items: typeof mealItems;
  }) => {
    const rowsHtml = meal.items
      .map((item) => {
        const foodName = escapeHtml(item.food?.nome ?? "Alimento");
        const portion = escapeHtml(
          formatPortion(
            item.quantidade,
            item.food?.unidade ?? "",
            item.food?.porcaoDescricao
          )
        );

        return `
          <div class="row">
            <div class="cell name">${foodName}</div>
            <div class="cell portion">${portion}</div>
          </div>
        `;
      })
      .join("");

    return `
      <section class="meal">
        <div class="meal-head">
          <div class="meal-title">
            <span class="meal-icon">${escapeHtml(meal.icone || "")}</span>
            <span class="meal-name">${escapeHtml(meal.nome || "Refeição")}</span>
          </div>
        </div>

        <div class="table">
          ${rowsHtml}
        </div>
      </section>
    `;
  };

  const mealsHtml = meals.map(mealTableHtml).join("");
  const othersHtml = orphanItems.length
    ? mealTableHtml({ nome: "Outros", icone: "📌", items: orphanItems })
    : "";

  const bodyHtml =
    mealsHtml || othersHtml
      ? `${mealsHtml}${othersHtml}`
      : `<div class="empty">Nenhuma refeição cadastrada.</div>`;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #ffffff; color: #000000; }
          body { font-family: Arial, sans-serif; }

          .container { width: 794px; padding: 20px; }

          .top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 12px;
            margin-bottom: 14px;
            border-bottom: 1px solid #e5e7eb;
          }

          .brand { font-size: 12px; font-weight: 700; letter-spacing: 0.2px; }
          .title { margin-top: 2px; font-size: 18px; font-weight: 800; }

          .meta { text-align: right; }
          .meta .name { font-size: 12px; font-weight: 700; }
          .meta .date { margin-top: 2px; font-size: 10px; color: #4b5563; }

          .meal {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
            padding: 12px;
            margin-bottom: 10px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .meal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
          .meal-title { display: flex; align-items: center; gap: 8px; }
          .meal-icon { font-size: 14px; }
          .meal-name { font-size: 12px; font-weight: 800; }

          .table { display: flex; flex-direction: column; gap: 6px; }

          .row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
          .cell { font-size: 10px; line-height: 1.25; }
          .cell.name { font-weight: 600; word-break: break-word; flex: 1; }
          .cell.portion { color: #374151; white-space: nowrap; flex-shrink: 0; }

          .empty { padding: 12px; font-size: 11px; color: #6b7280; }

          @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="top">
            <div>
              <div class="brand">🍽️ Easy Eat</div>
              <div class="title">Plano Alimentar</div>
            </div>
            <div class="meta">
              <div class="name">${escapeHtml(userDisplay)}</div>
              <div class="date">${escapeHtml(today)}</div>
            </div>
          </header>

          <main>
            ${bodyHtml}
          </main>
        </div>
      </body>
    </html>
  `;
}

async function htmlToPdf(htmlString: string, filename: string) {
  const element = document.createElement("div");
  element.innerHTML = htmlString;

  // Mantém perto da viewport (mais confiável que -9999px) mas invisível ao usuário.
  element.style.position = "fixed";
  element.style.left = "0";
  element.style.top = "0";
  element.style.transform = "translateX(-120vw)";
  element.style.zIndex = "2147483647";
  element.style.pointerEvents = "none";

  // Força branco no container raiz também.
  element.style.setProperty("color-scheme", "light");
  element.style.setProperty("background-color", "#ffffff", "important");
  element.style.setProperty("background", "#ffffff", "important");
  element.style.setProperty("color", "#000000", "important");
  element.style.setProperty("-webkit-text-fill-color", "#000000", "important");

  document.body.appendChild(element);

  try {
    // FORÇA BRANCO/PRETO EM TODOS OS ELEMENTOS (evita vazar tema dark)
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      const node = el as HTMLElement;
      node.style.setProperty("background-color", "#ffffff", "important");
      node.style.setProperty("background", "#ffffff", "important");
      node.style.setProperty("color", "#000000", "important");
      node.style.setProperty("-webkit-text-fill-color", "#000000", "important");
    });

    // Pequeno delay para garantir layout/estilos computados antes do capture.
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    element.remove();
  }
}


export function useExportDietPDFCanvas() {
  const [isExportingDietId, setIsExportingDietId] = useState<string | null>(null);

  const exportToPDF = useCallback(async (options: ExportOptions) => {
    const { diet, dietName, profileName, userName } = options;
    const displayName = (profileName ?? userName ?? "Usuario").trim() || "Usuario";

    if (!diet) {
      toast.error("Dieta inválida");
      return;
    }

    setIsExportingDietId(diet.id);

    try {
      const htmlString = createPdfHtml(diet, displayName);

      const dateStr = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
      const safeDietName = makeSafeFilenamePart(dietName || diet.nome || "Dieta");
      const safeUserName = makeSafeFilenamePart(displayName);
      const filename = `EasyEat_${safeDietName}_${safeUserName}_${dateStr}.pdf`;

      await htmlToPdf(htmlString, filename);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("🚨 Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExportingDietId(null);
    }
  }, []);

  return {
    exportToPDF,
    isExporting: isExportingDietId !== null,
    isExportingDietId,
  };
}
