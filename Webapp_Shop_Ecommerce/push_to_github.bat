@echo off
chcp 65001 >nul
echo ========================================
echo   PUSH CODE LÊN GITHUB - BRANCH MỚI
echo ========================================
echo.

cd ..

echo [1/7] Kiểm tra Git...
if not exist ".git" (
    echo Đang khởi tạo Git repository...
    git init
    if errorlevel 1 (
        echo ❌ Lỗi khi khởi tạo Git!
        pause
        exit /b 1
    )
    echo ✅ Khởi tạo Git thành công!
) else (
    echo ✅ Git repository đã tồn tại.
)
echo.

echo [2/7] Cấu hình thông tin user...
git config user.email "thea682004@gmail.com"
git config user.name "The Anh"
echo ✅ Đã cấu hình user!
echo.

echo [3/7] Thêm tất cả file vào Git...
git add .
if errorlevel 1 (
    echo ❌ Lỗi khi thêm file!
    pause
    exit /b 1
)
echo ✅ Đã thêm tất cả file!
echo.

echo [4/7] Commit code...
git commit -m "Upload code hiện tại - phiên bản The Anh"
if errorlevel 1 (
    echo ⚠️ Có thể đã commit rồi hoặc không có thay đổi.
)
echo ✅ Commit hoàn tất!
echo.

echo [5/7] Thêm remote repository...
git remote add origin https://github.com/duvanan/datn.git 2>nul
if errorlevel 1 (
    echo ⚠️ Remote đã tồn tại, đang cập nhật...
    git remote set-url origin https://github.com/duvanan/datn.git
)
echo ✅ Remote repository đã được cấu hình!
echo.

echo [6/7] Tạo và chuyển sang branch mới 'theanh-version'...
git checkout -b theanh-version 2>nul
if errorlevel 1 (
    echo ⚠️ Branch đã tồn tại, đang chuyển sang branch...
    git checkout theanh-version
)
echo ✅ Đã chuyển sang branch 'theanh-version'!
echo.

echo [7/7] Push code lên GitHub...
echo ⚠️ Bạn có thể cần đăng nhập GitHub nếu được yêu cầu.
echo.
git push -u origin theanh-version
if errorlevel 1 (
    echo.
    echo ❌ Lỗi khi push! Có thể do:
    echo    - Chưa đăng nhập GitHub
    echo    - Không có quyền truy cập repository
    echo    - Vấn đề kết nối mạng
    echo.
    echo 💡 Thử chạy lệnh sau để xác thực:
    echo    git push -u origin theanh-version
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ HOÀN TẤT!
echo ========================================
echo.
echo Code của bạn đã được push lên GitHub!
echo Branch: theanh-version
echo Repository: https://github.com/duvanan/datn
echo.
echo 🌐 Xem trên GitHub:
echo https://github.com/duvanan/datn/tree/theanh-version
echo.
pause
