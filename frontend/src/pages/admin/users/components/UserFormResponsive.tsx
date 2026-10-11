import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionStatus } from "@/lib/mock/dummy-users";

export function UserFormResponsive() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { isFormOpen, setIsFormOpen, selectedUser, submitForm } = useUserManagement();
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    status_langganan: "Aktif" as SubscriptionStatus,
  });

  useEffect(() => {
    if (isFormOpen) {
      if (selectedUser) {
        setFormData({
          nama: selectedUser.nama,
          email: selectedUser.email,
          password: "",
          status_langganan: selectedUser.status_langganan,
        });
      } else {
        setFormData({
          nama: "",
          email: "",
          password: "",
          status_langganan: "Aktif",
        });
      }
    }
  }, [isFormOpen, selectedUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Jika ini adalah integrasi API asli, Anda akan mengirimkan formData.password ke backend di sini
    // Karena ini mock data, kita akan memisahkan field password agar tidak masuk ke dummy state jika kosong
    const { password, ...dataToSubmit } = formData;
    
    submitForm({
      ...dataToSubmit,
      tanggal_daftar: selectedUser ? selectedUser.tanggal_daftar : new Date().toISOString(),
      tanggal_aktivitas_terakhir: selectedUser ? selectedUser.tanggal_aktivitas_terakhir : new Date().toISOString(),
    });
  };

  const isEditing = !!selectedUser;

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input 
          id="nama" 
          value={formData.nama} 
          onChange={(e) => setFormData({...formData, nama: e.target.value})}
          required 
          placeholder="Masukkan nama lengkap"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required 
          placeholder="email@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password {isEditing && "(Opsional)"}</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder={isEditing ? "Kosongkan jika tidak ingin diubah" : "Masukkan password baru"} 
          required={!isEditing}
        />
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            Wajib diisi untuk member baru.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status Langganan</Label>
        <Select 
          value={formData.status_langganan} 
          onValueChange={(val: SubscriptionStatus) => setFormData({...formData, status_langganan: val})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
          Batal
        </Button>
        <Button type="submit">
          {isEditing ? "Simpan Perubahan" : "Tambah Member"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Member" : "Tambah Member Baru"}</DialogTitle>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Member" : "Tambah Member Baru"}</SheetTitle>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  );
}
