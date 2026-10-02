@echo off
title NKE BIM DASHBOARD - SERVER LAN
color 0B
cls

echo ========================================================================
echo       PT NUSA KONSTRUKSI ENJINIRING TBK - BIM DASHBOARD
echo                     SERVER JARINGAN LOKAL (LAN)
echo ========================================================================
echo.
echo Sedang memeriksa lingkungan server...

:: 1. Cek Node.js
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js dan NPM terdeteksi di komputer Anda.
    echo.
    echo Menjalankan dashboard menggunakan Vite Development Server...
    echo Server disetel agar otomatis dapat diakses oleh komputer lain via LAN.
    echo.
    echo Tekan Ctrl + C untuk keluar dari server.
    echo ========================================================================
    echo.
    call npm run dev
    goto selesai
)

:: 2. Jika Node.js tidak ada, cek Python
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python terdeteksi di komputer Anda.
    echo.
    echo Menjalankan dashboard menggunakan Python LAN Server...
    echo.
    python serve_lan.py
    goto selesai
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python Launcher terdeteksi di komputer Anda.
    echo.
    echo Menjalankan dashboard menggunakan Python LAN Server...
    echo.
    py serve_lan.py
    goto selesai
)

:: 3. Jika keduanya belum terpasang
echo [PERHATIAN] Node.js atau Python belum terdeteksi di sistem komputer ini.
echo.
echo Silakan unduh dan pasang salah satu untuk menjalankan:
echo  - Node.js LTS (disarankan): https://nodejs.org/
echo  - Python 3.x: https://www.python.org/
echo.
pause

:selesai
pause
