import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Download, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserManagement } from "@/hooks/useUserManagement";

export function UserFilters() {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    exportToExcel,
    handleCreateNew
  } = useUserManagement();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Tabs Filter */}
        <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as any)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto h-10">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="new">Baru</TabsTrigger>
            <TabsTrigger value="inactive">Tidak Aktif</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari nama atau email..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportToExcel('current')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Halaman Ini
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToExcel('all')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Semua Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add User Button */}
        <Button onClick={handleCreateNew} className="h-10">
          Tambah Member
        </Button>
      </div>
    </div>
  );
}
