import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Statistik ringkasan untuk Coach Dashboard.
 * Berfokus pada operasional latihan, bukan keuangan.
 */
const COACH_STATS = [
  {
    label: "Member Dibimbing",
    value: "24",
    icon: Users,
    change: "+3 bulan ini",
    color: "text-teal-400",
    bgColor: "bg-teal-600/10",
  },
  {
    label: "Modul Aktif",
    value: "8",
    icon: BookOpen,
    change: "2 modul baru",
    color: "text-blue-400",
    bgColor: "bg-blue-600/10",
  },
  {
    label: "Sesi Hari Ini",
    value: "5",
    icon: CalendarDays,
    change: "2 sesi selesai",
    color: "text-amber-400",
    bgColor: "bg-amber-600/10",
  },
  {
    label: "Rata-rata Progres",
    value: "72%",
    icon: TrendingUp,
    change: "+4% minggu ini",
    color: "text-green-400",
    bgColor: "bg-green-600/10",
  },
];

/**
 * Mock data jadwal sesi latihan hari ini untuk Coach.
 */
const TODAY_SESSIONS = [
  { time: "07:00", member: "Budi Santoso", type: "Strength Training", done: true },
  { time: "09:30", member: "Siti Aminah", type: "Cardio & HIIT", done: true },
  { time: "13:00", member: "Andi Wijaya", type: "Yoga", done: false },
  { time: "15:30", member: "Rina Kusuma", type: "Functional Training", done: false },
  { time: "18:00", member: "Dimas Pratama", type: "Strength Training", done: false },
];

/**
 * CoachOverviewPage — Halaman utama Coach Dashboard.
 *
 * Menampilkan:
 * - Greeting untuk pelatih.
 * - 4 stat cards (jumlah member, modul, sesi, rata-rata progres).
 * - Jadwal sesi hari ini.
 * - Quick action buttons (upload materi, atur jadwal, lihat progres).
 *
 * Semua data saat ini mock — nanti di-fetch dari API.
 */
export default function CoachOverviewPage() {
  return (
    <div className="space-y-6">
      {/* ====== GREETING ====== */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Halo, <span className="text-teal-500">Coach</span> 💪
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Berikut ringkasan sesi pelatihan dan materi Anda hari ini.
        </p>
      </div>

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COACH_STATS.map((stat) => (
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
        {/* Jadwal Sesi Hari Ini */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Sesi Latihan Hari Ini</CardTitle>
            <Link to="/coach/schedule">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Lihat Semua <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {TODAY_SESSIONS.map((session, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-4 p-3 rounded-lg border transition-colors duration-200
                  ${session.done
                    ? "border-teal-600/20 bg-teal-600/5"
                    : "border-border/50 hover:border-border"
                  }
                `}
              >
                {session.done ? (
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
                ) : (
                  <Circle size={18} className="text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${session.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {session.member}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.type}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock size={12} />
                  {session.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/coach/materials">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-teal-600/30 hover:bg-teal-600/5 hover:text-teal-500 transition-all"
              >
                <BookOpen size={16} />
                Upload Materi Baru
              </Button>
            </Link>
            <Link to="/coach/schedule">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-blue-600/30 hover:bg-blue-600/5 hover:text-blue-500 transition-all"
              >
                <CalendarDays size={16} />
                Atur Jadwal Member
              </Button>
            </Link>
            <Link to="/coach/progress">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-green-600/30 hover:bg-green-600/5 hover:text-green-500 transition-all"
              >
                <TrendingUp size={16} />
                Lihat Progres Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
