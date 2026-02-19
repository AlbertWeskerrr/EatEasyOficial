import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRestrictions } from '@/hooks/useRestrictions';
import { RestrictionSelector } from '@/components/restrictions/RestrictionSelector';
import { toast } from 'sonner';
import { LegalNotice } from '@/components/legal/LegalNotice';
import { AppFooter } from '@/components/layout/AppFooter';

export default function RestrictionsSettings() {
  const navigate = useNavigate();
  const { allRestrictions, userRestrictions, loading, setRestrictions } = useRestrictions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const initialIds = useMemo(() => userRestrictions.map((r) => r.id), [userRestrictions]);

  useEffect(() => {
    // Mantém seleção sincronizada com o backend quando carregar/atualizar.
    setSelectedIds(initialIds);
  }, [initialIds]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const ok = await setRestrictions(selectedIds);
      if (!ok) {
        toast.error('Não foi possível salvar suas restrições.');
        return;
      }
      toast.success('Restrições salvas com sucesso!');
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-foreground" />
            <span className="font-semibold text-foreground">Minhas Restrições</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="text-foreground hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Selecione suas restrições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LegalNotice context="restrictions" />
            <p className="text-sm text-muted-foreground">
              Essas informações serão usadas para alertar quando você tentar adicionar alimentos incompatíveis.
            </p>

            <RestrictionSelector
              allRestrictions={allRestrictions}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              disabled={loading || saving}
            />

            <Separator />

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => navigate('/')} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading || saving} className="gradient-theme text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando…' : 'Salvar Restrições'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <AppFooter />
    </main>
  );
}
