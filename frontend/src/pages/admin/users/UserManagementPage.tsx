import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { UserFormResponsive } from "./components/UserFormResponsive";
import { UserDetailSheet } from "./components/UserDetailSheet";
import { UserDeleteAlert } from "./components/UserDeleteAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
        <p className="text-muted-foreground">
          Kelola data member gym, status langganan, dan riwayat aktivitas mereka.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Daftar Member</CardTitle>
              <CardDescription>
                Pencarian, filter, dan ekspor data member secara keseluruhan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Komponen Modular UI */}
          <UserFilters />
          <UserTable />
          
          {/* Modals & Dialogs (Tersembunyi secara default) */}
          <UserFormResponsive />
          <UserDetailSheet />
          <UserDeleteAlert />
        </CardContent>
      </Card>
    </div>
  );
}
