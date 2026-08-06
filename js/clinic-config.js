// Cấu hình thông tin phòng khám dùng chung
const CLINIC_INFO = {
    ten: "VETCARE PRO - PHÒNG KHÁM THÚ Y",
    diachi: "Đà Nẵng",
    dienthoai: "0935.xxx.xxx",
    slogan: "Hệ thống quản lý thú y thông minh"
};

// Hàm tự động bơm thông tin vào các khung in
function capNhatThongTinIn() {
    const printHeaders = document.querySelectorAll('.print-header');
    printHeaders.forEach(header => {
        // Dù bên trong trống hay có chữ cũ, script này đều điền chuẩn nội dung cấu hình
        header.innerHTML = `
            <h2 style="font-size: 15px; margin: 0; color: #0284c7; font-weight: bold;">${CLINIC_INFO.ten}</h2>
            <p style="font-size: 10px; margin: 2px 0; color: #555;">Địa chỉ: ${CLINIC_INFO.diachi} | Điện thoại: ${CLINIC_INFO.dienthoai}</p>
        `;
    });
}

document.addEventListener("DOMContentLoaded", capNhatThongTinIn);
window.addEventListener('beforeprint', capNhatThongTinIn);