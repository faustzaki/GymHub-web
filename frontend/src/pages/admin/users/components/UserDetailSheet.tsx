import { useUserManagement } from "@/hooks/useUserManagement";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function UserDetailSheet() {
  const { isDetailOpen, setIsDetailOpen, selectedUser } = useUserManagement();

  if (!selectedUser) return null;

  return (
    <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Detail Member</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Nama Lengkap</h3>
            <p className="text-base font-semibold">{selectedUser.nama}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
            <p className="text-base">{selectedUser.email}</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">ID Member</h3>
            <p className="text-base font-mono">{selectedUser.id}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Status Langganan</h3>
            <Badge 
              variant={
                selectedUser.status_langganan === 'Aktif' ? 'default' : 
                selectedUser.status_langganan === 'Pending' ? 'secondary' : 'destructive'
              }
              className={selectedUser.status_langganan === 'Aktif' ? 'bg-green-500 text-white' : ''}
            >
              {selectedUser.status_langganan}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal Daftar</h3>
              <p className="text-sm">
                {new Date(selectedUser.tanggal_daftar).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Aktivitas Terakhir</h3>
              <p className="text-sm">
                {new Date(selectedUser.tanggal_aktivitas_terakhir).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
