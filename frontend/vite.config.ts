import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Port tetap: sebelumnya vite diam-diam pindah ke port lain kalau 5173 dipakai proyek lain,
    // sehingga dokumentasi menunjuk 5178 sementara server sebenarnya di tempat lain.
    port: 5178,
    strictPort: true,
    // Alamat tetap 127.0.0.1: tanpa ini vite hanya mendengarkan `::1` (localhost versi IPv6),
    // sehingga alamat 127.0.0.1:5178 menolak koneksi. Sengaja hanya loopback -- masuk otomatis
    // selama pengembangan (VITE_DEV_BYPASS_AUTH) tidak boleh terbuka untuk seisi wifi.
    host: "127.0.0.1",
  },
})
