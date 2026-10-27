import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="dark min-h-screen flex flex-col items-center justify-center bg-background px-6 text-foreground">
      <p className="text-label font-bold uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-3 text-title font-extrabold uppercase tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-4 max-w-md text-center text-lead font-light text-muted-foreground">
        Alamat yang kamu tuju tidak ada atau sudah dipindahkan.
      </p>
      <Button
        asChild
        className="group mt-8 h-12 rounded bg-primary px-7 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
      >
        <a href="/">
          Kembali ke Beranda
          <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}
