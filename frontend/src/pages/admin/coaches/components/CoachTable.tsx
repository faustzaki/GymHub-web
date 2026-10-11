// ============================================================
// CoachTable — Tabel data coach + Pagination
// ============================================================

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Eye, Edit, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCoachManagement } from '@/hooks/useCoachManagement';
import { useNavigate } from 'react-router-dom';

/** Helper: ambil inisial nama (2 huruf pertama) */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Skeleton loading rows */
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function CoachTable() {
  const {
    paginatedCoaches,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleViewDetail,
    handleDeactivateClick,
  } = useCoachManagement();

  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Tabel */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedCoaches.length > 0 ? (
              paginatedCoaches.map((coach) => (
                <TableRow key={coach.id}>
                  {/* Coach (Avatar + Nama) */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={coach.foto_url} alt={coach.nama} />
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {getInitials(coach.nama)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium whitespace-nowrap">{coach.nama}</span>
                    </div>
                  </TableCell>

                  {/* Spesialisasi */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {coach.spesialisasi.map((spec) => (
                        <Badge key={spec} variant="outline" className="whitespace-nowrap font-normal text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  {/* Gender (hidden di mobile) */}
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {coach.jenis_kelamin}
                  </TableCell>

                  {/* Email (hidden di mobile & tablet) */}
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {coach.email}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={coach.status === 'Aktif' ? 'default' : 'destructive'}
                      className={
                        coach.status === 'Aktif'
                          ? 'bg-green-500/15 text-green-500 border-green-500/20 hover:bg-green-500/25'
                          : 'bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25'
                      }
                    >
                      {coach.status}
                    </Badge>
                  </TableCell>

                  {/* Action Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetail(coach)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/coaches/${coach.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {coach.status === 'Aktif' && (
                          <DropdownMenuItem
                            onClick={() => handleDeactivateClick(coach)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Nonaktifkan
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserX className="h-8 w-8" />
                    <p>Tidak ada data coach ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground order-2 sm:order-1">
          <span>
            {totalItems} coach ditemukan
          </span>
          <div className="flex items-center">
            Baris per halaman:
            <select
              id="coach-items-per-page"
              className="ml-2 bg-transparent border border-border rounded-md px-1.5 py-0.5 focus:outline-none text-foreground"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            id="btn-prev-page"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <div className="text-sm font-medium whitespace-nowrap">
            {currentPage} / {totalPages}
          </div>
          <Button
            id="btn-next-page"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
