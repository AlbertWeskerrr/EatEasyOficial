import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Pencil, Copy, Trash2, Check, Download, Loader2 } from 'lucide-react';
import { Diet } from '@/types';

interface DietSwitcherProps {
  diets: Diet[];
  activeDietId: string;
  onSwitch: (dietId: string) => void;
  onRename: (dietId: string, name: string) => void;
  onClear: (dietId: string) => void;
  onClone: (sourceId: string, targetId: string) => void;
  onExportPDF?: (dietId: string) => void;
  isExportingDietId?: string | null;
}

export function DietSwitcher({
  diets,
  activeDietId,
  onSwitch,
  onRename,
  onClear,
  onClone,
  onExportPDF,
  isExportingDietId,
}: DietSwitcherProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null);
  const [pdfDebugEnabled, setPdfDebugEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pdf_export_debug') === '1';
  });

  useEffect(() => {
    try {
      localStorage.setItem('pdf_export_debug', pdfDebugEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [pdfDebugEnabled]);

  const handleStartEdit = (diet: Diet) => {
    setEditingId(diet.id);
    setEditName(diet.nome);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleClone = (targetId: string) => {
    if (cloneSourceId) {
      onClone(cloneSourceId, targetId);
      setShowCloneDialog(false);
      setCloneSourceId(null);
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Minhas Dietas
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Diagnóstico PDF</span>
            <Switch
              checked={pdfDebugEnabled}
              onCheckedChange={setPdfDebugEnabled}
              aria-label="Ativar diagnóstico do export de PDF"
            />
          </div>

          <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCloneSourceId(activeDietId)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Clonar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clonar Dieta</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha para qual slot deseja copiar a dieta atual:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {diets.filter((d) => d.id !== cloneSourceId).map((diet) => (
                  <Button
                    key={diet.id}
                    variant="outline"
                    onClick={() => handleClone(diet.id)}
                    className="flex-col h-auto py-3"
                  >
                    <span className="font-medium">{diet.nome}</span>
                    <span className="text-xs text-muted-foreground">{diet.mealItems.length} itens</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2">
        {diets.map((diet, index) => {
          const isActive = diet.id === activeDietId;
          const isEditing = editingId === diet.id;
          const isExportingThis = isExportingDietId === diet.id;

          return (
            <div key={diet.id} className="flex-1">
              <button
                onClick={() => !isEditing && onSwitch(diet.id)}
                className={`
                  w-full relative rounded-lg p-3 transition-all duration-300
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold mb-1">{index + 1}</div>
                  {isEditing ? (
                    <div className="flex gap-2 mt-2 w-full justify-center">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-xs px-2 bg-background text-foreground text-center"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs truncate mt-2 pt-1 border-t border-current/20 text-center w-full">
                      {diet.nome}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="absolute -top-1 -right-1 flex gap-0.5">
                    {onExportPDF && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportPDF(diet.id);
                        }}
                        disabled={!!isExportingDietId}
                        title="Exportar PDF"
                        className="p-1 rounded-full bg-background/20 hover:bg-background/40 transition-colors disabled:opacity-60"
                      >
                        {isExportingThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    {isActive && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(diet);
                          }}
                          className="p-1 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                          title="Renomear"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {diet.mealItems.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Limpar todos os alimentos desta dieta?')) {
                                onClear(diet.id);
                              }
                            }}
                            className="p-1 rounded-full bg-background/20 hover:bg-destructive/80 transition-colors"
                            title="Limpar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Item count badge */}
                {diet.mealItems.length > 0 && (
                  <div
                    className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-xs font-bold
                      flex items-center justify-center
                      ${isActive ? 'bg-background text-primary' : 'bg-primary text-primary-foreground'}
                    `}
                  >
                    {diet.mealItems.length}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
