// ============================================================
// Custom Hook — useCoachManagement
// ============================================================
//
// Menggabungkan logic bisnis (filter, search, pagination) dengan
// service layer dan Zustand store. Semua operasi async menampilkan
// toast feedback untuk UX yang baik.
//
// Re-uses: useDebounce hook yang sudah ada.
// ============================================================

import { useMemo, useEffect, useCallback } from 'react';
import { useCoachManagementStore } from '@/store/useCoachManagementStore';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';
import * as coachService from '@/lib/services/coachService';
import type { Coach } from '@/lib/mock/dummy-coaches';

export function useCoachManagement() {
  const store = useCoachManagementStore();
  const debouncedSearch = useDebounce(store.searchQuery, 300);

  // ─────────────── Load Data (saat mount) ───────────────
  const loadCoaches = useCallback(async () => {
    store.setIsLoading(true);
    try {
      const data = await coachService.fetchCoaches();
      store.setCoaches(data);
    } catch {
      toast.error('Gagal memuat data coach.');
    } finally {
      store.setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────── Filter Logic ───────────────
  const filteredCoaches = useMemo(() => {
    let result = store.coaches;

    // Search (nama / email)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.nama.toLowerCase().includes(lowerSearch) ||
          c.email.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter Status
    if (store.filterStatus !== 'Semua') {
      result = result.filter((c) => c.status === store.filterStatus);
    }

    // Filter Spesialisasi
    // dipindah ke const: narrowing "bukan Semua" tidak bertahan di dalam callback filter
    const specializationFilter = store.filterSpecialization;
    if (specializationFilter !== 'Semua') {
      result = result.filter((c) => c.spesialisasi.includes(specializationFilter));
    }

    // Filter Gender
    if (store.filterGender !== 'Semua') {
      result = result.filter((c) => c.jenis_kelamin === store.filterGender);
    }

    return result;
  }, [
    store.coaches,
    debouncedSearch,
    store.filterStatus,
    store.filterSpecialization,
    store.filterGender,
  ]);

  // ─────────────── Pagination Logic ───────────────
  const totalItems = filteredCoaches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / store.itemsPerPage));

  const paginatedCoaches = useMemo(() => {
    const startIdx = (store.currentPage - 1) * store.itemsPerPage;
    return filteredCoaches.slice(startIdx, startIdx + store.itemsPerPage);
  }, [filteredCoaches, store.currentPage, store.itemsPerPage]);

  // Auto-reset page kalau melebihi total pages setelah filter berubah
  useEffect(() => {
    if (store.currentPage > totalPages) {
      store.setCurrentPage(totalPages);
    }
  }, [totalPages, store.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────── Action Handlers ───────────────

  /** Buka modal detail coach */
  const handleViewDetail = (coach: Coach) => {
    store.setSelectedCoach(coach);
    store.setIsDetailOpen(true);
  };

  /** Buka alert nonaktifkan coach */
  const handleDeactivateClick = (coach: Coach) => {
    store.setSelectedCoach(coach);
    store.setIsDeactivateOpen(true);
  };

  /** Konfirmasi nonaktifkan coach (async) */
  const confirmDeactivate = async () => {
    if (!store.selectedCoach) return;

    store.setIsLoading(true);
    try {
      await coachService.deactivateCoach(store.selectedCoach.id);
      store.deactivateCoachInStore(store.selectedCoach.id);
      toast.success(`Coach ${store.selectedCoach.nama} berhasil dinonaktifkan.`);
    } catch {
      toast.error('Gagal menonaktifkan coach. Silakan coba lagi.');
    } finally {
      store.setIsLoading(false);
      store.setIsDeactivateOpen(false);
      store.setSelectedCoach(null);
    }
  };

  return {
    // State
    ...store,
    debouncedSearch,

    // Computed
    filteredCoaches,
    paginatedCoaches,
    totalItems,
    totalPages,

    // Loaders
    loadCoaches,

    // Handlers
    handleViewDetail,
    handleDeactivateClick,
    confirmDeactivate,
  };
}
