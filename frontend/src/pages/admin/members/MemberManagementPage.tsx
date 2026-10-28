import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMembers } from "@/hooks/useMembers";
import type { Member, MemberStatus } from "@/lib/services/members";
import { MemberList } from "./MemberList";
import { MemberForm } from "./MemberForm";
import { MemberDetail } from "./MemberDetail";
import { STATUS_OPTIONS } from "./status";

/**
 * MemberManagementPage — satu-satunya layar manajemen member (PRD-001).
 *
 * Data dari API; satu hook membagikan daftar ke tabel dan ringkasan. Panel & form
 * memakai `onChanged` / `onCreated` supaya baris langsung terbarui tanpa muat ulang.
 */
export function MemberManagementPage() {
  // Filter awal dibaca dari alamat halaman (mis. dari kartu ringkasan: ?status=akan_berakhir)
  // dan diserahkan ke useMembers sejak awal. Sebelumnya filter ini diset setelah halaman
  // terbuka, dan itu membuat layar berhenti di keadaan "memuat" karena dua permintaan bertabrakan.
  const [params] = useSearchParams();
  const statusParam = params.get("status") as MemberStatus | null;
  const qParam = params.get("q") ?? "";
  const statusAwal =
    statusParam && STATUS_OPTIONS.some((o) => o.value === statusParam) ? statusParam : "";

  const state = useMembers({ q: qParam, status: statusAwal });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  const handleChanged = (member: Member) => {
    state.replaceMember(member);
    state.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Anggota Gym</h1>
        <p className="text-sm text-muted-foreground">
          Daftarkan member baru, cari yang sudah ada, dan perpanjang masa aktifnya.
        </p>
      </div>

      <MemberList state={state} onAdd={() => setIsFormOpen(true)} onOpen={(m) => setOpenId(m.id)} />

      <MemberForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCreated={handleChanged}
        onOpenExisting={(id) => setOpenId(id)}
      />

      <MemberDetail memberId={openId} onClose={() => setOpenId(null)} onChanged={handleChanged} />
    </div>
  );
}
