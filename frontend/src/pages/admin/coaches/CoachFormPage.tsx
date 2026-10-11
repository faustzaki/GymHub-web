// ============================================================
// CoachFormPage — Halaman form Tambah / Edit Coach
// ============================================================
//
// Routing:
//   - /admin/coaches/create    → Mode Tambah (form kosong)
//   - /admin/coaches/:id/edit  → Mode Edit (pre-filled data)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, X, FileText, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import * as coachService from '@/lib/services/coachService';
import { useCoachManagementStore } from '@/store/useCoachManagementStore';
import {
  COACH_SPECIALIZATIONS,
  type Coach,
  type CoachSpecialization,
  type CoachGender,
  type CoachStatus,
} from '@/lib/mock/dummy-coaches';

/** State form internal */
interface CoachFormData {
  nama: string;
  email: string;
  password: string;
  tanggal_lahir: string;
  jenis_kelamin: CoachGender;
  no_hp: string;
  spesialisasi: CoachSpecialization[];
  bio: string;
  status: CoachStatus;
  social_media_instagram: string;
  social_media_youtube: string;
  social_media_tiktok: string;
}

const INITIAL_FORM_DATA: CoachFormData = {
  nama: '',
  email: '',
  password: '',
  tanggal_lahir: '',
  jenis_kelamin: 'Laki-laki',
  no_hp: '',
  spesialisasi: [],
  bio: '',
  status: 'Aktif',
  social_media_instagram: '',
  social_media_youtube: '',
  social_media_tiktok: '',
};

export function CoachFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const addCoachToStore = useCoachManagementStore((s) => s.addCoach);
  const updateCoachInStore = useCoachManagementStore((s) => s.updateCoachInStore);

  // Form state
  const [formData, setFormData] = useState<CoachFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // File upload simulation
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [certFiles, setCertFiles] = useState<{ name: string; file_url: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Load existing coach data jika mode edit
  useEffect(() => {
    if (isEditing && id) {
      setIsLoadingData(true);
      coachService
        .fetchCoachById(id)
        .then((coach) => {
          if (coach) {
            setFormData({
              nama: coach.nama,
              email: coach.email,
              password: '',
              tanggal_lahir: coach.tanggal_lahir,
              jenis_kelamin: coach.jenis_kelamin,
              no_hp: coach.no_hp,
              spesialisasi: coach.spesialisasi,
              bio: coach.bio,
              status: coach.status,
              social_media_instagram: coach.social_media.instagram || '',
              social_media_youtube: coach.social_media.youtube || '',
              social_media_tiktok: coach.social_media.tiktok || '',
            });
            setPhotoPreview(coach.foto_url);
            setCertFiles(coach.sertifikasi);
          } else {
            toast.error('Coach tidak ditemukan.');
            navigate('/admin/coaches');
          }
        })
        .catch(() => {
          toast.error('Gagal memuat data coach.');
          navigate('/admin/coaches');
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [id, isEditing, navigate]);

  // ─────────────── File Handlers ───────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFileName(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newCerts = Array.from(files).map((file) => ({
        name: file.name,
        file_url: URL.createObjectURL(file),
      }));
      setCertFiles((prev) => [...prev, ...newCerts]);
    }
    // Reset input agar bisa re-select file yang sama
    if (certInputRef.current) {
      certInputRef.current.value = '';
    }
  };

  const removeCert = (index: number) => {
    setCertFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ─────────────── Form Submit ───────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dasar
    if (!formData.nama.trim() || !formData.email.trim()) {
      toast.error('Nama dan email wajib diisi.');
      return;
    }

    if (!isEditing && !formData.password.trim()) {
      toast.error('Password wajib diisi untuk coach baru.');
      return;
    }

    if (formData.spesialisasi.length === 0) {
      toast.error('Pilih minimal 1 spesialisasi.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Bangun foto_url (gunakan preview lokal atau generate dari nama)
      const foto_url =
        photoPreview ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nama)}&background=random&color=fff&size=128&bold=true`;

      const payload = {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        no_hp: formData.no_hp,
        spesialisasi: formData.spesialisasi,
        bio: formData.bio,
        foto_url,
        status: formData.status,
        sertifikasi: certFiles,
        social_media: {
          instagram: formData.social_media_instagram || undefined,
          youtube: formData.social_media_youtube || undefined,
          tiktok: formData.social_media_tiktok || undefined,
        },
      };

      if (isEditing && id) {
        const updated = await coachService.updateCoach(id, payload);
        updateCoachInStore(id, updated);
        toast.success(`Data coach ${formData.nama} berhasil diperbarui.`);
      } else {
        const created = await coachService.createCoach(payload);
        addCoachToStore(created);
        toast.success(`Coach ${formData.nama} berhasil ditambahkan.`);
      }

      navigate('/admin/coaches');
    } catch {
      toast.error(isEditing ? 'Gagal memperbarui data coach.' : 'Gagal menambahkan coach.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────── Helpers ───────────────

  const updateField = <K extends keyof CoachFormData>(field: K, value: CoachFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─────────────── Loading State ───────────────
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────── Render ───────────────
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/coaches')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit Coach' : 'Tambah Coach Baru'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Perbarui informasi profil dan akun coach.'
              : 'Isi formulir di bawah untuk mendaftarkan coach baru.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ====== Section 1: Informasi Dasar ====== */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            <CardDescription>Data identitas dan akun coach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="coach-nama">Nama Lengkap *</Label>
              <Input
                id="coach-nama"
                value={formData.nama}
                onChange={(e) => updateField('nama', e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach-email">Email *</Label>
                <Input
                  id="coach-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="email@gymhub.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-password">
                  Password {isEditing && '(Opsional)'}
                </Label>
                <Input
                  id="coach-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder={isEditing ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                  required={!isEditing}
                />
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Admin yang menentukan password awal untuk coach.
                  </p>
                )}
              </div>
            </div>

            {/* Tanggal Lahir + Jenis Kelamin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach-dob">Tanggal Lahir</Label>
                <Input
                  id="coach-dob"
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => updateField('tanggal_lahir', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-gender">Jenis Kelamin</Label>
                <Select
                  value={formData.jenis_kelamin}
                  onValueChange={(val) => updateField('jenis_kelamin', val as CoachGender)}
                >
                  <SelectTrigger id="coach-gender">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* No HP */}
            <div className="space-y-2">
              <Label htmlFor="coach-phone">Nomor Handphone</Label>
              <Input
                id="coach-phone"
                type="tel"
                value={formData.no_hp}
                onChange={(e) => updateField('no_hp', e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 2: Profil Profesional ====== */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Profil Profesional</CardTitle>
            <CardDescription>Spesialisasi, bio, dan status coach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Spesialisasi + Status */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Spesialisasi * <span className="text-xs text-muted-foreground font-normal">(pilih satu atau lebih)</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COACH_SPECIALIZATIONS.map((spec) => {
                    const isSelected = formData.spesialisasi.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            updateField('spesialisasi', formData.spesialisasi.filter((s) => s !== spec));
                          } else {
                            updateField('spesialisasi', [...formData.spesialisasi, spec]);
                          }
                        }}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                        }`}
                      >
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{spec}</span>
                      </button>
                    );
                  })}
                </div>
                {formData.spesialisasi.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.spesialisasi.length} spesialisasi dipilih
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:max-w-[calc(50%-0.5rem)]">
                <Label htmlFor="coach-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => updateField('status', val as CoachStatus)}
                >
                  <SelectTrigger id="coach-status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="coach-bio">Bio Singkat</Label>
              <Textarea
                id="coach-bio"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Deskripsi singkat tentang pengalaman dan keahlian coach..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 3: Foto & Sertifikasi ====== */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Foto & Dokumen</CardTitle>
            <CardDescription>Upload foto profil dan sertifikasi (opsional).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto Profile */}
            <div className="space-y-2">
              <Label>Foto Profile</Label>
              <div className="flex items-start gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Pilih Foto
                  </Button>
                  {photoFileName && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {photoFileName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Maks 2MB.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sertifikasi */}
            <div className="space-y-3">
              <Label>Sertifikasi (Opsional)</Label>
              <div className="space-y-2">
                {certFiles.map((cert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">{cert.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCert(idx)}
                      className="h-5 w-5 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                ref={certInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleCertChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => certInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Tambah Sertifikasi
              </Button>
              <p className="text-xs text-muted-foreground">
                Gambar atau PDF sertifikat pelatihan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 4: Social Media (Opsional) ====== */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Social Media</CardTitle>
            <CardDescription>Akun media sosial coach (opsional).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach-ig">Instagram</Label>
                <Input
                  id="coach-ig"
                  value={formData.social_media_instagram}
                  onChange={(e) => updateField('social_media_instagram', e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-yt">YouTube</Label>
                <Input
                  id="coach-yt"
                  value={formData.social_media_youtube}
                  onChange={(e) => updateField('social_media_youtube', e.target.value)}
                  placeholder="Nama channel"
                />
              </div>
            </div>
            <div className="space-y-2 sm:max-w-[calc(50%-0.5rem)]">
              <Label htmlFor="coach-tt">TikTok</Label>
              <Input
                id="coach-tt"
                value={formData.social_media_tiktok}
                onChange={(e) => updateField('social_media_tiktok', e.target.value)}
                placeholder="@username"
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Action Buttons ====== */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/coaches')}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Simpan Perubahan' : 'Tambah Coach'}
          </Button>
        </div>
      </form>
    </div>
  );
}
