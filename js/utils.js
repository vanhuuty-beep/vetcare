function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
    }
}

function layMaPhongKhamHienTai() {
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        return user?.maphongkham ? user.maphongkham.replace('_', '') : 'PK';
    } catch (e) { return 'PK'; }
}

function formatMaKham(id) { 
    if (!id) return '';
    return `KB${layMaPhongKhamHienTai()}${String(id).padStart(4, '0')}`; 
}

function formatMaThuCung(id) { 
    if (!id) return '';
    return `TC${layMaPhongKhamHienTai()}${String(id).padStart(4, '0')}`; 
}

function formatMaKhachHang(id) { 
    if (!id) return '';
    return `KH${layMaPhongKhamHienTai()}${String(id).padStart(4, '0')}`; 
}
function formatTien(value) { return (value == null ? 0 : Number(value)).toLocaleString('vi-VN') + " đ"; }

(function() {
    window.getMaPhongKham = function() {
        return sessionStorage.getItem('maphongkham') || '';
    };

    window.kiemTraDangNhapPhongKham = function() {
        if (window.location.href.includes('chunuoi')) return;
        const currentUser = sessionStorage.getItem('currentUser');
        const maphongkham = sessionStorage.getItem('maphongkham');
        if (!currentUser || !maphongkham) {
            alert('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại!');
            window.location.href = '../login.html'; 
        }
    };

    window.chuanBiPayload = function(dataObj) {
        const maphongkham = window.getMaPhongKham();
        if (Array.isArray(dataObj)) {
            return dataObj.map(item => ({ ...item, maphongkham }));
        }
        return { ...dataObj, maphongkham };
    };

    window.addEventListener('DOMContentLoaded', () => {
        if (typeof db !== 'undefined' && db.from) {
            const originalFrom = db.from.bind(db);
            db.from = function(table) {
                const queryBuilder = originalFrom(table);
                const maphongkham = sessionStorage.getItem('maphongkham') || '';
                const excludeTables = ['chupk'];

                const originalSelect = queryBuilder.select.bind(queryBuilder);
                queryBuilder.select = function(...args) {
                    const q = originalSelect(...args);
                    if (maphongkham && !excludeTables.includes(table) && table !== 'tin_nhan') {
                        q.eq('maphongkham', maphongkham);
                    }
                    return q;
                };

                const originalInsert = queryBuilder.insert.bind(queryBuilder);
                queryBuilder.insert = function(values, options) {
                    if (maphongkham && !excludeTables.includes(table) && table !== 'tin_nhan') {
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

// Chỉ duy nhất URL có chữ "chunuoi" mới được tính là giao diện Chủ Nuoi thực sự.
const isThucSuChuNuoi = window.location.href.includes('chunuoi');

window.addEventListener('load', function() {
    khoiTaoNutChatNoiHeThong();
    if (!isThucSuChuNuoi) {
        kiemTraTinNhanChuaDocBanDau();
    }
});


/**
 * ==========================================
 * HỆ THỐNG CHAT NỔI (PHÂN TÁCH CHUẨN XÁC)
 * ==========================================
 */
let selectedPhongKhamChat = null;
let sdtChuNuoiDangChon = null;

async function khoiTaoNutChatNoiHeThong() {
    try {
        if (isThucSuChuNuoi) {
            // ==========================================
            // 1. GIAO DIỆN CHỦ NUÔI (LẤY TỪ BẢNG KHACHHANG)
            // ==========================================
            if (document.getElementById('floatingChatBtn') !== null) return;
            
            const ownerData = JSON.parse(sessionStorage.getItem('currentPetOwner')) || JSON.parse(sessionStorage.getItem('currentUser')) || {};
            const sdt = ownerData?.sodienthoai || ownerData?.sodienthoai_chunuoi || ownerData?.sdt || ownerData?.sodienthoaikhachhang || "0935778727";

            // Bước 1: Lấy danh sách phòng khám từ bảng chupk
            let allPK = [];
            try {
                let resPK = await db.from('chupk').select('maphongkham, tenphongkham');
                if (resPK.data) allPK = resPK.data;
            } catch(e){}

            // Bước 2: Lấy maphongkham trực tiếp từ bảng khachhang theo số điện thoại
            let mapkList = [];
            try {
                let resKH = await db.from('khachhang').select('maphongkham').eq('sodienthoai', sdt);
                if (resKH.data) {
                    resKH.data.forEach(k => { if (k.maphongkham) mapkList.push(k.maphongkham); });
                }
                let resKH2 = await db.from('khachhang').select('maphongkham').eq('sdt', sdt);
                if (resKH2.data) {
                    resKH2.data.forEach(k => { if (k.maphongkham && !mapkList.includes(k.maphongkham)) mapkList.push(k.maphongkham); });
                }
            } catch(e){}

            let uniqueMapk = [...new Set(mapkList.filter(Boolean))];

            let pkOptionsHTML = '';
            let uniqueMap = new Map();

            if (uniqueMapk.length > 0) {
                uniqueMapk.forEach(mpk => {
                    let cleanTarget = mpk ? mpk.toString().replace(/[_]/g, '').trim().toLowerCase() : '';
                    let foundPK = allPK.find(p => {
                        let cleanDB = p.maphongkham ? p.maphongkham.toString().replace(/[_]/g, '').trim().toLowerCase() : '';
                        return cleanDB === cleanTarget;
                    });

                    let tenHienThi = (foundPK && foundPK.tenphongkham && foundPK.tenphongkham.trim() !== '') 
                        ? foundPK.tenphongkham.trim() 
                        : `Phòng khám ${mpk}`;
                    let realMaPK = foundPK ? foundPK.maphongkham : mpk;

                    if (!uniqueMap.has(tenHienThi)) {
                        uniqueMap.set(tenHienThi, { value: realMaPK, label: tenHienThi });
                    }
                });
            }

            let firstItem = Array.from(uniqueMap.values())[0];
            selectedPhongKhamChat = firstItem?.value || "";

            uniqueMap.forEach((item) => {
                let isSelected = (item.value === selectedPhongKhamChat) ? 'selected' : '';
                pkOptionsHTML += `<option value="${item.value}" ${isSelected}>${item.label}</option>`;
            });

            if (pkOptionsHTML === '') {
                pkOptionsHTML = '<option value="">Chưa đăng ký phòng khám nào</option>';
            }

            const mobileChatHTML = `
            <div id="floatingChatBtn" onclick="toggleMobileChat()" style="position: fixed; bottom: 85px; right: 20px; background: #0d9488; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); cursor: pointer; z-index: 999999;">💬</div>

            <div id="mobileChatWindow" style="display: none; position: fixed; bottom: 140px; right: 15px; width: 290px; max-width: 90vw; height: 380px; background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 999999; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif; border: 1px solid #cbd5e1;">
                <div style="background: #0d9488; color: white; padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span>💬 Trò chuyện trực tuyến</span>
                    <span onclick="toggleMobileChat()" style="cursor: pointer; font-size: 16px;">&times;</span>
                </div>
                <div style="padding: 5px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                    <select id="selectPhongKhamChat" onchange="doiPhongKhamChat(this.value)" style="width: 100%; padding: 4px; font-size: 11px; border-radius: 4px; border: 1px solid #cbd5e1; outline:none;">
                        ${pkOptionsHTML}
                    </select>
                </div>
                <div id="boxTinNhanMobile" style="flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; background: #f8fafc; font-size: 12px;"></div>
                <div style="display: flex; padding: 6px; background: #fff; border-top: 1px solid #cbd5e1; gap: 5px; align-items: center;">
                    <label style="cursor: pointer; font-size: 18px;" title="Gửi ảnh">📷<input type="file" id="inputAnhMobile" accept="image/*" style="display:none" onchange="guiAnhMobile(this)"></label>
                    <input type="text" id="inputChatMobile" placeholder="Nhắn tin..." style="flex: 1; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; font-size: 12px;" autocomplete="off">
                    <button onclick="guiTinNhanMobile()" style="background: #0d9488; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">Gửi</button>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', mobileChatHTML);

        } else {
            // ==========================================
            // 2. GIAO DIỆN QUẢN LÝ PHÒNG KHÁM (NHÂN VIÊN)
            // ==========================================
            if (document.getElementById('floatingPCChatBtn') !== null) return;
            
            const pcChatHTML = `
            <div id="floatingPCChatBtn" onclick="togglePCChat()" style="position: fixed; bottom: 85px; right: 20px; background: #2563eb; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); cursor: pointer; z-index: 999999; transition: transform 0.2s;" title="Hộp thư tư vấn">
                💬
                <span id="chatBadgeAlert" style="display: none; position: absolute; top: 0; right: 0; background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></span>
            </div>

            <div id="pcChatWindow" style="display: none; position: fixed; bottom: 140px; right: 15px; width: 480px; max-width: 92vw; height: 360px; background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 999999; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif; border: 1px solid #cbd5e1;">
                <div style="background: #1e3a8a; color: white; padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span>💬 Hộp thư Tư vấn Khách hàng</span>
                    <span onclick="togglePCChat()" style="cursor: pointer; font-size: 16px;">&times;</span>
                </div>
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <div id="dsKhachHangChat" style="width: 140px; border-right: 1px solid #cbd5e1; background: #f8fafc; overflow-y: auto; font-size: 11px;"></div>
                    <div style="flex: 1; display: flex; flex-direction: column; background: #fff;">
                        <div id="tieuDeChatPK" style="padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0; background: #f1f5f9; font-size: 11px; color: #1e293b;">Chọn khách hàng</div>
                        <div id="boxTinNhanPK" style="flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; font-size: 12px;"></div>
                        <div style="display: flex; padding: 6px; border-top: 1px solid #e2e8f0; gap: 5px; background: #f8fafc; align-items: center;">
                            <label style="cursor: pointer; font-size: 18px;" title="Gửi ảnh">📷<input type="file" id="inputAnhPC" accept="image/*" style="display:none" onchange="guiAnhNhanVien(this)"></label>
                            <input type="text" id="inputChatPK" placeholder="Nhập nội dung..." style="flex: 1; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; font-size: 12px;" autocomplete="off">
                            <button onclick="nhanVienGuiTinNhan()" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">Gửi</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', pcChatHTML);
        }
    } catch(err) {
        console.log("Lỗi khởi tạo Chat:", err);
    }
}

function doiPhongKhamChat(mapk) {
    selectedPhongKhamChat = mapk;
    taiTinNhanMobile();
}

function chuanHoaMaPK(mpk) {
    return mpk ? mpk.toString().replace(/[_]/g, '').trim().toLowerCase() : '';
}

// --- LOGIC CHO CHỦ NUÔI ---
function toggleMobileChat() {
    const win = document.getElementById('mobileChatWindow');
    if (!win) return;
    const isOpen = win.style.display === 'flex';
    win.style.display = (isOpen ? 'none' : 'flex');
    if (!isOpen) {
        setTimeout(taiTinNhanMobile, 100);
    }
}

async function taiTinNhanMobile() {
    if (typeof db === 'undefined') return;
    const ownerData = JSON.parse(sessionStorage.getItem('currentPetOwner')) || JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const sdt = ownerData?.sodienthoai || ownerData?.sodienthoai_chunuoi || ownerData?.sdt || ownerData?.sodienthoaikhachhang || "0935778727"; 
    
    const selectEl = document.getElementById('selectPhongKhamChat');
    if (selectEl && selectEl.value) {
        selectedPhongKhamChat = selectEl.value;
    }
    const mpk = selectedPhongKhamChat || "PK_617723"; 
    const cleanMpk = chuanHoaMaPK(mpk);

    const { data } = await db.from('tin_nhan').select('*').eq('sodienthoai_chunuoi', sdt).order('created_at', { ascending: true });
    const box = document.getElementById('boxTinNhanMobile');
    if(box) {
        box.innerHTML = '';
        if (data && data.length > 0) {
            const filteredData = data.filter(m => chuanHoaMaPK(m.maphongkham) === cleanMpk);
            filteredData.forEach(m => hienThiTinNhanMobileUI(m));
        }
        box.scrollTop = box.scrollHeight;
    }
}

async function guiTinNhanMobile() {
    const input = document.getElementById('inputChatMobile');
    if (!input) return;
    const noiDung = input.value.trim();
    if (!noiDung) return;
    
    const ownerData = JSON.parse(sessionStorage.getItem('currentPetOwner')) || JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const sdt = ownerData?.sodienthoai || ownerData?.sodienthoai_chunuoi || ownerData?.sdt || ownerData?.sodienthoaikhachhang || "0935778727"; 
    const mpk = selectedPhongKhamChat || "PK_617723";
    const tenNguoiGui = ownerData?.hovaten || ownerData?.tentaikhoan || "Chủ nuôi";

    await db.from('tin_nhan').insert([{ 
        maphongkham: mpk, 
        sodienthoai_chunuoi: sdt, 
        nguoi_gui: 'chunuoi', 
        ten_nguoi_gui: tenNguoiGui,
        noi_dung: noiDung, 
        hinhanh: null 
    }]);
    input.value = '';
    taiTinNhanMobile();
}

async function guiAnhMobile(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const ownerData = JSON.parse(sessionStorage.getItem('currentPetOwner')) || JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const sdt = ownerData?.sodienthoai || ownerData?.sodienthoai_chunuoi || ownerData?.sdt || ownerData?.sodienthoaikhachhang || "0935778727"; 
    const mpk = selectedPhongKhamChat || "PK_617723";

    const fileName = `chat_${Date.now()}_${file.name}`;
    const { error } = await db.storage.from('chat_images').upload(fileName, file);
    if (error) { alert('Lỗi tải ảnh lên Storage!'); return; }

    const { data: urlData } = db.storage.from('chat_images').getPublicUrl(fileName);
    await db.from('tin_nhan').insert([{ 
        maphongkham: mpk, 
        sodienthoai_chunuoi: sdt, 
        nguoi_gui: 'chunuoi', 
        noi_dung: '[Hình ảnh]', 
        hinhanh: urlData.publicUrl 
    }]);
    input.value = '';
    taiTinNhanMobile();
}

function hienThiTinNhanMobileUI(msg) {
    const box = document.getElementById('boxTinNhanMobile');
    if (!box) return;
    const div = document.createElement('div');
    const isMe = msg.nguoi_gui === 'chunuoi';
    
    let content = msg.hinhanh ? `<img src="${msg.hinhanh}" style="max-width:100%; border-radius:6px; cursor:pointer;" onclick="window.open('${msg.hinhanh}')"/>` : msg.noi_dung;
    let labelNguoiGui = (!isMe && msg.ten_nguoi_gui) ? `<div style="font-size: 9px; color: #475569; margin-bottom: 2px; font-weight: bold;">🏥 ${msg.ten_nguoi_gui}</div>` : '';
    
    div.style.cssText = `max-width: 85%; padding: 6px 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; ${isMe ? 'background: #0d9488; color: white; align-self: flex-end; margin-left: auto;' : 'background: #e2e8f0; color: #1e293b; align-self: flex-start;'}`;
    div.innerHTML = `${labelNguoiGui}<div>${content}</div>`;
    box.appendChild(div);
}

// --- LOGIC CHO QUẢN LÝ PHÒNG KHÁM (NHÂN VIÊN) ---
function togglePCChat() {
    const win = document.getElementById('pcChatWindow');
    if (!win) return;
    const isOpen = win.style.display === 'flex';
    win.style.display = (isOpen ? 'none' : 'flex');
    
    if (!isOpen) {
        taiDanhSachKhachHangChat();
        hienThiCanhBaoTinNhanMoi(false);
    }
}

async function taiDanhSachKhachHangChat() {
    if (typeof db === 'undefined') return;
    const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723"; 
    const cleanCurrentPK = chuanHoaMaPK(mapk);
    
    const { data: dsKhachHang } = await db.from('khachhang').select('*');
    const { data: listMsg } = await db.from('tin_nhan').select('maphongkham, sodienthoai_chunuoi, created_at').order('created_at', { ascending: false });
    
    let dsSdtDaNhantin = [];
    if (listMsg && listMsg.length > 0) {
        const filteredMsgs = listMsg.filter(m => chuanHoaMaPK(m.maphongkham) === cleanCurrentPK);
        dsSdtDaNhantin = [...new Set(filteredMsgs.map(m => m.sodienthoai_chunuoi))];
    }

    const container = document.getElementById('dsKhachHangChat');
    if (!container) return;
    container.innerHTML = `<div style="padding: 6px 8px; font-weight: bold; background: #e2e8f0; color: #1e293b; font-size: 11px;">Khách của PK</div>`;

    if (!dsKhachHang || dsKhachHang.length === 0) {
        container.innerHTML += `<div style="padding: 8px; font-size: 10px; color: #64748b; text-align: center;">Chưa có khách hàng</div>`;
        return;
    }

    let danhSachHienThi = [];
    let daThemSdt = new Set();

    dsSdtDaNhantin.forEach(sdt => {
        const kh = dsKhachHang.find(k => (k.sodienthoai === sdt || k.sdt === sdt));
        if (kh) {
            danhSachHienThi.push(kh);
            daThemSdt.add(sdt);
        } else {
            danhSachHienThi.push({ hovaten: "Chủ nuôi", sodienthoai: sdt });
            daThemSdt.add(sdt);
        }
    });

    dsKhachHang.forEach(kh => {
        let sdtKH = kh.sodienthoai || kh.sdt;
        if (sdtKH && !daThemSdt.has(sdtKH)) {
            danhSachHienThi.push(kh);
            daThemSdt.add(sdtKH);
        }
    });

    danhSachHienThi.forEach(kh => {
        const sdt = kh.sodienthoai || kh.sdt || "";
        const ten = kh.hovaten || kh.ten || "Chủ nuôi";
        const item = document.createElement('div');
        item.style.cssText = `padding: 6px 8px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s;`;
        item.innerHTML = `<div style="font-weight: bold; font-size: 11px; color: #1e293b;">👤 ${ten}</div><div style="font-size: 10px; color: #0d9488; margin-top: 2px;">📞 ${sdt}</div>`;
        item.onclick = () => chonKhachHangChat(sdt, ten, item);
        container.appendChild(item);
    });
}

async function chonKhachHangChat(sdt, tenKhach, element) {
    sdtChuNuoiDangChon = sdt;
    document.querySelectorAll('#dsKhachHangChat > div:not(:first-child)').forEach(el => el.style.background = 'transparent');
    if (element) element.style.background = '#e2e8f0';
    const titleEl = document.getElementById('tieuDeChatPK');
    if (titleEl) titleEl.innerText = `${tenKhach} (${sdt})`;
    
    const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723";
    const cleanCurrentPK = chuanHoaMaPK(mapk);

    const { data } = await db.from('tin_nhan').select('*').eq('sodienthoai_chunuoi', sdt).order('created_at', { ascending: true });
    const box = document.getElementById('boxTinNhanPK');
    if(box) {
        box.innerHTML = '';
        if (data && data.length > 0) {
            const filteredData = data.filter(m => chuanHoaMaPK(m.maphongkham) === cleanCurrentPK);
            filteredData.forEach(m => hienThiTinNhanPCUI(m));
        }
        box.scrollTop = box.scrollHeight;
    }
}

async function nhanVienGuiTinNhan() {
    if (!sdtChuNuoiDangChon) { alert('Vui lòng chọn một khách hàng!'); return; }
    const input = document.getElementById('inputChatPK');
    if (!input) return;
    const noiDung = input.value.trim();
    if (!noiDung) return;

    const currentUsr = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723"; 
    const tenTaiKhoanGui = currentUsr?.tentaikhoan || currentUsr?.username || "Nhân viên";
    const vaiTroGui = currentUsr?.vaitro || "Nhân viên";

    await db.from('tin_nhan').insert([{ maphongkham: mapk, sodienthoai_chunuoi: sdtChuNuoiDangChon, nguoi_gui: 'nhanvien', ten_nguoi_gui: tenTaiKhoanGui, vai_tro_nguoi_gui: vaiTroGui, noi_dung: noiDung, hinhanh: null }]);
    input.value = '';
    chonKhachHangChat(sdtChuNuoiDangChon, document.getElementById('tieuDeChatPK').innerText.split(' (')[0], document.querySelector('#dsKhachHangChat div[style*="background: rgb(226, 232, 240)"]'));
}

async function guiAnhNhanVien(input) {
    if (!sdtChuNuoiDangChon) { alert('Chọn khách hàng trước khi gửi ảnh!'); input.value=''; return; }
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const currentUsr = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723"; 
    const tenTaiKhoanGui = currentUsr?.tentaikhoan || "Nhân viên";
    const vaiTroGui = currentUsr?.vaitro || "Nhân viên";

    const fileName = `chat_${Date.now()}_${file.name}`;
    const { error } = await db.storage.from('chat_images').upload(fileName, file);
    if (error) { alert('Lỗi tải ảnh lên Storage!'); return; }

    const { data: urlData } = db.storage.from('chat_images').getPublicUrl(fileName);
    await db.from('tin_nhan').insert([{ 
        maphongkham: mapk, 
        sodienthoai_chunuoi: sdtChuNuoiDangChon, 
        nguoi_gui: 'nhanvien', 
        ten_nguoi_gui: tenTaiKhoanGui, 
        vai_tro_nguoi_gui: vaiTroGui, 
        noi_dung: '[Hình ảnh]', 
        hinhanh: urlData.publicUrl 
    }]);
    input.value = '';
    chonKhachHangChat(sdtChuNuoiDangChon, document.getElementById('tieuDeChatPK').innerText.split(' (')[0], document.querySelector('#dsKhachHangChat div[style*="background: rgb(226, 232, 240)"]'));
}

function hienThiTinNhanPCUI(msg) {
    const box = document.getElementById('boxTinNhanPK');
    if(!box) return;
    const div = document.createElement('div');
    const laNhanVienGui = msg.nguoi_gui === 'nhanvien';
    
    let content = msg.hinhanh ? `<img src="${msg.hinhanh}" style="max-width:100%; border-radius:6px; cursor:pointer;" onclick="window.open('${msg.hinhanh}')"/>` : msg.noi_dung;
    let labelNguoiGui = (laNhanVienGui && msg.ten_nguoi_gui) ? `<div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px; font-weight: bold;">👨‍⚕️ ${msg.ten_nguoi_gui}</div>` : '';
    
    div.style.cssText = `max-width: 80%; padding: 6px 10px; border-radius: 8px; font-size: 12px; ${laNhanVienGui ? 'background: #2563eb; color: white; align-self: flex-end; margin-left: auto;' : 'background: #e2e8f0; color: #1e293b; align-self: flex-start;'}`;
    div.innerHTML = `${labelNguoiGui}<div>${content}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function kiemTraTinNhanChuaDocBanDau() {
    if (typeof db === 'undefined' || isThucSuChuNuoi) return;
    const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723";
    const cleanCurrentPK = chuanHoaMaPK(mapk);

    const { data } = await db.from('tin_nhan').select('maphongkham, nguoi_gui').order('created_at', { ascending: false });
    if (data && data.length > 0) {
        const lastMsg = data.find(m => chuanHoaMaPK(m.maphongkham) === cleanCurrentPK);
        if (lastMsg && lastMsg.nguoi_gui === 'chunuoi') {
            hienThiCanhBaoTinNhanMoi(true);
        }
    }
}

function hienThiCanhBaoTinNhanMoi(hien) {
    const badge = document.getElementById('chatBadgeAlert');
    if (badge) {
        badge.style.display = hien ? 'block' : 'none';
    }
}

// --- LẮNG NGHE REALTIME ---
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof db !== 'undefined' && db.channel) {
            const mapk = window.getMaPhongKham() || sessionStorage.getItem('maphongkham') || "PK_617723";
            const cleanCurrentPK = chuanHoaMaPK(mapk);
            
            if (isThucSuChuNuoi) {
                db.channel('realtime-chat-mobile-global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tin_nhan' }, payload => {
                    const win = document.getElementById('mobileChatWindow');
                    const mPK = chuanHoaMaPK(payload.new.maphongkham);
                    const selectEl = document.getElementById('selectPhongKhamChat');
                    const currentSelected = selectEl ? chuanHoaMaPK(selectEl.value) : '';

                    if (win && win.style.display === 'flex' && mPK === currentSelected) {
                        hienThiTinNhanMobileUI(payload.new);
                        const box = document.getElementById('boxTinNhanMobile');
                        if (box) box.scrollTop = box.scrollHeight;
                    }
                }).subscribe();
            } else {
                db.channel('realtime-chat-pc-global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tin_nhan' }, payload => {
                    const win = document.getElementById('pcChatWindow');
                    const mPK = chuanHoaMaPK(payload.new.maphongkham);
                    
                    if (mPK === cleanCurrentPK) {
                        const isStaffSend = payload.new.nguoi_gui === 'nhanvien';

                        if (!isStaffSend) {
                            if (!win || win.style.display !== 'flex' || sdtChuNuoiDangChon !== payload.new.sodienthoai_chunuoi) {
                                hienThiCanhBaoTinNhanMoi(true);
                            }
                        }

                        if (win && win.style.display === 'flex') {
                            if (sdtChuNuoiDangChon && payload.new.sodienthoai_chunuoi === sdtChuNuoiDangChon) {
                                hienThiTinNhanPCUI(payload.new);
                            }
                            taiDanhSachKhachHangChat();
                        }
                    }
                }).subscribe();
            }
        }
    }, 1000);
});
