import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RestrictionMatch, RESTRICTION_CATEGORIES, RestrictionCategory } from '@/types/restrictions';
import { cn } from '@/lib/utils';

interface RestrictionWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodName: string;
  matches: RestrictionMatch[];
  onConfirmAdd: () => void;
  onSelectAlternative?: (alternativeName: string) => void;
}

export function RestrictionWarningDialog({
  open,
  onOpenChange,
  foodName,
  matches,
  onConfirmAdd,
  onSelectAlternative,
}: RestrictionWarningDialogProps) {
  if (matches.length === 0) return null;

  const allAlternatives = [...new Set(matches.flatMap((m) => m.alternatives))];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Alerta de Restrição Alimentar
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                O alimento <strong className="text-foreground">"{foodName}"</strong> conflita com suas
                restrições:
              </p>

              {/* Matched restrictions */}
              <div className="space-y-2">
                {matches.map((match, idx) => {
                  const category = RESTRICTION_CATEGORIES[match.restriction.category as RestrictionCategory];
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border',
                        category.bgClass,
                        category.borderClass
                      )}
                    >
                      <span className="text-lg">{match.restriction.icon}</span>
                      <div className="flex-1">
                        <span className={cn('font-medium', category.textClass)}>
                          {match.restriction.name}
                        </span>
                        <span className="text-muted-foreground text-sm ml-2">
                          (contém "{match.matchedKeyword}")
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alternatives */}
              {allAlternatives.length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                    💡 Alternativas sugeridas:
                  </p>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {allAlternatives.map((alt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSelectAlternative?.(alt)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{alt}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                onConfirmAdd();
                onOpenChange(false);
              }}
            >
              Adicionar Mesmo Assim
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
