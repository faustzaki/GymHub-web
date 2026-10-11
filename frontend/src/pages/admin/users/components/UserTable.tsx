import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserManagement } from "@/hooks/useUserManagement";

export function UserTable() {
  const { 
    paginatedUsers, 
    currentPage, 
    totalPages, 
    setCurrentPage, 
    itemsPerPage, 
    setItemsPerPage,
    handleEdit,
    handleViewDetail,
    handleDeleteClick
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nama}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.status_langganan === 'Aktif' ? 'default' : 
                        user.status_langganan === 'Pending' ? 'secondary' : 'destructive'
                      }
                      className={user.status_langganan === 'Aktif' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                      {user.status_langganan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.tanggal_daftar).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewDetail(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
        <div className="flex items-center text-sm text-muted-foreground order-2 sm:order-1">
          Baris per halaman: 
          <select 
            className="ml-2 bg-transparent border border-border rounded-md px-1 py-0.5 focus:outline-none"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <div className="text-sm font-medium whitespace-nowrap">
            {currentPage} / {Math.max(1, totalPages)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
