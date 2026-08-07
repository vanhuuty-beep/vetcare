// TÍNH NĂNG TỰ ĐỘNG HIỂN THỊ POPUP LỊCH HẸN SỚM (ĐỒNG BỘ 100% VỚI PHÒNG KHÁM HIỆN TẠI)
document.addEventListener('DOMContentLoaded', async () => {
    chenHtmlPopupLichHen();
    await kiemTraLichHenSapToi();
});

function chenHtmlPopupLichHen() {
    if (document.getElementById('popupLichHenNgayMai')) return;

    const popupHtml = `
    <div class="modal-overlay" id="popupLichHenNgayMai" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 2000;">
        <div class="modal-container" style="width: 550px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; color: #1e3a8a;">📅 Thông Báo Lịch Hẹn (3 Ngày Trước & Sau)</h3>
                <button onclick="dongPopupLichHen()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
            </div>
            
            <div style="max-height: 350px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f1f5f9; color: #475569;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Ngày hẹn</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Chủ nuôi & SĐT</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Nội dung hẹn</th>
                        </tr>
                    </thead>
                    <tbody id="tblDanhSachLichHenMai">
                        <tr><td colspan="3" style="text-align: center; padding: 20px; color: #94a3b8;">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                <button class="btn-primary" onclick="dongPopupLichHen()" style="padding: 6px 16px; font-size: 12px; background-color: #059669; cursor: pointer; border: none; color: white; border-radius: 4px;">Đã hiểu & Đóng</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

async function kiemTraLichHenSapToi() {
    if (typeof db === 'undefined' || !db) return;

    // Đợi 0.5 giây để đảm bảo trang chính đã load xong và xác định được biến phòng khám của hệ thống
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dò tìm thông minh mã phòng khám từ mọi biến toàn cục hoặc thông tin user đang đăng nhập trong hệ thống VetCare
    let maPhongKhamHienTai = '';
    
    // Thử lấy từ các hàm hoặc biến phổ biến của hệ thống
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.maphongkham) {
        maPhongKhamHienTai = currentUser.maphongkham;
    } else if (typeof maPhongKham !== 'undefined' && maPhongKham) {
        maPhongKhamHienTai = maPhongKham;
    } else {
        // Quét toàn bộ localStorage xem key nào chứa giá trị bắt đầu bằng PK_
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            if (val && val.startsWith('PK_')) {
                maPhongKhamHienTai = val;
                break;
            }
        }
    }

    // Nếu vẫn chưa tìm thấy, lấy trực tiếp từ session hoặc biến cố định nếu có
    if (!maPhongKhamHienTai) {
        maPhongKhamHienTai = localStorage.getItem('maphongkham') || localStorage.getItem('maPhongKham') || '';
    }

    console.log("MÃ PHÒNG KHÁM CHUẨN ĐƯỢC TÌM THẤY CHO POPUP:", maPhongKhamHienTai);

    if (!maPhongKhamHienTai) {
        console.warn("⚠️ Không xác định được mã phòng khám, hủy hiển thị popup.");
        return;
    }

    // Tính toán khoảng thời gian: Từ 3 ngày trước đến 3 ngày sau
    const ngayHienTai = new Date();
    const ngayBatDau = new Date();
    ngayBatDau.setDate(ngayHienTai.getDate() - 3);
    
    const ngayKetThuc = new Date();
    ngayKetThuc.setDate(ngayHienTai.getDate() + 3);

    const strBatDau = ngayBatDau.toISOString().split('T')[0];
    const strKetThuc = ngayKetThuc.toISOString().split('T')[0];

    // Truy vấn dữ liệu bám sát chính xác mã phòng khám
    const { data, error } = await db
        .from('lichhen')
        .select('*')
        .eq('maphongkham', maPhongKhamHienTai)
        .gte('ngayhen', strBatDau)
        .lte('ngayhen', strKetThuc)
        .order('ngayhen', { ascending: true });

    if (error) {
        console.error('Lỗi tải lịch hẹn popup:', error);
        return;
    }

    if (data && data.length > 0) {
        let html = '';
        data.forEach(item => {
            let ngayFormatted = 'Chưa chọn';
            if (item.ngayhen) {
                const parts = item.ngayhen.split('T')[0].split('-');
                if (parts.length === 3) {
                    ngayFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
                } else {
                    ngayFormatted = item.ngayhen;
                }
            }

            let rawSdt = String(item.sdt || '').trim();
            let displaySdt = rawSdt ? (rawSdt.startsWith('0') ? rawSdt : '0' + rawSdt) : 'Không có SĐT';

            html += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #2563eb;">📅 ${ngayFormatted}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">
                        <b>${item.tenchunuoi || '---'}</b><br>
                        <span style="font-size: 11px; color: #0284c7;">📞 ${displaySdt}</span>
                    </td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.noidung || '---'}</td>
                </tr>
            `;
        });

        const tblEl = document.getElementById('tblDanhSachLichHenMai');
        const popupEl = document.getElementById('popupLichHenNgayMai');
        if (tblEl && popupEl) {
            tblEl.innerHTML = html;
            popupEl.style.display = 'flex';
        }
    }
}

function dongPopupLichHen() {
    const popupEl = document.getElementById('popupLichHenNgayMai');
    if (popupEl) {
        popupEl.style.display = 'none';
    }
}
