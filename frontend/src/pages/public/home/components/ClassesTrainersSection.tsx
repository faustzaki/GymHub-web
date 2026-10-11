import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, User, Dumbbell, ArrowRight, CheckCircle2 } from "lucide-react";

const IconInstagram = ({ size = 16, className = "" }: { size?: number | string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const CLASSES = [
  {
    id: 1,
    name: "HIIT Burn-out",
    intensity: "Advanced",
    time: "Senin & Rabu, 08:00 & 18:30",
    trainer: "Budi Santoso",
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop",
    description: "High-Intensity Interval Training yang dirancang untuk membakar kalori maksimal dalam waktu 45 menit. Cocok untuk member yang ingin meningkatkan stamina dan membakar lemak dengan cepat.",
    benefits: ["Membakar hingga 600 kalori", "Meningkatkan V02 Max", "Meningkatkan daya tahan tubuh"]
  },
  {
    id: 2,
    name: "Powerlifting Foundations",
    intensity: "All Levels",
    time: "Selasa & Kamis, 17:00",
    trainer: "Satria",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    description: "Pelajari teknik dasar hingga lanjutan untuk 3 gerakan utama: Squat, Bench Press, dan Deadlift. Fokus pada peningkatan kekuatan murni dan perbaikan postur tubuh.",
    benefits: ["Meningkatkan kekuatan maksimal", "Memperbaiki form teknik angkatan", "Membangun massa otot"]
  },
  {
    id: 3,
    name: "Vinyasa Flow Yoga",
    intensity: "Beginner",
    time: "Jumat Pagi, 06:30",
    trainer: "Ayu Kirana",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop",
    description: "Sesi yoga santai namun menguras keringat yang berfokus pada aliran gerakan yang diselaraskan dengan napas. Sangat bagus untuk kelenturan dan recovery.",
    benefits: ["Meningkatkan kelenturan", "Pikiran lebih rileks & fokus", "Recovery otot lebih cepat"]
  }
];

const TRAINERS = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Head Conditioning Coach",
    experience: "8+ Tahun",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1974&auto=format&fit=crop",
    bio: "Mantan atlet nasional, berspesialisasi dalam program fat-loss dan conditioning atletik profesional."
  },
  {
    id: 2,
    name: "Satria",
    role: "Strength & Powerlifting",
    experience: "10+ Tahun",
    image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?q=80&w=1974&auto=format&fit=crop",
    bio: "Fokus pada biomekanik angkatan berat. Telah melatih belasan powerlifter amatir ke tingkat nasional."
  },
  {
    id: 3,
    name: "Ayu Kirana",
    role: "Yoga & Flexibility",
    experience: "5+ Tahun",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop",
    bio: "Certified Yoga Instructor yang memadukan teknik mindfulness dengan fisioterapi pemulihan fisik bagi lifter."
  }
];

export function ClassesTrainersSection() {
  return (
    <section className="py-16 md:py-20 bg-black text-white relative">
      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans tracking-tight">
            Bangun Potensi Anda Dengan <span className="text-red-600">Terbaik</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
            Dari sesi kardio yang membakar lemak hingga program angkat beban yang memecahkan rekor pribadi. Telusuri jadwal kelas dan profile pelatih pro kami.
          </p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-neutral-900/50 border border-neutral-800/80 p-1 rounded-lg">
              <TabsTrigger value="classes" className="px-6 py-2.5 text-sm md:text-base rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Daftar Kelas
              </TabsTrigger>
              <TabsTrigger value="trainers" className="px-6 py-2.5 text-sm md:text-base rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Pelatih Kami
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="classes" className="animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CLASSES.map((cls) => (
                <Card key={cls.id} className="group flex flex-col overflow-hidden bg-neutral-900 border-neutral-800 rounded-2xl relative">
                  <div className="relative h-48 md:h-52 shrink-0 overflow-hidden bg-neutral-800">
                    <img
                      src={cls.image}
                      alt={`Foto Kelas ${cls.name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"; // Fallback URL
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className={`
                        bg-neutral-900/80 backdrop-blur-sm border-transparent px-2.5 py-0.5 text-xs font-medium
                        ${cls.intensity === 'Advanced' ? 'text-red-400' : ''}
                        ${cls.intensity === 'Beginner' ? 'text-green-400' : ''}
                        ${cls.intensity === 'All Levels' ? 'text-blue-400' : ''}
                      `}>
                        {cls.intensity}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-grow">
                    <div className="mb-3 w-full">
                      <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1">{cls.name}</h3>
                      <div className="flex items-center text-neutral-400 text-xs gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{cls.time}</span>
                      </div>
                    </div>
                    
                    <p className="text-neutral-400 text-sm mb-5 leading-relaxed line-clamp-2 flex-grow">
                      {cls.description}
                    </p>
                    
                    {/* Dialog Implementation here */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all text-sm h-10 mt-auto" variant="outline">
                          Lihat Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[92vw] max-w-md bg-neutral-900 border-neutral-800 text-white p-6 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-2xl">
                        <DialogHeader className="text-left space-y-1.5">
                          <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Dumbbell className="text-red-500 w-5 h-5" /> {cls.name}
                          </DialogTitle>
                          <DialogDescription className="text-neutral-400 text-sm">
                            Dipandu oleh Coach {cls.trainer}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="relative h-36 md:h-40 rounded-xl overflow-hidden my-4 bg-neutral-800 shrink-0">
                          <img 
                            src={cls.image} 
                            alt={`Detail Kelas ${cls.name}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"; // Fallback URL
                            }}
                          />
                        </div>

                        <div className="space-y-4">
                          <p className="text-neutral-300 text-sm leading-relaxed">
                            {cls.description}
                          </p>
                          
                          <div>
                            <h4 className="font-semibold text-white mb-2.5 text-sm">Apa yang Akan Anda Dapatkan:</h4>
                            <ul className="space-y-2">
                              {cls.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-neutral-400 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-neutral-950/50 p-3 rounded-lg flex items-center justify-between border border-neutral-800">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-300">
                              <Clock className="w-4 h-4 text-red-500" />
                              <span>{cls.time}</span>
                            </div>
                            <Badge variant="secondary" className="bg-neutral-800 text-white hover:bg-neutral-700 text-xs py-0.5">
                              {cls.intensity}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-sm font-semibold rounded-xl shadow-lg shadow-red-900/20">
                            Booking Kelas Ini
                          </Button>
                          <p className="text-center text-xs text-neutral-500 mt-3">
                            *Anda akan diarahkan ke halaman login untuk menyelesaikan pemesanan.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trainers" className="animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TRAINERS.map((trainer) => (
                <Card key={trainer.id} className="group flex flex-col bg-neutral-900 border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-colors">
                  <div className="relative h-[280px] md:h-[300px] shrink-0 overflow-hidden bg-neutral-800">
                    {/* Grayscale to Color hover effect */}
                    <img 
                      src={trainer.image} 
                      alt={trainer.name} 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-xl font-bold text-white tracking-tight mb-0.5">{trainer.name}</h3>
                      <p className="text-red-400 font-medium text-sm">{trainer.role}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 flex flex-col flex-grow relative">
                    {/* Subtle red glow at bottom for premium feel on hover */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600 shadow-[0_-5px_15px_rgba(220,38,38,0.3)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    
                    <p className="text-neutral-400 text-sm leading-relaxed mb-5 italic flex-grow">
                      "{trainer.bio}"
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-3">
                        <button className="text-neutral-500 hover:text-white transition-colors" aria-label={`Instagram ${trainer.name}`}>
                          <IconInstagram className="w-4 h-4" />
                        </button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-red-400 hover:bg-neutral-800 group/btn h-8 px-3 text-xs">
                        Lihat Profil 
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── SEAMLESS TRANSITION GRADIENT ───────────────────────────────────────
          Overlay ini berfungsi sebagai "jembatan" visual antara section ini
          dengan section Pricing & BMI di bawahnya.

          Cara kerja:
          - Layer 1 (radial): Kilatan merah samar di tengah-bawah, memberi kesan
            'energi' yang tersambung ke aksen merah di section berikutnya.
          - Layer 2 (linear): Gradasi vertikal dari transparan (atas) ke hitam
            (bawah), menutup garis keras antar section.
          - pointer-events-none: Overlay tidak menghalangi interaksi user sama sekali.
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(185,28,28,0.06) 40%, rgba(220,38,38,0.03) 70%, black 100%)",
        }}
      />
    </section>
  );
}
