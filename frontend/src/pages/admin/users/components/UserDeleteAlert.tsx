import { useUserManagement } from "@/hooks/useUserManagement";
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

export function UserDeleteAlert() {
  const { isDeleteOpen, setIsDeleteOpen, selectedUser, confirmDelete } = useUserManagement();

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus member <strong>{selectedUser?.nama}</strong>? 
            Tindakan ini akan menghapus data dari tampilan aktif secara permanen (Soft Delete).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
