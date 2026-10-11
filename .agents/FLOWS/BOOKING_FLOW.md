# 📅 BOOKING_FLOW.md — Booking Process Flow

> **Purpose:** Dokumen ini mendefinisikan alur proses booking dari awal hingga selesai.

---

## 1. Booking Flow Diagram

[TODO: Sesuaikan flowchart dengan alur booking proyek Anda.]

```mermaid
flowchart TD
    START["👤 User"] --> BROWSE["Browse Available Slots"]
    BROWSE --> SELECT["Select Date/Time/Service"]
    SELECT --> CHECK{"Slot Available?"}
    CHECK -- No --> BROWSE
    CHECK -- Yes --> FILL["Fill Booking Form"]
    FILL --> CONFIRM["Review & Confirm"]
    CONFIRM --> PAY{"Payment Required?"}
    PAY -- Yes --> PAYMENT["Payment Process"]
    PAY -- No --> SUBMIT["Submit Booking"]
    PAYMENT --> PAY_STATUS{"Payment Success?"}
    PAY_STATUS -- No --> RETRY["Retry / Cancel"]
    PAY_STATUS -- Yes --> SUBMIT
    SUBMIT --> NOTIFY["📧 Send Notification"]
    NOTIFY --> DONE["✅ Booking Confirmed"]
```

---

## 2. Step-by-Step Process

| Step | Actor | Action | System Response | Status |
|---|---|---|---|---|
| 1 | User | Pilih layanan/jadwal | Tampilkan ketersediaan | — |
| 2 | User | Pilih slot tersedia | Validasi ketersediaan | — |
| 3 | User | Isi form booking | Validasi input | — |
| 4 | User | Konfirmasi booking | Buat record booking | `pending` |
| 5 | User | Lakukan pembayaran | Proses payment gateway | `processing` |
| 6 | System | Payment berhasil | Update status | `confirmed` |
| 7 | System | — | Kirim notifikasi | — |
| 8 | System | Hari-H tiba | Auto-update status | `completed` |

---

## 3. Cancellation Flow

[TODO: Sesuaikan dengan kebijakan cancellation proyek Anda.]

```mermaid
flowchart TD
    CANCEL["User Request Cancel"] --> CHECK{"Within Cancel Period?"}
    CHECK -- Yes --> REFUND{"Refund Applicable?"}
    CHECK -- No --> REJECT["❌ Cancel Denied"]
    REFUND -- Yes --> PROCESS["Process Refund"]
    REFUND -- No --> CANCEL_NO_REFUND["Cancel Without Refund"]
    PROCESS --> NOTIFY["📧 Notify User"]
    CANCEL_NO_REFUND --> NOTIFY
    NOTIFY --> DONE["✅ Booking Cancelled"]
```

---

## 4. Edge Cases

- **Double booking attempt:** Reject, tampilkan error
- **Payment timeout:** Set status `expired`, release slot
- **Admin cancel:** Notify user, process refund
- [TODO: tambahkan edge case lain]

---

## Related Documents

- [FEATURES/BOOKING.md](../FEATURES/BOOKING.md) — Booking feature spec
- [FEATURES/PAYMENT.md](../FEATURES/PAYMENT.md) — Payment feature spec
- [FLOWS/USER_FLOW.md](./USER_FLOW.md) — Overall user flow
