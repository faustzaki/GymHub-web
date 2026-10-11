// ============================================================
// CoachDeactivateAlert — Alert dialog konfirmasi nonaktifkan
// ============================================================

import { useCoachManagement } from '@/hooks/useCoachManagement';
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

export function CoachDeactivateAlert() {
  const { isDeactivateOpen, setIsDeactivateOpen, selectedCoach, confirmDeactivate, isLoading } =
    useCoachManagement();

  return (
    <AlertDialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nonaktifkan Coach?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menonaktifkan coach{' '}
            <strong>{selectedCoach?.nama}</strong>? Coach yang dinonaktifkan tidak
            akan muncul dalam penugasan kursus dan jadwal baru.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeactivate}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Memproses...' : 'Nonaktifkan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
