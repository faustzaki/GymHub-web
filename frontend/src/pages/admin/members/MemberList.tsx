import { useMemo, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, type Member, type MemberStatus } from "@/lib/services/members";
import type { MembersState } from "@/hooks/useMembers";
import { STATUS_CLASS, STATUS_LABEL, STATUS_OPTIONS } from "./status";

interface Props {
  state: MembersState;
  onAdd: () => void;
  onOpen: (member: Member) => void;
}

/**
 * MemberList — daftar member dari API.
 *
 * Desktop: tabel. HP: kartu bertumpuk (tidak ada geser horizontal, PRD US-2).
 * Keadaan wajib: memuat (skeleton), kosong, kosong-karena-filter, gagal + coba lagi.
 */
export function MemberList({ state, onAdd, onOpen }: Props) {
  const [showAllPages, setShowAllPages] = useState(false);
  const {
    items,
    meta,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    isLoading,
    error,
    reload,
    isEmpty,
    isFiltered,
  } = state;

  const pageNumbers = useMemo(() => {
    if (!meta) return [];
    const total = meta.last_page;
    const start = Math.max(1, Math.min(page - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [meta, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nomor HP, atau kode"
              aria-label="Cari member"
              className="h-11 w-full rounded-md border-border pl-9 sm:w-72"
            />
          </div>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : (v as MemberStatus))}>
            <SelectTrigger className="h-11 w-full rounded-md border-border sm:w-56" aria-label="Saring status">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value || "all"} value={option.value || "all"}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onAdd}
          className="h-11 rounded bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} className="mr-2" />
          Tambah Member
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{error}</p>
          <Button variant="outline" onClick={reload} className="h-11 shrink-0 rounded border-border">
            <RefreshCw size={16} className="mr-2" />
            Coba lagi
          </Button>
        </div>
      )}

      {!error && isLoading && (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat daftar member">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      )}

      {!error && !isLoading && isEmpty && (
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="text-sm text-foreground">
            {isFiltered
              ? "Tidak ada member yang cocok dengan pencarian atau filter ini."
              : "Belum ada member terdaftar."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isFiltered
              ? "Coba potongan nama, nomor HP, atau kode lain."
              : "Tekan “Tambah Member” untuk mendaftarkan orang pertama."}
          </p>
        </div>
      )}

      {!error && !isLoading && items.length > 0 && (
        <>
          {/* Tabel: hanya desktop; HP memakai kartu di bawahnya. */}
          <div className="hidden rounded-md border border-border xl:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor HP</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Mulai</TableHead>
                  <TableHead>Berakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((member) => (
                  <TableRow
                    key={member.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Buka detail ${member.name}`}
                    onClick={() => onOpen(member)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpen(member);
                      }
                    }}
                    className="cursor-pointer hover:bg-accent/40 focus-visible:bg-accent/40"
                  >
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{member.member_code ?? "—"}</TableCell>
                    <TableCell>{formatDate(member.membership_started_at)}</TableCell>
                    <TableCell>{formatDate(member.membership_expires_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_CLASS[member.status]}>
                        {STATUS_LABEL[member.status]}
                      </Badge>
                    </TableCell>
                    {/* Perpanjang di baris membuka panel detail yang sama -- di sana tanggal
                        berakhir baru sudah tampil sebelum disimpan, jadi tidak ada perpanjangan
                        yang terjadi tanpa dilihat dulu. */}
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(member);
                        }}
                      >
                        Perpanjang
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Kartu: HP & tablet. */}
          <ul className="space-y-2 xl:hidden">
            {items.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => onOpen(member)}
                  className="w-full rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </div>
                    <Badge variant="outline" className={STATUS_CLASS[member.status]}>
                      {STATUS_LABEL[member.status]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{member.member_code ?? "—"}</span>
                    <span>
                      {formatDate(member.membership_started_at)} – {formatDate(member.membership_expires_at)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {meta && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Hal. {meta.current_page} dari {meta.last_page} · {meta.total} member
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="h-11 rounded border-border"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                {showAllPages
                  ? Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
                      <Button
                        key={n}
                        variant={n === page ? "default" : "outline"}
                        className="h-11 w-11 rounded"
                        aria-current={n === page ? "page" : undefined}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </Button>
                    ))
                  : pageNumbers.map((n) => (
                      <Button
                        key={n}
                        variant={n === page ? "default" : "outline"}
                        className="h-11 w-11 rounded"
                        aria-current={n === page ? "page" : undefined}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </Button>
                    ))}
                {!showAllPages && meta.last_page > 5 && (
                  <Button variant="ghost" className="h-11 rounded" onClick={() => setShowAllPages(true)}>
                    Semua halaman
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-11 rounded border-border"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
