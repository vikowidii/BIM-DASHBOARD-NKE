@echo off
title NKE BIM DASHBOARD - ATUR PASSWORD ADMIN
color 0E
cls

echo ========================================================================
echo       PT NUSA KONSTRUKSI ENJINIRING TBK - BIM DASHBOARD
echo                     PENGATURAN PASSWORD ADMIN
echo ========================================================================
echo.
echo Panduan Keamanan Akun Administrator:
echo.
echo 1. Akun Admin terdaftar secara bawaan di sistem.
echo 2. Pendaftaran akun baru kini mewajibkan email valid berdomain @gmail.com.
echo 3. Anda dapat mengganti password langsung dari Dashboard setelah login:
echo    - Klik menu Profil Admin di pojok kanan atas topbar.
echo    - Pilih tab "Pengaturan Akun".
echo    - Masukkan Password Baru dan konfirmasi.
echo    - Klik "Simpan Pengaturan".
echo.
echo ========================================================================
echo.
set /p resetconfirm="Apakah Anda ingin membuka dashboard sekarang? (Y/N): "
if /i "%resetconfirm%"=="Y" (
    start http://localhost:3000/
)
echo.
pause
