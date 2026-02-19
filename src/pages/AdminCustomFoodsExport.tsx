import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ExportFood = {
  id: string;
  nome: string;
  categoria: string;
  porcao_descricao: string | null;
};

export default function AdminCustomFoodsExport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ExportFood[]>([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("admin-export-custom-foods");

      if (!mounted) return;

      if (error) {
        const status = (error as any)?.context?.status ?? (error as any)?.status;
        if (status === 401) setError("Você precisa estar logado para exportar.");
        else if (status === 403) setError("Sem permissão de admin para exportar.");
        else setError("Falha ao carregar os alimentos para exportação.");
        setItems([]);
        setLoading(false);
        return;
      }

      const received = (data as any)?.items as ExportFood[] | undefined;
      setItems(Array.isArray(received) ? received : []);
      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const jsonText = useMemo(() => JSON.stringify(items, null, 2), [items]);

  const canExport = !loading && !error && items.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      toast.success("Copiado como JSON!");
    } catch {
      toast.error("Não foi possível copiar. Tente copiar manualmente da textarea.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-foods-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Em alguns navegadores/iframes, revogar imediatamente pode cancelar o download.
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast.success("Download iniciado!");
    } catch {
      toast.error("Não foi possível iniciar o download.");
    }
  };

  return (
    <main className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Custom Foods (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {loading
                ? "Carregando…"
                : error
                  ? error
                  : `${items.length} alimentos carregados.`}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleCopy} disabled={!canExport}>
                Copiar como JSON
              </Button>
              <Button variant="secondary" onClick={handleDownload} disabled={!canExport}>
                Baixar JSON
              </Button>
            </div>
          </div>

          <section aria-label="JSON" className="space-y-2">
            <p className="text-xs text-muted-foreground">Clique no campo abaixo para baixar o JSON.</p>
            <Textarea
              value={jsonText}
              readOnly
              onClick={() => {
                if (canExport) handleDownload();
              }}
              className={
                "min-h-[220px] font-mono text-xs " + (canExport ? "cursor-pointer" : "cursor-not-allowed")
              }
            />
          </section>

          <section aria-label="Tabela de alimentos" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Porção</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.id}</TableCell>
                    <TableCell>{f.nome}</TableCell>
                    <TableCell>{f.categoria}</TableCell>
                    <TableCell>{f.porcao_descricao ?? ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
