// Tự động tiêm khung HTML của Popup vào cuối trang
document.addEventListener("DOMContentLoaded", function () {
    const popupHTML = `
    <!-- Modal Popup Nhắc Lịch Tiêm Vắc-xin -->
    <div id="vaccineReminderModal" style="display: none; position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
        <div style="position: relative; max-width: 500px; margin: 80px auto; background: #fff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; font-family: sans-serif;">
            
            <!-- Header Popup -->
            <div style="background: #e11d48; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold;">💉 LỊCH TIÊM VẮC-XIN HÔM NAY & SẮP TỚI</h3>
                <button onclick="dongPopupVaccine()" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer;">✕</button>
            </div>

            <!-- Body Nội Dung -->
            <div id="vaccineReminderContent" style="padding: 20px; max-height: 350px; overflow-y: auto; background: #f8fafc;">
                <!-- Dữ liệu nạp tự động -->
            </div>

            <!-- Footer Popup -->
            <div style="padding: 15px 20px; background: #fff; text-align: center; border-top: 1px solid #e2e8f0;">
                <button onclick="dongPopupVaccine()" style="background: #0ea5e9; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">Đóng thông báo</button>
            </div>

        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    kiemTraLichTiemVaccine();
});

// Hàm kiểm tra và lấy dữ liệu liên kết đầy đủ
async function kiemTraLichTiemVaccine() {
    try {
        // 1. Tải danh sách khách hàng
        const { data: khData } = await db.from('khachhang').select('*');
        let mapKhachHang = {};
        if (khData) {
            khData.forEach(kh => {
                mapKhachHang[kh.id] = {
                    ten: kh.hovaten || kh.ten || 'Không tên',
                    sdt: kh.sodienthoai || kh.sdt || '---'
                };
            });
        }

        // 2. Tải danh sách thú cưng (Sử dụng đúng cột tenthucung)
        const { data: petData } = await db.from('thucung').select('*');
        let mapThuCung = {};
        if (petData) {
            petData.forEach(pet => {
                let maKH = pet.makhachhang || pet.makh || pet.khachhang_id;
                let thongTinChu = mapKhachHang[maKH] || { ten: 'Không rõ chủ', sdt: '---' };
                
                mapThuCung[pet.id] = {
                    tenthucung: pet.tenthucung || pet.ten || 'Thú cưng',
                    tenchu: thongTinChu.ten,
                    sdt: thongTinChu.sdt
                };
            });
        }

        // 3. Tải nhật ký tiêm vắc-xin
        const { data: listTiem, error } = await db.from('nhatkylamvaccine').select('*');
        if (error || !listTiem) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let htmlList = '';
        let countHopLe = 0;

        listTiem.forEach(item => {
            if (!item.ngaynhaclai) return;

            const ngayNhac = new Date(item.ngaynhaclai);
            ngayNhac.setHours(0, 0, 0, 0);

            const diffTime = ngayNhac - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Hiển thị nếu quá hạn, hôm nay (0) hoặc sắp tới trong vòng 3 ngày
            if (diffDays >= 0 && diffDays <= 3) {
                countHopLe++;
                let badgeText = diffDays === 0 ? 'Hôm nay' : `Còn ${diffDays} ngày`;
                let badgeColor = diffDays === 0 ? '#dc2626' : '#d97706';

                // Lấy thông tin thú cưng và chủ nuôi từ bộ nhớ đệm
                let thongTinPet = mapThuCung[item.mathucung] || { tenthucung: '---', tenchu: 'Không rõ', sdt: '---' };

                htmlList += `
                    <div style="background: #fff; border-left: 4px solid ${badgeColor}; padding: 12px 15px; margin-bottom: 12px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">⏳ SẮP ĐẾN HẠN TIÊM (${badgeText})</span>
                        </div>
                        <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                            <div>🐾 <b>Thú cưng:</b> ${thongTinPet.tenthucung} | 💉 <b>Loại:</b> ${item.tenvaccine || 'Vắc-xin'}</div>
                            <div>👤 <b>Chủ nuôi:</b> ${thongTinPet.tenchu} | 📞 <b>SĐT:</b> <a href="tel:${thongTinPet.sdt}" style="color: #0284c7; text-decoration: none; font-weight: bold;">${thongTinPet.sdt}</a></div>
                            <div>📅 <b>Hạn nhắc:</b> ${item.ngaynhaclai}</div>
                        </div>
                        <div style="margin-top: 10px; text-align: right;">
                            <a href="https://zalo.me/${thongTinPet.sdt}" target="_blank" style="background: #0068ff; color: #fff; padding: 5px 12px; border-radius: 4px; font-size: 12px; text-decoration: none; font-weight: 500;">💬 Auto Nhắc Zalo</a>
                        </div>
                    </div>
                `;
            }
        });

        if (countHopLe > 0) {
            document.getElementById('vaccineReminderContent').innerHTML = htmlList;
            document.getElementById('vaccineReminderModal').style.display = 'block';
        }

    } catch (err) {
        console.error('Lỗi tải lịch tiêm:', err);
    }
}

// Hàm đóng popup
function dongPopupVaccine() {
    const modal = document.getElementById('vaccineReminderModal');
    if (modal) modal.style.display = 'none';
}