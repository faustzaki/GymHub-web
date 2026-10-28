import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * LoginPage — satu-satunya pintu masuk. Member tidak mendaftar sendiri (PRD-001 K1):
 * akun admin dibuat lewat seeder, akun member dibuat admin dari /admin/members.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.ok) {
      setError(result.message ?? "Login gagal. Pastikan email dan kata sandi benar.");
      return;
    }

    // Satu pintu masuk, panel awal menyesuaikan peran (P1): owner -> /owner, petugas -> daftar anggota.
    navigate(result.role === "owner" ? "/owner" : result.role === "admin" ? "/admin/members" : "/dashboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk untuk mengelola member gym.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gymhub.local"
            className="h-11 rounded-md border-border bg-background"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Kata sandi
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="h-11 rounded-md border-border bg-background pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded bg-primary text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Memeriksa..." : "Masuk"}
          {!isLoading && <ArrowRight size={16} className="ml-2" />}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Belum punya akun? Pendaftaran member dilakukan di meja depan gym.
      </p>
    </div>
  );
}
