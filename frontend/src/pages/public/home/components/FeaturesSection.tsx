import { Dumbbell, CalendarCheck, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import logoImg from "@/assets/Gemini_Generated_Image_kmomnfkmomnfkmom-removebg-preview.png";

export default function FeaturesSection() {
  return (
    <section id="about" className="relative w-full py-24 lg:py-32 bg-gradient-to-b from-black to-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 lg:mb-24">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/5 text-red-500 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            Mengapa Memilih Kami
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight max-w-3xl leading-[1.1] mt-8">
            YOUR DIGITAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
              FITNESS PARTNER.
            </span>
          </h2>
          
          {/* Logo in the middle */}
          <div className="relative flex items-center justify-center my-6 group">
             <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full transition-all duration-700 group-hover:scale-150 group-hover:bg-red-600/30" />
             <img 
               src={logoImg} 
               alt="GymHub Logo" 
               className="relative h-20 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-transform duration-700 group-hover:scale-110" 
             />
          </div>

          <p className="text-gray-400 text-lg font-light max-w-2xl leading-relaxed mt-4">
            Lebih dari sekadar tempat latihan biasa. Kami menggabungkan fasilitas kebugaran premium dengan pelacakan data harian secara digital.
          </p>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1 */}
          <Card className="bg-white/[0.02] border-white/5 hover:border-red-600/50 hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:text-red-500 group-hover:border-red-500/30 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-500">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-white group-hover:text-red-50 transition-colors">
                  Elite Equipment
                </CardTitle>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  Atmosfer premium dengan mesin berstandar internasional yang menjamin efektivitas serta keamanan postur Anda.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white/[0.02] border-white/5 hover:border-red-600/50 hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:text-red-500 group-hover:border-red-500/30 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-500">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-white group-hover:text-red-50 transition-colors">
                  Automated To-Do
                </CardTitle>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  Tidak perlu kebingungan menyusun rutinitas. Sistem kami merilis panduan to-do list harian langsung dari para pelatih.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white/[0.02] border-white/5 hover:border-red-600/50 hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden relative shadow-2xl lg:col-span-1 md:col-span-2">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:text-red-500 group-hover:border-red-500/30 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-500">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-white group-hover:text-red-50 transition-colors">
                  Live Tracking
                </CardTitle>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  Pantau pertumbuhan otot, rutinitas beban repetisi, dan evaluasi pencapaian fitness level Anda secara akurat pada Dashboard.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

        </div>
      </div>
    </section>
  );
}
