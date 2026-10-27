import { useState, useEffect } from 'react';

// Type definitions - nantinya bisa dipisah ke file types terpisah bila aplikasi sudah besar
export interface Trainer {
  id: number;
  name: string;
  specialty: string;
  avatar_url: string;
}

// dummy — nama & foto latar hitam dari /assets; sumber resmi adalah store coach.
// Hapus hook ini setelah GET /api/trainers siap.
const DUMMY_TRAINERS: Trainer[] = [
  {
    id: 1,
    name: "RANGGA PRATAMA",
    specialty: "KEKUATAN & TEKNIK ANGKAT",
    avatar_url: "/assets/pt-1.jpg"
  },
  {
    id: 2,
    name: "NADIA KUSUMA",
    specialty: "YOGA & MOBILITAS",
    avatar_url: "/assets/pt-2.jpg"
  },
  {
    id: 3,
    name: "DAMAR WIJAYA",
    specialty: "MUAYTHAI & KONDISI",
    avatar_url: "/assets/pt-3.jpg"
  }
];

export const useTrainers = () => {
  const [trainers] = useState<Trainer[]>(DUMMY_TRAINERS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // TODO: ganti DUMMY_TRAINERS dengan GET /api/trainers setelah endpoint siap

  // Interval carousel logic
  useEffect(() => {
    if (trainers.length <= 1) return;

    const intervalId = setInterval(() => {
      // Loop ke index selanjutnya secara berputar (cycle)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trainers.length);
    }, 5000); // interval setiap 5 detik

    // Cleanup function untuk memberhentikan loop jika komponen unmount
    return () => clearInterval(intervalId);
  }, [trainers]);

  return {
    currentTrainer: trainers[currentIndex],
    trainers,
    currentIndex,
  };
};
