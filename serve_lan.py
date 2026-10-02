#!/usr/bin/env python3
"""
================================================================================
NKE BIM DASHBOARD — Server Jaringan Lokal (LAN) & Standalone Server
PT Nusa Konstruksi Enjiniring Tbk
================================================================================
Menyajikan dashboard BIM secara instan di jaringan lokal (kabel LAN / Wi-Fi)
tanpa memerlukan konfigurasi rumit. Menggunakan pustaka standar Python.
"""

import http.server
import socketserver
import os
import sys
import socket
import json

PORT = 3000

def get_lan_ip():
    """Mendeteksi IP LAN komputer ini secara otomatis."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Menghubungkan ke alamat broadcast/dummy untuk mengetahui route default
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = "127.0.0.1"
    finally:
        s.close()
    return ip

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """
    HTTP Request Handler dengan dukungan Single Page Application (SPA).
    Jika file tidak ditemukan, fallback ke index.html untuk routing React.
    """
    def __init__(self, *args, **kwargs):
        # Cek apakah folder 'dist' tersedia (hasil npm run build)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        dist_dir = os.path.join(base_dir, "dist")
        if os.path.isdir(dist_dir) and os.path.exists(os.path.join(dist_dir, "index.html")):
            self.directory = dist_dir
        else:
            self.directory = base_dir
        super().__init__(*args, directory=self.directory, **kwargs)

    def end_headers(self):
        # Header CORS agar dapat diakses fleksibel dari perangkat lain di LAN
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API Health Check Endpoint
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = json.dumps({
                "status": "online",
                "app": "NKE BIM Dashboard",
                "lan_ip": get_lan_ip(),
                "port": PORT
            })
            self.wfile.write(resp.encode("utf-8"))
            return

        # Cari path file statis
        clean_path = self.path.split('?')[0].split('#')[0]
        local_file = os.path.join(self.directory, clean_path.lstrip('/'))

        # Jika path menuju file nyata, layani secara langsung
        if os.path.isfile(local_file):
            return super().do_GET()

        # Jika path adalah root folder dan ada index.html
        if os.path.isdir(local_file) and os.path.isfile(os.path.join(local_file, "index.html")):
            return super().do_GET()

        # Fallback SPA: arahkan ke index.html
        index_file = os.path.join(self.directory, "index.html")
        if os.path.isfile(index_file):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(index_file, "rb") as f:
                self.wfile.write(f.read())
            return

        return super().do_GET()

def run_server():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, "dist")
    serving_dir = dist_dir if os.path.isdir(dist_dir) else base_dir

    lan_ip = get_lan_ip()

    print("=" * 72)
    print("       PT NUSA KONSTRUKSI ENJINIRING TBK - BIM DASHBOARD LAN")
    print("=" * 72)
    print(f"[*] Melayani folder : {serving_dir}")
    print(f"[*] Port server     : {PORT}")
    print("-" * 72)
    print(f"  ➜ Akses Lokal (Komputer ini) : http://localhost:{PORT}/")
    print(f"  ➜ Akses LAN (Kabel / WiFi)   : http://{lan_ip}:{PORT}/")
    print("-" * 72)
    print("  Petunjuk Akses Rekan Kerja di Jaringan LAN:")
    print(f"  1. Pastikan komputer rekan terhubung ke kabel LAN atau Wi-Fi yang sama.")
    print(f"  2. Buka browser Google Chrome / Microsoft Edge.")
    print(f"  3. Masukkan alamat: http://{lan_ip}:{PORT}/")
    print("=" * 72)
    print("Tekan Ctrl + C di jendela ini untuk menghentikan server.\n")

    # Izinkan reuse address agar tidak error saat restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[INFO] Server dihentikan oleh pengguna.")

if __name__ == "__main__":
    run_server()
