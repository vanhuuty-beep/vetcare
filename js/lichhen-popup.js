// =========================================================================
// SCRIPT DÙNG CHUNG: HIỂN THỊ POPUP LỊCH HẸN HÔM NAY & NGÀY MAI THEO PHÒNG KHÁM
// =========================================================================

// 1. Lấy mã phòng khám hiện tại của thiết bị
function layChiNhanhHienTai() {
    return localStorage.getItem('current_maphongkham') || 'PK_617723'; 
}

// 2. Tự động chạy khi tải trang xong
document.addEventListener('DOMContentLoaded', async () => {
    chenHtmlPopupLichHen();
    await kiemTraLichHenHomNayVaNgayMai();
});

// 3. Tự động chèn khung giao diện HTML của Popup vào trang
function chenHtmlPopupLichHen() {
    if (document.getElementById('popupLichHenNgayMai')) return;

    const popupHtml = `
    <div class="modal-overlay" id="popupLichHenNgayMai" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 2000;">
        <div class="modal-container" style="width: 550px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; color: #1e3a8a;">📅 Lịch Hẹn Hôm Nay & Ngày Mai (Chờ Khám)</h3>
                <button onclick="dongPopupLichHen()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
            </div>
            
            <div style="max-height: 350px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f1f5f9; color: #475569;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Thời gian</th>
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

// 4. Kiểm tra dữ liệu lịch hẹn từ Supabase theo đúng mã phòng khám
async function kiemTraLichHenHomNayVaNgayMai() {
    if (typeof db === 'undefined' || !db) return;

    const maPhongKham = layChiNhanhHienTai();

    const homNay = new Date();
    const nam = homNay.getFullYear();
    const thang = String(homNay.getMonth() + 1).padStart(2, '0');
    const ngay = String(homNay.getDate()).padStart(2, '0');
    const mocDauHomNay = `${nam}-${thang}-${ngay}T00:00:00`;

    const ngayMai = new Date();
    ngayMai.setDate(ngayMai.getDate() + 2);
    const namMai = ngayMai.getFullYear();
    const thangMai = String(ngayMai.getMonth() + 1).padStart(2, '0');
    const ngayMaiStr = String(ngayMai.getDate()).padStart(2, '0');
    const mocCuoiNgayMai = `${namMai}-${thangMai}-${ngayMaiStr}T00:00:00`;

    // Truy vấn Supabase: Lọc đúng maphongkham, trong khoảng thời gian và chỉ lấy trạng thái "Chờ khám"
    const { data, error } = await db
        .from('lichhen')
        .select('*')
        .eq('maphongkham', maPhongKham) 
        .gte('ngayhen', mocDauHomNay)
        .lt('ngayhen', mocCuoiNgayMai)
        .eq('trangthai', 'Chờ khám')
        .order('ngayhen', { ascending: true });

    if (error) {
        console.error('Lỗi tải lịch hẹn:', error);
        return;
    }

    if (data && data.length > 0) {
        let html = '';
        data.forEach(item => {
            const ngayHenObj = new Date(item.ngayhen);
            const ngayGioFormatted = ngayHenObj.toLocaleString('vi-VN');
            let rawSdt = String(item.sdt || '').trim();
            let displaySdt = rawSdt ? (rawSdt.startsWith('0') ? rawSdt : '0' + rawSdt) : 'Không có SĐT';

            html += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #2563eb;">${ngayGioFormatted}</td>
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
            popupEl.style.display = 'flex'; // Bật popup thông báo
        }
    }
}

// 5. Đóng popup
function dongPopupLichHen() {
    const popupEl = document.getElementById('popupLichHenNgayMai');
    if (popupEl) {
        popupEl.style.display = 'none';
    }
}
