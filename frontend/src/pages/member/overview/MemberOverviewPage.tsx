import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  CalendarDays,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Data statistik ringkasan untuk dashboard member.
 * Saat ini menggunakan mock data — nanti di-fetch dari API.
 */
const STATS = [
  {
    label: "Sesi Latihan Bulan Ini",
    value: "12",
    icon: Dumbbell,
    change: "+3 dari bulan lalu",
    color: "text-red-500",
    bgColor: "bg-red-600/10",
  },
  {
    label: "Jadwal Mendatang",
    value: "4",
    icon: CalendarDays,
    change: "Minggu ini",
    color: "text-blue-500",
    bgColor: "bg-blue-600/10",
  },
  {
    label: "Progres Target",
    value: "68%",
    icon: TrendingUp,
    change: "+5% minggu ini",
    color: "text-green-500",
    bgColor: "bg-green-600/10",
  },
  {
    label: "Durasi Total",
    value: "18 Jam",
    icon: Clock,
    change: "Bulan ini",
    color: "text-amber-500",
    bgColor: "bg-amber-600/10",
  },
];

/**
 * Mock data jadwal latihan hari ini.
 */
const TODAY_SCHEDULE = [
  { time: "07:00", title: "Morning Cardio", trainer: "Coach Rina", done: true },
  { time: "10:00", title: "Strength Training", trainer: "Coach Budi", done: false },
  { time: "16:00", title: "Yoga & Flexibility", trainer: "Coach Maya", done: false },
];

import { useAuthStore } from "@/store/useAuthStore";

/**
 * OverviewPage — Halaman utama Member Dashboard.
 */
export default function OverviewPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* ====== GREETING ====== */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat Pagi, <span className="text-red-600">{user?.name || "Member"}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Siap untuk sesi latihan hari ini? Berikut ringkasan aktivitas Anda.
        </p>
      </div>

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
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
        {/* Jadwal Hari Ini */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Jadwal Hari Ini</CardTitle>
            <Link to="/dashboard/schedule">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Lihat Semua <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {TODAY_SCHEDULE.map((item, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-4 p-3 rounded-lg border transition-colors duration-200
                  ${item.done
                    ? "border-green-600/20 bg-green-600/5"
                    : "border-border/50 hover:border-border"
                  }
                `}
              >
                {item.done ? (
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.trainer}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {item.time}
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
            <Link to="/dashboard/progress">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-red-600/30 hover:bg-red-600/5 hover:text-red-600 transition-all"
              >
                <Dumbbell size={16} />
                Catat Latihan Baru
              </Button>
            </Link>
            <Link to="/dashboard/schedule">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-blue-600/30 hover:bg-blue-600/5 hover:text-blue-600 transition-all"
              >
                <CalendarDays size={16} />
                Lihat Jadwal
              </Button>
            </Link>
            <Link to="/dashboard/todos">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-green-600/30 hover:bg-green-600/5 hover:text-green-600 transition-all"
              >
                <CheckCircle2 size={16} />
                To-Do List
              </Button>
            </Link>
            <Link to="/dashboard/materials">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 text-sm border-border/50 hover:border-amber-600/30 hover:bg-amber-600/5 hover:text-amber-600 transition-all"
              >
                <TrendingUp size={16} />
                Materi Pelatihan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
