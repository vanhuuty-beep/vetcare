function dangXuatMobile() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?')) {
        // Xóa thông tin phiên đăng nhập đã lưu
        sessionStorage.removeItem('currentUser');
        
        // Chuyển hướng về trang đăng nhập gốc
        window.location.replace('../index.html');
    }
}

