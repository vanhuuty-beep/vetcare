function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        // Thu phóng hoặc ẩn hiện sidebar mượt mà
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
    }
}

// Lấy mã phòng khám hiện tại từ sessionStorage (Ví dụ: "PK_617617" hoặc "617617")
function layMaPhongKhamHienTai() {
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user && user.maphongkham) {
            // Loại bỏ dấu gạch dưới hoặc giữ nguyên tùy ý bạn (Ví dụ: PK617617)
            return user.maphongkham.replace('_', ''); 
        }
    } catch (e) {}
    return 'PK'; // Giá trị mặc định nếu không tìm thấy
}

// 1. Mã Khám Bệnh (Ví dụ ra: PK617617-KB0001)
function formatMaKham(id) {
    const maPK = layMaPhongKhamHienTai();
    return `${maPK}-KB${String(id).padStart(4, '0')}`;
}

// 2. Mã Thú Cưng (Ví dụ ra: PK617617-TC0001)
function formatMaThuCung(id) {
    const maPK = layMaPhongKhamHienTai();
    return `${maPK}-TC${String(id).padStart(4, '0')}`;
}

// 3. Mã Khách Hàng (Ví dụ ra: PK617617-KH0001)
function formatMaKhachHang(id) {
    const maPK = layMaPhongKhamHienTai();
    return `${maPK}-KH${String(id).padStart(4, '0')}`;
}

function formatTien(value) {
    if (value == null) return "0 đ";
    return Number(value).toLocaleString('vi-VN') + " đ";
}

// Nếu màn hình nhỏ hơn 768px (điện thoại) và không phải đang ở trang mobile-menu
if (window.innerWidth <= 768 && !window.location.href.includes('mobile-menu.html')) {
    // Tùy chọn tối ưu hiển thị trên di động
}

/**
 * Tự động quản lý maphongkham, phân quyền và tự động chèn dữ liệu Supabase
 */
(function() {
    // 1. Hàm lấy mã phòng khám từ sessionStorage
    window.getMaPhongKham = function() {
        const maphongkham = sessionStorage.getItem('maphongkham');
        if (!maphongkham) {
            console.warn('⚠️ Cảnh báo: Không tìm thấy maphongkham trong sessionStorage!');
        }
        return maphongkham || '';
    };

    // 2. Kiểm tra bắt buộc đăng nhập khi vào trang quản lý
    window.kiemTraDangNhapPhongKham = function() {
        const currentUser = sessionStorage.getItem('currentUser');
        const maphongkham = sessionStorage.getItem('maphongkham');
        if (!currentUser || !maphongkham) {
            alert('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại!');
            window.location.href = '../login.html'; // Điều chỉnh đường dẫn về trang login phù hợp thư mục
        }
    };

    // 3. Helper dự phòng khi cần gán thủ công payload
    window.chuanBiPayload = function(dataObj) {
        const maphongkham = window.getMaPhongKham();
        if (Array.isArray(dataObj)) {
            return dataObj.map(item => ({ ...item, maphongkham }));
        }
        return { ...dataObj, maphongkham };
    };

    // 4. Lớp tự động chèn (Interceptor) vào Supabase để áp dụng cho mọi trang
    window.addEventListener('DOMContentLoaded', () => {
        if (typeof db !== 'undefined' && db.from) {
            const originalFrom = db.from.bind(db);
            
            db.from = function(table) {
                const queryBuilder = originalFrom(table);
                const maphongkham = sessionStorage.getItem('maphongkham') || '';

                // Chỉ loại trừ bảng chupk, còn bảng user và các bảng nghiệp vụ khác sẽ được tự động lọc/gán maphongkham
                const excludeTables = ['chupk'];

                // Tự động thêm điều kiện lọc theo phòng khám khi gọi .select()
                const originalSelect = queryBuilder.select.bind(queryBuilder);
                queryBuilder.select = function(...args) {
                    const q = originalSelect(...args);
                    if (maphongkham && !excludeTables.includes(table)) {
                        q.eq('maphongkham', maphongkham);
                    }
                    return q;
                };

                // Tự động nhét maphongkham vào dữ liệu khi gọi .insert()
                const originalInsert = queryBuilder.insert.bind(queryBuilder);
                queryBuilder.insert = function(values, options) {
                    if (maphongkham && !excludeTables.includes(table)) {
                        if (Array.isArray(values)) {
                            values = values.map(item => ({ ...item, maphongkham }));
                        } else if (values && typeof values === 'object') {
                            values = { ...values, maphongkham };
                        }
                    }
                    return originalInsert(values, options);
                };

                return queryBuilder;
            };
        }
    });
})();
// Tích hợp hệ thống Chat Online Crisp
window.$crisp = [];
window.CRISP_WEBSITE_ID = "ac702dfb-845a-4289-b891-a83f4c413eb5";

(function() {
    var d = document;
    var s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
})();

// Nâng cao: Tự động điền thông tin chủ nuôi vào khung chat (nếu đã đăng nhập)
// Giúp đội Dev biết ai đang nhắn tin mà không cần hỏi tên
window.addEventListener('load', function() {
    const ownerStr = sessionStorage.getItem('currentPetOwner');
    if (ownerStr) {
        try {
            const owner = JSON.parse(ownerStr);
            // Gửi thông tin định danh cho Crisp
            $crisp.push(["set", "user:nickname", [owner.hovaten || owner.tenkhachhang]]);
            $crisp.push(["set", "user:email", [owner.email || ""]]);
            $crisp.push(["set", "user:phone", [owner.sodienthoai || owner.sdt]]);
        } catch(e) {
            console.log("Chưa thể đẩy thông tin user vào Crisp");
        }
    }
});


