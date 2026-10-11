import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  DollarSign,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Data statistik ringkasan untuk dashboard admin.
 * Berfokus pada metrik operasional dan finansial.
 */
const ADMIN_STATS = [
  {
    label: "Total Member Aktif",
    value: "254",
    icon: Users,
    change: "+12 bulan ini",
    color: "text-blue-500",
    bgColor: "bg-blue-600/10",
  },
  {
    label: "Pendapatan Bulan Ini",
    value: "Rp 15.4M",
    icon: DollarSign,
    change: "+8.5% dari bulan lalu",
    color: "text-green-500",
    bgColor: "bg-green-600/10",
  },
  {
    label: "Kursus Aktif",
    value: "18",
    icon: BookOpen,
    change: "2 kursus baru",
    color: "text-purple-500",
    bgColor: "bg-purple-600/10",
  },
  {
    label: "Sesi Hari Ini",
    value: "12",
    icon: CalendarDays,
    change: "3 sesi berjalan",
    color: "text-amber-500",
    bgColor: "bg-amber-600/10",
  },
];

/**
 * Pendaftaran terbaru (Mock Data)
 */
const RECENT_REGISTRATIONS = [
  { id: 1, name: "Budi Santoso", plan: "Pro Membership", date: "Hari ini, 08:30" },
  { id: 2, name: "Siti Aminah", plan: "Basic Plan", date: "Hari ini, 10:15" },
  { id: 3, name: "Andi Wijaya", plan: "Pro Membership", date: "Kemarin" },
];

/**
 * AdminOverviewPage — Halaman utama Admin Dashboard.
 *
 * Menampilkan ringkasan level atas (high-level summary) dari operasional gym:
 * - Metrik kunci (Member, Pendapatan, Kursus, Sesi).
 * - Aktivitas pendaftaran terbaru.
 * - Akses cepat ke laporan keuangan dan manajemen kursus.
 */
export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Laporan <span className="text-red-600">Operasional</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau performa bisnis dan aktivitas member Anda hari ini.
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-500 text-white">
          <TrendingUp className="mr-2" size={16} />
          Unduh Laporan
        </Button>
      </div>

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_STATS.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/50 hover:border-border transition-colors duration-200"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ====== CONTENT GRID ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pendaftaran Terbaru */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Pendaftaran Terbaru</CardTitle>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Semua Member <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_REGISTRATIONS.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Users size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.plan}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                  {user.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Admin Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Manajemen Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/courses">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-purple-600/30 hover:bg-purple-600/5 hover:text-purple-600 transition-all"
              >
                <BookOpen size={16} />
                Buat Kursus Baru
              </Button>
            </Link>
            <Link to="/admin/coaches">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-teal-600/30 hover:bg-teal-600/5 hover:text-teal-600 transition-all"
              >
                <GraduationCap size={16} />
                Tambah Coach Baru
              </Button>
            </Link>
            <Link to="/admin/finance">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-green-600/30 hover:bg-green-600/5 hover:text-green-600 transition-all"
              >
                <DollarSign size={16} />
                Laporan Keuangan
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-blue-600/30 hover:bg-blue-600/5 hover:text-blue-600 transition-all"
              >
                <Users size={16} />
                Verifikasi Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
