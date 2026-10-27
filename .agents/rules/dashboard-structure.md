# dashboard-structure.md — Struktur 3 peran

- **Member**: ringkasan latihan, jadwal, progres. Tidak boleh melihat data member lain.
- **Coach**: kelas yang diampu, daftar pesertanya, catatan latihan.
- **Admin**: kelola user, kelola coach (multi-spesialisasi), pantau operasional & keuangan.

Struktur kode:
- Halaman per domain: `src/pages/<peran>/<modul>/` + subfolder `components/` untuk bagian yang hanya dipakai modul itu.
- Layout per area: `src/layouts/{PublicLayout,AuthLayout,DashboardLayout,CoachLayout,AdminLayout}.tsx`.
- Proteksi rute: `src/routes/ProtectedRoute.tsx`; simpan status auth di `src/store/useAuthStore.ts`.
- Komponen yang dipakai lintas halaman naik ke `src/components/`; primitif shadcn tetap di `src/components/ui/`.
- Semua permintaan data lewat `src/lib/services/*` — jangan `axios` langsung dari komponen.
