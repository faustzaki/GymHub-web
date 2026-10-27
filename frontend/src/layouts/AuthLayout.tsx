import { Outlet, Link } from "react-router-dom";
import logoImg from "@/assets/Gemini_Generated_Image_kmomnfkmomnfkmom-removebg-preview.png";

export default function AuthLayout() {
  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      {/* Panel Kiri: Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src={logoImg}
              alt="GymHub"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Gym<span className="text-primary">Hub</span>
            </span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-title font-extrabold uppercase leading-tight text-foreground">
              Mulai Perjalanan
              <br />
              <span className="text-primary">Latihanmu</span>
            </h1>
            <p className="text-sm max-w-md leading-relaxed text-muted-foreground">
              Akses jadwal latihan, pantau progres, dan raih target kebugaranmu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="w-2 h-2 rounded-full bg-muted" />
            <span className="w-2 h-2 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Panel Kanan: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src={logoImg} alt="GymHub" className="h-16 w-auto object-contain" />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Gym<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
