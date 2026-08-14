// 1. Kiểm tra thông tin phòng khám từ phiên đăng nhập (sessionStorage)
let currentUser = null;
try {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
} catch (e) {
    currentUser = null;
}

// 2. Cấu hình Database Supabase tự động
const CONFIG = {
    SUPABASE_URL: window.ENV_SUPABASE_URL || "https://hylsdhrtzxhhzilcctzr.supabase.co",
    SUPABASE_KEY: window.ENV_SUPABASE_KEY || "sb_publishable_V3ZATAo78EYq-Cv3paHRRg_XLGENjBp",
};

// 3. Khởi tạo giá trị mặc định ban đầu từ sessionStorage
let CLINIC_INFO = {
    ten: currentUser?.tenphongkham ? currentUser.tenphongkham.toUpperCase() : "VETCARE PRO - PHÒNG KHÁM THÚ Y",
    diachi: currentUser?.diachi || "Đà Nẵng",
    dienthoai: currentUser?.sodienthoai || "0935.77.87.27",
    slogan: "Hệ thống quản lý thú y thông minh"
};

// 4. Hàm tự động bơm thông tin vào tiêu đề trang và các khung in (có đồng bộ realtime từ bảng chupk)
async function capNhatThongTinIn() {
    // Nếu có mã phòng khám đăng nhập, tiến hành truy vấn trực tiếp bảng chupk trên Supabase để lấy thông tin mới nhất
    if (currentUser && currentUser.maphongkham && typeof db !== 'undefined' && db) {
        try {
            const { data, error } = await db.from('chupk').select('*').eq('maphongkham', currentUser.maphongkham).maybeSingle();
            if (!error && data) {
                if (data.tenphongkham) CLINIC_INFO.ten = data.tenphongkham.toUpperCase();
                if (data.diachi) CLINIC_INFO.diachi = data.diachi;
                if (data.sodienthoai) CLINIC_INFO.dienthoai = data.sodienthoai;
                
                // Đồng thời cập nhật lại sessionStorage để các trang khác cùng đồng bộ
                currentUser.tenphongkham = data.tenphongkham;
                currentUser.diachi = data.diachi;
                currentUser.sodienthoai = data.sodienthoai;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        } catch (err) {
            console.error("Lỗi đồng bộ thông tin phòng khám:", err);
        }
    }

    // Đổi tiêu đề trang web trên trình duyệt
    document.title = CLINIC_INFO.ten;
    
    // Tự động cập nhật tên, địa chỉ và số điện thoại vào tất cả khung in phiếu
    const printHeaders = document.querySelectorAll('.print-header');
    printHeaders.forEach(header => {
        header.innerHTML = `
            <h2 style="font-size: 15px; margin: 0; color: #0284c7; font-weight: bold;">${CLINIC_INFO.ten}</h2>
            <p style="font-size: 10px; margin: 2px 0; color: #555;">Địa chỉ: ${CLINIC_INFO.diachi} | Điện thoại: ${CLINIC_INFO.dienthoai}</p>
        `;
    });

    // Cập nhật tên phòng khám ra giao diện chung (nếu có thẻ id="dynamicClinicName")
    const lblTenPK = document.getElementById('dynamicClinicName');
    if (lblTenPK) {
        lblTenPK.innerText = CLINIC_INFO.ten;
    }
}

// Chạy tự động khi tải trang xong và trước khi thực hiện lệnh in
document.addEventListener("DOMContentLoaded", capNhatThongTinIn);
window.addEventListener('beforeprint', capNhatThongTinIn);
