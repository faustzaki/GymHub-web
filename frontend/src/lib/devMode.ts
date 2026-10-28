/**
 * [DEV-SAJA] Satu tempat untuk seluruh perilaku "enak dipakai waktu ngoding".
 *
 * Kenapa disatukan: dulu aturan ini ditulis dua kali di berkas berbeda, dan hanya penjaga halaman
 * yang membaca `VITE_DEV_BYPASS_AUTH`. Masuk otomatisnya tidak -- jadi walaupun penjaganya
 * dipaksa hidup, sesi dev tetap dibuat sendiri, halaman selalu lolos, dan penjaganya mustahil
 * diuji. Sekarang satu saklar mengatur keduanya.
 *
 * Seluruh isi berkas ini mati sendiri di build produksi: `import.meta.env.DEV` bernilai false
 * saat `vite build`, jadi `DEV_BYPASS_AUTH` pasti false.
 */

/** Build pengembangan? (`vite dev` ya, `vite build` tidak). */
export const DEV_MODE = import.meta.env.DEV;

/**
 * Lewati halaman masuk + masuk otomatis. Matikan dengan `VITE_DEV_BYPASS_AUTH=0`
 * untuk menguji penjaga halaman masuk sebagaimana di server.
 */
export const DEV_BYPASS_AUTH = DEV_MODE && import.meta.env.VITE_DEV_BYPASS_AUTH !== "0";

/** Akun untuk masuk otomatis, dari `frontend/.env.local` (berkas itu diabaikan git). */
export const DEV_EMAIL = import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined;
export const DEV_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined;
