import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  open: boolean;
  onUseRemote: () => void;
  onKeepLocal: () => void;
  remoteUpdatedAt?: string | null;
  localUpdatedAtMs?: number | null;
};

export function DietSyncConflictDialog({
  open,
  onUseRemote,
  onKeepLocal,
  remoteUpdatedAt,
  localUpdatedAtMs,
}: Props) {
  const remoteLabel = remoteUpdatedAt
    ? formatDistanceToNow(new Date(remoteUpdatedAt), { addSuffix: true, locale: ptBR })
    : "(desconhecido)";

  const localLabel = localUpdatedAtMs
    ? formatDistanceToNow(new Date(localUpdatedAtMs), { addSuffix: true, locale: ptBR })
    : "(desconhecido)";

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conflito de dietas</AlertDialogTitle>
          <AlertDialogDescription>
            Encontramos alterações diferentes neste dispositivo e no backend. Escolha qual versão manter.
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Este dispositivo:</span> {localLabel}
              </div>
              <div>
                <span className="font-medium text-foreground">Backend:</span> {remoteLabel}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onUseRemote}>
              Usar do backend
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button onClick={onKeepLocal}>Manter deste dispositivo</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
