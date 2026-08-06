let globalSearchData = [];
let isSearchDataLoaded = false;

// Tải sẵn dữ liệu ngầm ngay khi file vừa chạy
async function preloadSmartSearchData() {
    if (isSearchDataLoaded) return;
    try {
        globalSearchData = [];

        // 1. Tải khách hàng
        const { data: khachHangList, error: errKH } = await db.from('khachhang').select('*');
        if (!errKH && khachHangList) {
            khachHangList.forEach(kh => {
                const tenKH = kh.hovaten || kh.ten || 'Không tên';
                const sdtKH = kh.sodienthoai || kh.sdt || '---';
                const maKH = kh.id ? 'KH' + String(kh.id).padStart(4, '0') : '';

                globalSearchData.push({
                    loai: 'khachhang',
                    id: kh.id,
                    maHienThi: maKH,
                    tenGoc: tenKH,
                    tieuDe: `${tenKH} - SĐT: ${sdtKH}`,
                    phu: `Mã KH: ${maKH}`,
                    tuKhoaTim: `${tenKH} ${sdtKH} ${maKH}`
                });
            });
        }

        // 2. Tải thú cưng
        const { data: petList, error: errPet } = await db.from('thucung').select('*');
        if (!errPet && petList) {
            let mapKH = {};
            if (khachHangList) {
                khachHangList.forEach(kh => { mapKH[kh.id] = kh.hovaten || kh.ten; });
            }

            petList.forEach(pet => {
                const tenPet = pet.tenthucung || pet.ten || 'Thú cưng';
                const giongPet = pet.giong ? `(${pet.giong})` : '';
                const maPet = pet.id ? 'PET' + String(pet.id).padStart(4, '0') : '';
                const tenChu = (pet.makhachhang && mapKH[pet.makhachhang]) ? mapKH[pet.makhachhang] : '---';

                globalSearchData.push({
                    loai: 'thucung',
                    id: pet.id,
                    maHienThi: maPet,
                    tenGoc: tenPet,
                    tieuDe: `${tenPet} ${giongPet}`,
                    phu: `Mã Pet: ${maPet} | Chủ: ${tenChu}`,
                    tuKhoaTim: `${tenPet} ${giongPet} ${maPet} ${tenChu}`
                });
            });
        }
        isSearchDataLoaded = true;
    } catch (err) {
        console.error('Lỗi tải dữ liệu tìm kiếm:', err);
    }
}

function initSmartSearch(inputId, dropdownId) {
    const inputElem = document.getElementById(inputId);
    const dropdownElem = document.getElementById(dropdownId);
    
    if (!inputElem || !dropdownElem) return;

    inputElem.addEventListener('focus', preloadSmartSearchData);

    inputElem.addEventListener('input', async function() {
        if (!isSearchDataLoaded) {
            await preloadSmartSearchData();
        }

        const val = chuanHoaSearch(this.value.trim());
        if (val.length === 0) {
            dropdownElem.style.display = 'none';
            return;
        }

        const ketQua = globalSearchData.filter(item => chuanHoaSearch(item.tuKhoaTim).includes(val));

        if (ketQua.length === 0) {
            dropdownElem.innerHTML = `<div style="padding: 12px; text-align: center; color: #64748b; font-size: 13px;">Không tìm thấy kết quả phù hợp</div>`;
            dropdownElem.style.display = 'block';
            return;
        }

        let html = '';
        ketQua.forEach(item => {
            // Truyền cả mã hiển thị và tên gốc vào hàm chuyển trang
            if (item.loai === 'khachhang') {
                html += `
                    <div class="search-item" onclick="chonKetQuaChuyenTrang('${item.maHienThi}', '${encodeURIComponent(item.tenGoc)}', 'khachhang')">
                        <div>
                            <div style="font-weight: 600; font-size: 13px; color: #1e293b;">${item.tieuDe}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.phu}</div>
                        </div>
                        <span class="badge-kh">Khách Hàng</span>
                    </div>`;
            } else {
                html += `
                    <div class="search-item" onclick="chonKetQuaChuyenTrang('${item.maHienThi}', '${encodeURIComponent(item.tenGoc)}', 'thucung')">
                        <div>
                            <div style="font-weight: 600; font-size: 13px; color: #1e293b;">🐾 ${item.tieuDe}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.phu}</div>
                        </div>
                        <span class="badge-pet">Thú Cưng</span>
                    </div>`;
            }
        });

        dropdownElem.innerHTML = html;
        dropdownElem.style.display = 'block';
    });

    document.addEventListener('click', function(e) {
        if (!inputElem.contains(e.target) && !dropdownElem.contains(e.target)) {
            dropdownElem.style.display = 'none';
        }
    });
}

function chuanHoaSearch(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function chonKetQuaChuyenTrang(maDinhDanh, tenGoc, loai) {
    document.getElementById('searchDropdown').style.display = 'none';
    document.getElementById('globalSearchInput').value = '';

    // 1. Lấy tên file của trang hiện tại đang mở (ví dụ: khambenh.html, nhatkylamvaccine.html,...)
    let pathName = window.location.pathname;
    let trangHienTai = pathName.substring(pathName.lastIndexOf('/') + 1) || 'index.html';

    let trangDich = trangHienTai;

    // 2. Nếu đang ở trang chủ hoặc trang trống, mới chuyển về trang danh sách mặc định
    if (trangHienTai === '' || trangHienTai === 'index.html' || trangHienTai === 'trangchu.html') {
        trangDich = (loai === 'khachhang') ? 'khachhang.html' : 'thucung.html';
    }

    // 3. Giữ nguyên trang hiện tại và truyền tham số tìm kiếm để tự động lọc bảng
    window.location.href = `${trangDich}?search=${tenGoc}&highlight=${maDinhDanh}`;
}

// Tự động khởi chạy khi load trang
window.addEventListener('DOMContentLoaded', () => {
    initSmartSearch('globalSearchInput', 'searchDropdown');
    preloadSmartSearchData(); 

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        // Tự động tìm ô input tìm kiếm riêng của trang hiện tại và điền tên vào để lọc bảng
        setTimeout(() => {
            const pageSearchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
            pageSearchInputs.forEach(input => {
                if (input.id !== 'globalSearchInput') {
                    input.value = decodeURIComponent(searchQuery);
                    input.dispatchEvent(new Event('input'));
                    input.dispatchEvent(new Event('keyup'));
                }
            });
        }, 300);
    }

    // Hiệu ứng nháy sáng dòng dữ liệu khớp mã
    const highlightCode = urlParams.get('highlight');
    if (highlightCode) {
        setTimeout(() => {
            const allRows = document.querySelectorAll('table tbody tr');
            let targetRow = null;
            allRows.forEach(row => {
                if (row.innerText.includes(highlightCode)) {
                    targetRow = row;
                }
            });
            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetRow.classList.add('highlight-row');
                setTimeout(() => targetRow.classList.remove('highlight-row'), 2000);
            }
        }, 600);
    }
});