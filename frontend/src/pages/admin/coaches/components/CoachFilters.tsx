// ============================================================
// CoachFilters — Search bar + Multi-parameter filter dropdowns
// ============================================================

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, RotateCcw } from 'lucide-react';
import { useCoachManagement } from '@/hooks/useCoachManagement';
import { useNavigate } from 'react-router-dom';
import { COACH_SPECIALIZATIONS } from '@/lib/mock/dummy-coaches';

export function CoachFilters() {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterSpecialization,
    setFilterSpecialization,
    filterGender,
    setFilterGender,
  } = useCoachManagement();

  const navigate = useNavigate();

  const hasActiveFilters =
    filterStatus !== 'Semua' ||
    filterSpecialization !== 'Semua' ||
    filterGender !== 'Semua';

  const resetFilters = () => {
    setFilterStatus('Semua');
    setFilterSpecialization('Semua');
    setFilterGender('Semua');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Search + Tambah Coach */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="coach-search-input"
            type="search"
            placeholder="Cari nama atau email coach..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tambah Coach Button */}
        <Button
          id="btn-add-coach"
          onClick={() => navigate('/admin/coaches/create')}
          className="h-10 w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Coach
        </Button>
      </div>

      {/* Row 2: Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter Status */}
        <Select
          value={filterStatus}
          onValueChange={(val) => setFilterStatus(val as any)}
        >
          <SelectTrigger id="filter-status" className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Spesialisasi */}
        <Select
          value={filterSpecialization}
          onValueChange={(val) => setFilterSpecialization(val as any)}
        >
          <SelectTrigger id="filter-specialization" className="w-full sm:w-52 h-9">
            <SelectValue placeholder="Spesialisasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Spesialisasi</SelectItem>
            {COACH_SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Gender */}
        <Select
          value={filterGender}
          onValueChange={(val) => setFilterGender(val as any)}
        >
          <SelectTrigger id="filter-gender" className="w-full sm:w-44 h-9">
            <SelectValue placeholder="Jenis Kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Gender</SelectItem>
            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
            <SelectItem value="Perempuan">Perempuan</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
