// ============================================================
// Coach Service — API-Ready Service Layer
// ============================================================
//
// Semua fungsi di file ini membungkus operasi CRUD dengan
// Promise + setTimeout untuk mensimulasikan network latency.
//
// Ketika backend sudah siap, tinggal ganti body setiap fungsi
// dengan panggilan axios (misalnya axios.get, axios.post, dll)
// TANPA mengubah interface/signature fungsi.
// ============================================================

import { DUMMY_COACHES, type Coach } from '@/lib/mock/dummy-coaches';

/** In-memory store untuk simulasi — replace dengan API call nanti */
let coachesData: Coach[] = [...DUMMY_COACHES];

/** Simulasi delay jaringan */
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mengambil semua data coach.
 * @returns Promise<Coach[]>
 */
export async function fetchCoaches(): Promise<Coach[]> {
  await simulateDelay(800);
  return [...coachesData];
}

/**
 * Mengambil detail satu coach berdasarkan ID.
 * @param id - Coach ID
 * @returns Promise<Coach | null>
 */
export async function fetchCoachById(id: string): Promise<Coach | null> {
  await simulateDelay(500);
  return coachesData.find((c) => c.id === id) ?? null;
}

/** Payload untuk create coach (tanpa id, created_at, password_masked) */
export type CreateCoachPayload = Omit<Coach, 'id' | 'created_at' | 'password_masked'> & {
  password: string;
};

/**
 * Membuat coach baru.
 * @param data - Data coach baru
 * @returns Promise<Coach>
 */
export async function createCoach(data: CreateCoachPayload): Promise<Coach> {
  await simulateDelay(1000);

  const newCoach: Coach = {
    ...data,
    id: `COACH-${String(coachesData.length + 1).padStart(3, '0')}-${Date.now()}`,
    password_masked: '********',
    created_at: new Date().toISOString(),
  };

  coachesData = [newCoach, ...coachesData];
  return newCoach;
}

/** Payload untuk update coach (partial, tanpa id) */
export type UpdateCoachPayload = Partial<Omit<Coach, 'id' | 'created_at' | 'password_masked'>> & {
  password?: string;
};

/**
 * Mengupdate data coach.
 * @param id - Coach ID
 * @param data - Data yang akan diupdate
 * @returns Promise<Coach>
 */
export async function updateCoach(id: string, data: UpdateCoachPayload): Promise<Coach> {
  await simulateDelay(1000);

  const index = coachesData.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Coach dengan ID ${id} tidak ditemukan.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...updateData } = data;
  const updatedCoach: Coach = { ...coachesData[index], ...updateData };
  coachesData[index] = updatedCoach;

  return updatedCoach;
}

/**
 * Menonaktifkan coach (ubah status menjadi Nonaktif).
 * @param id - Coach ID
 * @returns Promise<Coach>
 */
export async function deactivateCoach(id: string): Promise<Coach> {
  await simulateDelay(600);

  const index = coachesData.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Coach dengan ID ${id} tidak ditemukan.`);
  }

  coachesData[index] = { ...coachesData[index], status: 'Nonaktif' };
  return coachesData[index];
}

/**
 * Mengaktifkan kembali coach.
 * @param id - Coach ID
 * @returns Promise<Coach>
 */
export async function activateCoach(id: string): Promise<Coach> {
  await simulateDelay(600);

  const index = coachesData.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Coach dengan ID ${id} tidak ditemukan.`);
  }

  coachesData[index] = { ...coachesData[index], status: 'Aktif' };
  return coachesData[index];
}
