function kiemTraVaChuyenDoiMobile() {
    const screenWidth = window.innerWidth;
    const currentPath = window.location.pathname;

    // Nếu màn hình nhỏ hơn hoặc bằng 768px (điện thoại) và chưa ở thư mục /mobile/
    if (screenWidth <= 768 && !currentPath.includes('/mobile/')) {
        // Lấy tên file hiện tại (VD: khachhang.html)
        const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        
        // Danh sách các trang có hỗ trợ phiên bản mobile riêng
        const trangCoMobile = ['khachhang.html', 'phieuchidinh.html', 'khambenh.html'];

        if (trangCoMobile.includes(fileName)) {
            // Chuyển hướng sang thư mục mobile tương ứng
            window.location.href = 'mobile/' + fileName;
        }
    }
}

// Chạy kiểm tra ngay khi tải trang
window.addEventListener('DOMContentLoaded', kiemTraVaChuyenDoiMobile);