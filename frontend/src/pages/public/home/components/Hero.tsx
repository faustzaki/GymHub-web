import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useTrainers } from '@/hooks/useTrainers';

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { currentTrainer } = useTrainers();

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    // Normalisasi posisi mouse dari -1 ke 1
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    // Reset posisi saat cursor keluar dari area
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image Unsplash Gym */}
      <img
        src="https://images.unsplash.com/photo-1543300722-222718fd8509?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Gym Background"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px) scale(1.05)`,
        }}
        loading="lazy"
      />
      
      {/* Dark Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 pointer-events-none" />

      {/* Main Content Container */}
      <div 
        className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-end pb-24 md:pb-32 transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)`,
        }}
      >
        {/* Left Side Content */}
        <div className="flex flex-col items-start w-full md:max-w-3xl">
          <h1 className="text-white font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.1] uppercase tracking-tight mb-6">
            DEFEAT YOUR LIMITS.<br />
            <span className="italic font-light text-gray-300">REDEFINE YOURSELF.</span>
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl font-light mb-10 max-w-lg leading-relaxed">
            Transform your body with world-class equipment and professional trainers. 
            Join our elite facility and start your fitness journey today.
          </p>

          <Button 
            asChild
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-widest px-8 py-7 text-sm transition-all duration-300 hover:scale-105"
          >
            <a href="#pricing">
              START YOUR JOURNEY
              <ArrowRight className="ml-3 w-5 h-5" />
            </a>
          </Button>
        </div>

        {/* Right Corner Banner - Program & Trainer */}
        <div 
          className="mt-8 md:mt-0 md:absolute md:bottom-10 md:right-8 flex items-center border border-white/10 bg-black/60 backdrop-blur-md p-3 md:p-4 md:pr-5 rounded-2xl transition-transform duration-700 ease-out will-change-transform w-fit self-start md:self-auto shadow-2xl"
          style={{
            transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          }}
        >
           {/* Wrapping data dinamis agar terjadi rerender dan animasi transisi (fade in) setiap ganti trainer */}
           <div key={currentTrainer.id} className="flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-right-4 duration-500 ease-out fill-mode-both">
             <div className="text-left md:text-right">
                <p className="text-white text-[10px] md:text-xs uppercase font-extrabold tracking-widest mb-0.5 md:mb-1">
                  {currentTrainer.specialty}
                </p>
                <p className="text-gray-400 text-[9px] md:text-[10px] uppercase font-medium tracking-widest text-[#e8e4e4]">
                  {currentTrainer.name}
                </p>
             </div>
             
             <div className="flex items-center gap-3 md:gap-4 border-l border-white/10 pl-3 md:pl-5">
               <Avatar className="w-10 h-10 md:w-14 md:h-14 border-2 border-red-600 ring-2 ring-black">
                 <AvatarImage src={currentTrainer.avatar_url} alt={currentTrainer.name} />
                 <AvatarFallback className="bg-red-900 text-white text-xs md:text-base">
                   {currentTrainer.name.split(' ').map(n => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
               
               <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-10 h-10 md:w-12 md:h-12 border-white/20 bg-white/5 hover:bg-red-600 hover:text-white hover:border-red-600 text-white transition-all flex-shrink-0"
               >
                 <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
               </Button>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
