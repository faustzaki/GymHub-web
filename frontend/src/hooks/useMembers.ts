import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMembers, type Member, type MemberList, type MemberStatus } from "@/lib/services/members";

export const PER_PAGE = 15;

export interface MembersState {
  items: Member[];
  meta: MemberList["meta"] | null;
  search: string;
  setSearch: (value: string) => void;
  status: MemberStatus | "";
  setStatus: (value: MemberStatus | "") => void;
  page: number;
  setPage: (value: number) => void;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  replaceMember: (member: Member) => void;
  isEmpty: boolean;
  isFiltered: boolean;
}

interface Query {
  q: string;
  status: MemberStatus | "";
  page: number;
}

/**
 * useMembers — satu sumber data daftar member untuk seluruh layar admin.
 *
 * Cari & filter dikirim ke server (PRD US-2: bukan menyaring satu halaman di browser).
 * Pemuatan dipicu dari setter (dan sekali saat halaman dibuka), bukan dari effect per
 * perubahan state; permintaan yang datang belakangan mengalahkan yang lebih lama.
 *
 * `initial` dipakai untuk filter awal dari alamat halaman (mis. /admin/members?status=…).
 * Filter awal HARUS masuk lewat sini, bukan diset setelah halaman terbuka: kalau diset belakangan,
 * dua permintaan berjalan bersamaan dan layar bisa berhenti di keadaan "memuat".
 */
export function useMembers(
  initial: { q?: string; status?: MemberStatus | "" } = {}
): MembersState {
  // Dibekukan di pemanggilan pertama: nilainya hanya dipakai sekali saat halaman dibuka.
  const awal = useRef(initial);
  const [search, setSearch] = useState(awal.current.q ?? "");
  const [status, setStatus] = useState<MemberStatus | "">(awal.current.status ?? "");
  const [page, setPage] = useState(1);

  const [list, setList] = useState<MemberList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nilai terakhir yang sudah dikirim, untuk dipakai setter yang hanya mengubah satu bagian.
  const query = useRef<Query>({
    q: awal.current.q ?? "",
    status: awal.current.status ?? "",
    page: 1,
  });
  const requestId = useRef(0);
  const searchTimer = useRef<number | undefined>(undefined);

  const load = useCallback((next: Query) => {
    query.current = next;
    const current = ++requestId.current;
    setIsLoading(true);
    setError(null);

    fetchMembers({ ...next, per_page: PER_PAGE })
      .then((data) => {
        if (current !== requestId.current) return;
        setList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (current !== requestId.current) return;
        setError(
          err.response?.data?.message ??
            "Daftar member gagal dimuat. Periksa koneksi ke server lalu coba lagi."
        );
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // setState terjadi di callback `.then`, bukan sinkron di badan effect; aturan ini
    // tidak bisa membedakannya.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(query.current);
    return () => window.clearTimeout(searchTimer.current);
  }, [load]);

  const reload = useCallback(() => load(query.current), [load]);

  const changeSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
      // Ketikan cepat: tunggu 300 ms sebelum membebani server.
      window.clearTimeout(searchTimer.current);
      searchTimer.current = window.setTimeout(() => {
        load({ ...query.current, q: value, page: 1 });
      }, 300);
    },
    [load]
  );

  const changeStatus = useCallback(
    (value: MemberStatus | "") => {
      setStatus(value);
      setPage(1);
      load({ ...query.current, status: value, page: 1 });
    },
    [load]
  );

  const changePage = useCallback(
    (value: number) => {
      setPage(value);
      load({ ...query.current, page: value });
    },
    [load]
  );

  /** Sisipkan member yang baru dibuat/perpanjang tanpa menunggu muat ulang. */
  const replaceMember = useCallback((member: Member) => {
    setList((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => (item.id === member.id ? member : item)),
          }
        : current
    );
  }, []);

  return {
    items: list?.items ?? [],
    meta: list?.meta ?? null,
    search,
    setSearch: changeSearch,
    status,
    setStatus: changeStatus,
    page,
    setPage: changePage,
    isLoading,
    error,
    reload,
    replaceMember,
    isEmpty: !isLoading && !error && (list?.items.length ?? 0) === 0,
    isFiltered: search.trim() !== "" || status !== "",
  };
}
