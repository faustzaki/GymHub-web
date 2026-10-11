// ============================================================
// CoachManagementPage — Halaman utama tabel daftar coach
// ============================================================

import { useEffect } from 'react';
import { CoachFilters } from './components/CoachFilters';
import { CoachTable } from './components/CoachTable';
import { CoachDetailDialog } from './components/CoachDetailDialog';
import { CoachDeactivateAlert } from './components/CoachDeactivateAlert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { useCoachManagement } from '@/hooks/useCoachManagement';

export function CoachManagementPage() {
  const { loadCoaches } = useCoachManagement();

  // Load data saat mount
  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Coach</h1>
        <p className="text-muted-foreground">
          Kelola data pelatih gym, status spesialisasi, dan informasi profil mereka.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Daftar Coach</CardTitle>
              <CardDescription>
                Pencarian, filter, dan kelola data coach secara keseluruhan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Komponen Modular UI */}
          <CoachFilters />
          <CoachTable />

          {/* Modals & Dialogs (Tersembunyi secara default) */}
          <CoachDetailDialog />
          <CoachDeactivateAlert />
        </CardContent>
      </Card>
    </div>
  );
}
