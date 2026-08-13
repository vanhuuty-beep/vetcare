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

function formatMaKham(id) { return `KB${layMaPhongKhamHienTai()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`; }
function formatMaThuCung(id) { return `TC${layMaPhongKhamHienTai()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`; }
function formatMaKhachHang(id) { return `KH${layMaPhongKhamHienTai()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`; }
function formatTien(value) { return (value == null ? 0 : Number(value)).toLocaleString('vi-VN') + " đ"; }

(function() {
    window.getMaPhongKham = function() {
        return sessionStorage.getItem('maphongkham') || '';
    };

    window.kiemTraDangNhapPhongKham = function() {
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

// Cấu hình Crisp
const isChuNuoiPage = window.location.href.includes('chunuoi') || window.location.href.includes('/mb/');
if (!isChuNuoiPage) {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "ac702dfb-845a-4289-b891-a83f4c413eb5";
    (function() {
        var d = document;
        var s = d.createElement("script");
        s.src = "https://client.crisp.chat/l.js";
        s.async = 1;
        d.getElementsByTagName("head")[0].appendChild(s);
    })();
}

window.addEventListener('load', function() {
    khoiTaoNutChatNoiHeThong();
    kiemTraTinNhanChuaDocBanDau();
});


/**
 * ==========================================
 * KHỞI TẠO GIAO DIỆN CHAT NỔI (ĐÃ SỬA LỖI HIỂN THỊ)
 * ==========================================
 */
let selectedPhongKhamChat = null;

async function khoiTaoNutChatNoiHeThong() {
    const isMobilePortal = isChuNuoiPage || window.innerWidth <= 768;

    if (isMobilePortal) {
        if (document.getElementById('floatingChatBtn') !== null) return;
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
        const sdt = currentUser?.sodienthoai || "0935778727";
        
        const { data: dsThuCung } = await db.from('thucung').select('maphongkham').eq('sodienthoai', sdt);
        const mapkList = [...new Set(dsThuCung?.map(t => t.maphongkham) || [])];
        
        const { data: dsPK } = await db.from('chupk').select('maphongkham, tenphongkham').in('maphongkham', mapkList.length ? mapkList : ['PK_617723']);
        selectedPhongKhamChat = dsPK?.[0]?.maphongkham || "PK_617723";

        let pkOptionsHTML = dsPK?.map(pk => `<option value="${pk.maphongkham}" ${pk.maphongkham === selectedPhongKhamChat ? 'selected' : ''}>${pk.tenphongkham || pk.maphongkham}</option>`).join('') || '<option value="PK_617723">Phòng khám mặc định</option>';

        const mobileChatHTML = `
        <div id="floatingChatBtn" onclick="toggleMobileChat()" style="position: fixed; bottom: 80px; right: 25px; background: #0d9488; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; z-index: 99998;">💬</div>

        <div id="mobileChatWindow" style="display: none; position: fixed; bottom: 135px; right: 20px; width: 300px; max-width: 90vw; height: 410px; background: #fff; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 99999; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif; border: 1px solid #cbd5e1;">
            <div style="background: #0d9488; color: white; padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                <span>💬 Trò chuyện với Phòng khám</span>
                <span onclick="toggleMobileChat()" style="cursor: pointer; font-size: 16px;">&times;</span>
            </div>
            <div style="padding: 6px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                <select id="selectPhongKhamChat" onchange="doiPhongKhamChat(this.value)" style="width: 100%; padding: 4px; font-size: 11px; border-radius: 4px; border: 1px solid #cbd5e1;">
                    ${pkOptionsHTML}
                </select>
            </div>
            <div id="boxTinNhanMobile" style="flex: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; background: #f8fafc;"></div>
            <div style="display: flex; padding: 8px; background: #fff; border-top: 1px solid #cbd5e1; gap: 5px; align-items: center;">
                <label style="cursor: pointer; font-size: 18px;" title="Gửi ảnh">📷<input type="file" id="inputAnhMobile" accept="image/*" style="display:none" onchange="guiAnhChuNuoi(this)"></label>
                <input type="text" id="inputChatMobile" placeholder="Nhắn tin..." style="flex: 1; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 12px;" autocomplete="off">
                <button onclick="chuNuoiGuiTinNhan()" style="background: #0d9488; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Gửi</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', mobileChatHTML);

    } else {
        if (document.getElementById('floatingPCChatBtn') !== null) return;
        const pcChatHTML = `
        <div id="floatingPCChatBtn" onclick="togglePCChat()" style="position: fixed; bottom: 20px; right: 85px; background: #2563eb; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer; z-index: 99998; transition: transform 0.2s;" title="Hộp thư tư vấn">
            💬
            <span id="chatBadgeAlert" style="display: none; position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; width: 20px; height: 20px; border-radius: 50%; align-items: center; justify-content: center; border: 2px solid white;">!</span>
        </div>

        <div id="pcChatWindow" style="display: none; position: fixed; bottom: 80px; right: 20px; width: 580px; max-width: 95vw; height: 420px; background: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index: 99999; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif; border: 1px solid #cbd5e1;">
            <div style="background: #1e3a8a; color: white; padding: 10px 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span>💬 Hộp thư Tư vấn Khách hàng</span>
                <span onclick="togglePCChat()" style="cursor: pointer; font-size: 18px;">&times;</span>
            </div>
            <div style="display: flex; flex: 1; overflow: hidden;">
                <div id="dsKhachHangChat" style="width: 180px; border-right: 1px solid #cbd5e1; background: #f8fafc; overflow-y: auto;"></div>
                <div style="flex: 1; display: flex; flex-direction: column; background: #fff;">
                    <div id="tieuDeChatPK" style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; background: #f1f5f9; font-size: 12px; color: #1e293b;">Chọn khách hàng</div>
                    <div id="boxTinNhanPK" style="flex: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;"></div>
                    <div style="display: flex; padding: 8px; border-top: 1px solid #e2e8f0; gap: 6px; background: #f8fafc; align-items: center;">
                        <label style="cursor: pointer; font-size: 18px;" title="Gửi ảnh">📷<input type="file" id="inputAnhPC" accept="image/*" style="display:none" onchange="guiAnhNhanVien(this)"></label>
                        <input type="text" id="inputChatPK" placeholder="Nhập nội dung tư vấn..." style="flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 12px;" autocomplete="off">
                        <button onclick="nhanVienGuiTinNhan()" style="background: #2563eb; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Gửi</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', pcChatHTML);
    }
}

async function kiemTraTinNhanChuaDocBanDau() {
    if (isChuNuoiPage) return;
    const mapk = window.getMaPhongKham() || "PK_617723";
    const { data } = await db.from('tin_nhan').select('nguoi_gui').eq('maphongkham', mapk).order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0 && data[0].nguoi_gui === 'chunuoi') {
        hienThiCanhBaoTinNhanMoi(true);
    }
}

function hienThiCanhBaoTinNhanMoi(hien) {
    const badge = document.getElementById('chatBadgeAlert');
    if (badge) {
        badge.style.display = hien ? 'flex' : 'none';
    }
}

function doiPhongKhamChat(mapk) {
    selectedPhongKhamChat = mapk;
    taiTinNhanMobile();
}

function toggleMobileChat() {
    const win = document.getElementById('mobileChatWindow');
    win.style.display = (win.style.display === 'flex' ? 'none' : 'flex');
    if (win.style.display === 'flex') taiTinNhanMobile();
}

async function taiTinNhanMobile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const sdt = currentUser?.sodienthoai || "0935778727"; 
    const mpk = selectedPhongKhamChat || "PK_617723"; 

    const { data } = await db.from('tin_nhan').select('*').eq('maphongkham', mpk).eq('sodienthoai_chunuoi', sdt).order('created_at', { ascending: true });
    const box = document.getElementById('boxTinNhanMobile');
    if(box) {
        box.innerHTML = '';
        data?.forEach(m => hienThiTinNhanMobileUI(m));
    }
}

async function chuNuoiGuiTinNhan() {
    const input = document.getElementById('inputChatMobile');
    const noiDung = input.value.trim();
    if (!noiDung) return;
    
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const sdt = currentUser?.sodienthoai || "0935778727"; 
    const mpk = selectedPhongKhamChat || "PK_617723";

    await db.from('tin_nhan').insert([{ maphongkham: mpk, sodienthoai_chunuoi: sdt, nguoi_gui: 'chunuoi', noi_dung: noiDung, hinhanh: null }]);
    input.value = '';
}

async function guiAnhChuNuoi(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const sdt = JSON.parse(sessionStorage.getItem('currentUser'))?.sodienthoai || "0935778727"; 
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
}

function hienThiTinNhanMobileUI(msg) {
    const box = document.getElementById('boxTinNhanMobile');
    if (!box) return;
    const div = document.createElement('div');
    const isOwner = msg.nguoi_gui === 'chunuoi';
    
    let content = msg.hinhanh ? `<img src="${msg.hinhanh}" style="max-width:100%; border-radius:6px; cursor:pointer;" onclick="window.open('${msg.hinhanh}')"/>` : msg.noi_dung;
    let labelNguoiGui = (!isOwner && msg.ten_nguoi_gui) ? `<div style="font-size: 9px; color: #475569; margin-bottom: 2px; font-weight: bold;">🏥 ${msg.ten_nguoi_gui}</div>` : '';
    
    div.style.cssText = `max-width: 85%; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; line-height: 1.4; ${isOwner ? 'background: #0d9488; color: white; align-self: flex-end; margin-left: auto;' : 'background: #e2e8f0; color: #1e293b; align-self: flex-start;'}`;
    div.innerHTML = `${labelNguoiGui}<div>${content}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function togglePCChat() {
    const win = document.getElementById('pcChatWindow');
    const isOpen = win.style.display === 'flex';
    win.style.display = (isOpen ? 'none' : 'flex');
    
    if (!isOpen) {
        taiDanhSachKhachHangChat();
        hienThiCanhBaoTinNhanMoi(false);
    }
}

let sdtChuNuoiDangChon = null;

async function taiDanhSachKhachHangChat() {
    const mapk = window.getMaPhongKham() || "PK_617723"; 
    const { data: listMsg } = await db.from('tin_nhan').select('sodienthoai_chunuoi, noi_dung, created_at').eq('maphongkham', mapk).order('created_at', { ascending: false });
    if (!listMsg) return;
    const dsSdt = [...new Set(listMsg.map(m => m.sodienthoai_chunuoi))];
    const { data: dsKhachHang } = await db.from('khachhang').select('*').in('sodienthoai', dsSdt);
    const container = document.getElementById('dsKhachHangChat');
    if(!container) return;
    container.innerHTML = `<div style="padding: 8px 10px; font-weight: bold; background: #e2e8f0; color: #1e293b; font-size: 11px;">Khách của PK</div>`;
    dsSdt.forEach(sdt => {
        const khInfo = dsKhachHang?.find(k => k.sodienthoai === sdt) || {};
        const item = document.createElement('div');
        item.style.cssText = `padding: 8px 10px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s;`;
        item.innerHTML = `<div style="font-weight: bold; font-size: 12px; color: #1e293b;">👤 ${khInfo.hovaten || "Chủ nuôi"}</div><div style="font-size: 10px; color: #0d9488; margin-top: 2px;">📞 ${sdt}</div>`;
        item.onclick = () => chonKhachHangChat(sdt, khInfo.hovaten || "Chủ nuôi", item);
        container.appendChild(item);
    });
}

async function chonKhachHangChat(sdt, tenKhach, element) {
    sdtChuNuoiDangChon = sdt;
    document.querySelectorAll('#dsKhachHangChat > div:not(:first-child)').forEach(el => el.style.background = 'transparent');
    element.style.background = '#e2e8f0';
    document.getElementById('tieuDeChatPK').innerText = `${tenKhach} (${sdt})`;
    
    const mapk = window.getMaPhongKham() || "PK_617723";
    const { data } = await db.from('tin_nhan').select('*').eq('maphongkham', mapk).eq('sodienthoai_chunuoi', sdt).order('created_at', { ascending: true });
    const box = document.getElementById('boxTinNhanPK');
    if(box) {
        box.innerHTML = '';
        data?.forEach(m => hienThiTinNhanPCUI(m));
    }
}

async function nhanVienGuiTinNhan() {
    if (!sdtChuNuoiDangChon) { alert('Vui lòng chọn một khách hàng!'); return; }
    const input = document.getElementById('inputChatPK');
    const noiDung = input.value.trim();
    if (!noiDung) return;

    const currentUsr = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const mapk = window.getMaPhongKham() || "PK_617723"; 
    const tenTaiKhoanGui = currentUsr?.tentaikhoan || currentUsr?.username || "Nhân viên";
    const vaiTroGui = currentUsr?.vaitro || "Nhân viên";

    await db.from('tin_nhan').insert([{ maphongkham: mapk, sodienthoai_chunuoi: sdtChuNuoiDangChon, nguoi_gui: 'nhanvien', ten_nguoi_gui: tenTaiKhoanGui, vai_tro_nguoi_gui: vaiTroGui, noi_dung: noiDung, hinhanh: null }]);
    input.value = '';
}

async function guiAnhNhanVien(input) {
    if (!sdtChuNuoiDangChon) { alert('Chọn khách hàng trước khi gửi ảnh!'); input.value=''; return; }
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const currentUsr = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    const mapk = window.getMaPhongKham() || "PK_617723"; 
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
}

function hienThiTinNhanPCUI(msg) {
    const box = document.getElementById('boxTinNhanPK');
    if(!box) return;
    const div = document.createElement('div');
    const laNhanVienGui = msg.nguoi_gui === 'nhanvien';
    
    let content = msg.hinhanh ? `<img src="${msg.hinhanh}" style="max-width:100%; border-radius:6px; cursor:pointer;" onclick="window.open('${msg.hinhanh}')"/>` : msg.noi_dung;
    let labelNguoiGui = (laNhanVienGui && msg.ten_nguoi_gui) ? `<div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px; font-weight: bold;">👨‍⚕️ ${msg.ten_nguoi_gui}</div>` : '';
    
    div.style.cssText = `max-width: 80%; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; ${laNhanVienGui ? 'background: #2563eb; color: white; align-self: flex-end; margin-left: auto;' : 'background: #e2e8f0; color: #1e293b; align-self: flex-start;'}`;
    div.innerHTML = `${labelNguoiGui}<div>${content}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof db !== 'undefined' && db.channel) {
            const mapk = window.getMaPhongKham() || "PK_617723";
            
            db.channel('realtime-chat-pc-global').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tin_nhan', filter: `maphongkham=eq.${mapk}` }, payload => {
                const win = document.getElementById('pcChatWindow');
                const isStaffSend = payload.new.nguoi_gui === 'nhanvien';

                if (!isStaffSend) {
                    if (win.style.display !== 'flex' || sdtChuNuoiDangChon !== payload.new.sodienthoai_chunuoi) {
                        hienThiCanhBaoTinNhanMoi(true);
                    }
                }

                if (win && win.style.display === 'flex') {
                    if (sdtChuNuoiDangChon && payload.new.sodienthoai_chunuoi === sdtChuNuoiDangChon) {
                        hienThiTinNhanPCUI(payload.new);
                    }
                    taiDanhSachKhachHangChat();
                }
            }).subscribe();
        }
    }, 1000);
});
