document.addEventListener("DOMContentLoaded", function() {
    setTimeout(kiemTraNgayHetHanTuChupk, 1200);
});

async function kiemTraNgayHetHanTuChupk() {
    if (typeof db === 'undefined' || !db) return;

    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }

    if (!currentUser) return;

    let ngayHetHanStr = currentUser.ngayhethan;

    try {
        // Lấy chính xác maphongkham từ session (ví dụ: PK_617617)
        let maPhongKham = currentUser.maphongkham || sessionStorage.getItem('maphongkham');
        
        if (maPhongKham) {
            maPhongKham = String(maPhongKham).trim();
            
            // Truy vấn trực tiếp vào bảng chupk dựa vào cột maphongkham
            const { data, error } = await db
                .from('chupk')
                .select('ngayhethan')
                .eq('maphongkham', maPhongKham)
                .maybeSingle();

            if (data && data.ngayhethan) {
                ngayHetHanStr = data.ngayhethan;
                currentUser.ngayhethan = ngayHetHanStr;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    } catch (err) {
        console.error('Lỗi truy vấn ngày hết hạn từ chupk:', err);
    }

    if (!ngayHetHanStr) return;

    // Tính toán số ngày còn lại
    const ngayHetHan = new Date(ngayHetHanStr);
    const ngayHienTai = new Date();
    
    ngayHetHan.setHours(0, 0, 0, 0);
    ngayHienTai.setHours(0, 0, 0, 0);

    const diffTime = ngayHetHan - ngayHienTai;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Nếu còn từ 0 đến 10 ngày và chưa thông báo trong phiên này
    if (diffDays >= 0 && diffDays <= 10) {
        const daThongBao = sessionStorage.getItem('daThongBaoSapHetHan');
        if (!daThongBao) {
            hienThiPopupSapHetHan(diffDays);
        }
    }
}

// Hàm vẽ giao diện Popup cảnh cáo
function hienThiPopupSapHetHan(soNgayConLai) {
    if (document.getElementById('modalSapHetHan')) return;

    const modal = document.createElement('div');
    modal.id = 'modalSapHetHan';
    modal.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%;
        background: rgba(15, 23, 42, 0.75); 
        backdrop-filter: blur(3px);
        z-index: 999999;
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    let thongBaoText = soNgayConLai === 0 
        ? `<span style="background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 16px; border: 1px solid #fca5a5;">⚠️ HẾT HẠN TRONG HÔM NAY</span>`
        : `<span style="background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 16px; border: 1px solid #fca5a5;">⚠️ CÒN ${soNgayConLai} NGÀY SỬ DỤNG</span>`;

    modal.innerHTML = `
        <div style="
            background: #ffffff; 
            padding: 30px; 
            border-radius: 16px; 
            width: 90%; 
            max-width: 440px; 
            text-align: center; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); 
            position: relative;
            border-top: 6px solid #ea580c;
        ">
            <button onclick="dongPopupSapHetHan()" style="
                position: absolute; 
                top: 12px; 
                right: 15px; 
                background: none; 
                border: none; 
                font-size: 22px; 
                cursor: pointer; 
                color: #94a3b8;
            ">&times;</button>
            
            <div style="font-size: 54px; margin-bottom: 10px; line-height: 1;">⏳</div>
            
            <h3 style="color: #c2410c; margin: 0 0 10px 0; font-size: 19px; font-weight: 700;">
                CẢNH BÁO SẮP HẾT HẠN BẢN QUYỀN
            </h3>
            
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 22px;">
                Tài khoản phòng khám của bạn chuẩn bị hết hạn:<br>
                <div style="margin: 8px 0;">${thongBaoText}</div>
                Vui lòng gia hạn ngay để không làm gián đoạn công việc!
            </p>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="dongPopupSapHetHan()" style="
                    background: #f1f5f9; 
                    color: #475569; 
                    border: 1px solid #cbd5e1; 
                    padding: 10px 18px; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    cursor: pointer; 
                    font-size: 13px;
                ">Để sau</button>

                <button onclick="window.location.href='thanhtoan.html'" style="
                    background: #0284c7; 
                    color: white; 
                    border: none; 
                    padding: 10px 22px; 
                    border-radius: 8px; 
                    font-weight: 700; 
                    cursor: pointer; 
                    font-size: 13px; 
                    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
                ">💳 Gia hạn ngay</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    sessionStorage.setItem('daThongBaoSapHetHan', 'true');
}

function dongPopupSapHetHan() {
    const modal = document.getElementById('modalSapHetHan');
    if (modal) modal.remove();
}