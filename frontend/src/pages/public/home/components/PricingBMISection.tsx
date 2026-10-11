import { useRef, useEffect, useCallback } from "react";
import { Check, Activity, ArrowRight, Plus, Minus } from "lucide-react";
import { useBMICalculator } from "@/hooks/useBMICalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- DATA PAKET MEMBERSHIP ---
const pricingPlans = [
  {
    id: "basic",
    name: "Basic Access",
    price: "Rp 350.000",
    period: "/ bulan",
    description: "Akses fasilitas gym secara mandiri untuk mempertahankan gaya hidup sehat.",
    features: [
      "Akses Gym 24/7",
      "Loker Reguler",
      "Kamar Mandi & Sauna",
      "Akses Aplikasi Basic",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro Tracker",
    price: "Rp 550.000",
    period: "/ bulan",
    description: "Paket lengkap dengan pelacakan progress digital dan rekomendasi latihan harian.",
    features: [
      "Semua fitur Basic",
      "Aplikasi Premium (To-Do List Latihan)",
      "Laporan Progress Bulanan",
      "1x Sesi Cek BMI & Konsultasi / bln",
      "Asisten AI Tracker",
    ],
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite Coaching",
    price: "Rp 1.250.000",
    period: "/ bulan",
    description: "Fokus pada hasil maksimal dengan Personal Trainer yang mendedikasikan waktu untukmu.",
    features: [
      "Semua fitur Pro",
      "8x Sesi Personal Trainer / bln",
      "Program Latihan Khusus Digital",
      "Nutrisi & Pola Makan",
      "Handuk & Loker VVIP",
    ],
    highlight: false,
  },
];

// --- INTERFACE UNTUK PARTIKEL ---
interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface CustomNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

function CustomNumberInput({ value, onChange, placeholder, min, max, className = "" }: CustomNumberInputProps) {
  const handleIncrement = () => {
    const current = value === "" ? (min !== undefined ? min : 0) : Number(value);
    const next = current + 1;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  };

  const handleDecrement = () => {
    const current = value === "" ? (min !== undefined ? min : 0) : Number(value);
    const next = current - 1;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-red-600 pr-[84px]"
        required
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-600 text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Kurangi"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleIncrement}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-600 text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Tambah"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Hook untuk mengelola background partikel interaktif.
 * 
 * Cara kerja:
 * - Membuat partikel kecil yang melayang halus di background
 * - Partikel bereaksi terhadap posisi mouse (menjauh sedikit saat didekati)
 * - Menggambar garis koneksi antar partikel yang berdekatan (mesh effect)
 * - Menggunakan Canvas API langsung (tanpa library) agar ringan
 * - Warna: merah (aksen) dengan opacity rendah supaya tidak ganggu konten
 */
function useParticleBackground(particleCount = 50) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 0.5,
        // Kecepatan random untuk floating animation
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    particlesRef.current = particles;
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup ukuran canvas sesuai section
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking relatif terhadap section
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop: update posisi & gambar partikel setiap frame
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const interactionRadius = 150; // Radius interaksi mouse
      const connectionDistance = 120; // Jarak max koneksi antar partikel

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Floating: partikel bergerak perlahan
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce di tepi canvas
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Interaksi mouse: partikel "didorong" menjauhi cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRadius) {
          const force = (interactionRadius - dist) / interactionRadius;
          p.x -= dx * force * 0.02;
          p.y -= dy * force * 0.02;
        }

        // Gambar partikel (lingkaran kecil berwarna merah)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 38, 38, ${p.opacity})`;
        ctx.fill();

        // Gambar garis koneksi ke partikel lain yang berdekatan (mesh effect)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Opacity garis berkurang seiring jarak → transisi halus
            const lineOpacity = (1 - cdist / connectionDistance) * 0.08;
            ctx.strokeStyle = `rgba(220, 38, 38, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup: hentikan animasi & hapus listener saat unmount
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initParticles]);

  return canvasRef;
}

export default function PricingBMISection() {
  const {
    weight,
    height,
    result,
    setWeight,
    setHeight,
    calculate,
    isValid,
  } = useBMICalculator();

  // Inisialisasi canvas partikel untuk background interaktif
  const canvasRef = useParticleBackground(60);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };

  return (
    <section className="relative w-full py-24 bg-black text-white overflow-hidden" id="pricing">
      {/* Interactive Particle Background Canvas
          - Canvas di-stretch full section via absolute positioning
          - pointer-events-auto agar mouse tracking bekerja untuk partikel
          - z-0 agar berada di belakang konten (z-10) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-0"
        aria-hidden="true"
      />

      {/* ─── SEAMLESS TRANSITION GRADIENT (Sisi Penerima) ────────────────────────
          Overlay di bagian ATAS section ini yang berpadu dengan gradient
          dari section ClassesTrainers di atas.

          Cara kerja:
          - Gradasi dari hitam solid (atas) → merah sangat samar (tengah) →
            transparan (bawah), sehingga "menyambut" gradasi merah dari section atas.
          - z-[1] agar berada di atas canvas partikel tapi tetap di bawah konten (z-10).
          - Ini TIDAK mengganggu efek partikel karena partikel bergerak di z-0.
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-40 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, black 0%, rgba(220,38,38,0.04) 50%, transparent 100%)",
        }}
      />

      {/* Background decorations (radial glow blur) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10 uppercase tracking-widest px-4 py-1">
            Mulai Perjalananmu
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            TENTUKAN <span className="text-red-600">TARGETMU.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl text-lg">
            Sebelum memilih paket, mari ketahui kondisi ideal tubuhmu saat ini.
          </p>
        </div>

        {/* BMI CALCULATOR WIDGET */}
        <Card className="max-w-2xl mx-auto bg-white/[0.02] border-white/10 shadow-2xl backdrop-blur-md mb-16">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Cek Body Mass Index (BMI)</CardTitle>
            <CardDescription className="text-gray-400">
              Masukkan dan tinggi badanmu. Kami akan merekomendasikan paket yang tepat!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Tinggi Badan (cm)</label>
                  <CustomNumberInput 
                    placeholder="Contoh: 170"
                    value={height}
                    onChange={setHeight}
                    min={100}
                    max={250}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Berat Badan (kg)</label>
                  <CustomNumberInput 
                    placeholder="Contoh: 65"
                    value={weight}
                    onChange={setWeight}
                    min={20}
                    max={300}
                    className="mt-2"
                  />
                </div>
              </div>
              {/* Button disabled secara default (!isValid).
                  isValid menjadi true hanya ketika KEDUA input terisi 
                  dengan nilai valid (berat 20-300kg, tinggi 100-250cm).
                  Style disabled: opacity rendah + cursor not-allowed */}
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                disabled={!isValid}
              >
                Hitung Sekarang
              </Button>
            </form>

            {/* BMI RESULT */}
            {result && (
              <div className="mt-8 p-6 rounded-xl bg-black/40 border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm uppercase tracking-wide">Skor BMI Kamu</p>
                  <div className="text-4xl font-extrabold text-white">
                    {result.value}
                  </div>
                  <Badge className={`mt-2 ${
                    result.category === 'normal' ? 'bg-green-500/20 text-green-400' :
                    result.category === 'underweight' ? 'bg-yellow-500/20 text-yellow-400' :
                    result.category === 'overweight' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {result.label}
                  </Badge>
                  <p className="text-gray-300 mt-4 max-w-sm mx-auto text-sm leading-relaxed">
                    {result.description}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRICING PLANS */}
        {result && ( // Tampilkan harga setelah BMI dihitung, sebagai strategi konversi
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white">
                Rekomendasi Paket Untukmu
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => {
                const isRecommended = result.recommendedPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative bg-[#0A0A0A] border-white/5 flex flex-col transition-all duration-300 ${
                      isRecommended 
                      ? "border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.15)] md:-translate-y-4" 
                      : "hover:border-white/20"
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-600/20">
                          Paling Cocok
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 border-b border-white/5 space-y-4">
                      <CardTitle className="text-xl font-medium text-white">{plan.name}</CardTitle>
                      <div className="flex flex-wrap justify-center items-baseline gap-1">
                        <span className="text-3xl lg:text-4xl font-extrabold text-white whitespace-nowrap">{plan.price}</span>
                        <span className="text-sm lg:text-base text-gray-400 whitespace-nowrap">{plan.period}</span>
                      </div>
                      <CardDescription className="text-gray-400">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pt-6 pb-8">
                      <ul className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-600/10 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-red-500" />
                            </span>
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className={`w-full group ${
                          isRecommended 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "bg-white/5 hover:bg-white/10 text-white"
                        }`}
                      >
                        Pilih Paket
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
