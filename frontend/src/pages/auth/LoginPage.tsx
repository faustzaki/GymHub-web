import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * LoginPage — Halaman login member dan admin.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // --- MOCK CONNECTION TEMPORARY ---
      // const response = await api.post("/login", { email, password });
      // const { user, access_token } = response.data.data;
      
      const user = { id: 1, name: "Mock User", email: email || "mock@example.com", role: "admin" } as any;
      const access_token = "mock-token-123";

      setAuth(user, access_token);
      
      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "Login gagal. Pastikan email dan password benar."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk ke akun Anda untuk melanjutkan latihan
        </p>
      </div>

      {/* Galat: state-nya sudah ada sejak awal tapi belum pernah dirender */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <a
              href="#"
              className="text-xs text-primary-text hover:text-primary transition-colors"
            >
              Lupa password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Masuk
              <ArrowRight size={16} />
            </span>
          )}
        </Button>
      </form>

      {/* Google Login */}
      <Button
        variant="outline"
        className="w-full h-11 border-border text-foreground hover:bg-accent flex items-center justify-center gap-3 transition-all duration-200"
        onClick={() => console.log("Google Login clicked")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"/>
        </svg>
        Lanjutkan dengan Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            Belum punya akun?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link to="/register">
        <Button
          variant="outline"
          className="w-full h-11 border-border text-foreground hover:bg-accent transition-all duration-200"
        >
          Daftar Sekarang
        </Button>
      </Link>
    </div>
  );
}
