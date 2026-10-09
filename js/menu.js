document.addEventListener("DOMContentLoaded", function() {
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }

    if (!document.getElementById('font-awesome-cdn')) {
        const faLink = document.createElement('link');
        faLink.id = 'font-awesome-cdn';
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    const vaitroRaw = currentUser ? (currentUser.vaitro || currentUser.role || '') : '';
    const vaitro = vaitroRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    const tentaiKhoanHienTai = currentUser ? String(currentUser.tentaikhoan || currentUser.username || currentUser.sodienthoai || '').toLowerCase().trim() : '';
    const sdtHienTai = currentUser ? String(currentUser.sodienthoai || currentUser.sdt || '').trim() : '';
    const isHuuTy = (tentaiKhoanHienTai === 'huuty' || tentaiKhoanHienTai.includes('huuty') || sdtHienTai === '0935778727');

    const isTrueOwner = vaitro.includes('chủ phòng khám') || vaitro.includes('chu phong kham') || vaitro.includes('chupk');
    const isBacSi = vaitro.includes('bac si') || vaitro === 'bacsi';

    let isExpired = false;
    const ngayHetHanStr = currentUser?.ngayhethan || sessionStorage.getItem('ngayhethan');
    if (ngayHetHanStr) {
        if (new Date(ngayHetHanStr) < new Date()) {
            isExpired = true;
        }
    }

    if (isExpired) {
        if (isTrueOwner && !isHuuTy) {
            alert('⚠️ Tài khoản phòng khám của bạn đã hết hạn bản quyền! Hệ thống sẽ chuyển hướng đến trang thanh toán.');
            window.location.replace('../quanly/thanhtoan.html');
            return;
        } else if (!isHuuTy) {
            hienThiPopupGiaHanChoNhanVien();
        }
    }

    let heThongMenuHtml = `<li class="menu-category"><i class="fa-solid fa-shield-halved"></i> HỆ THỐNG</li>`;

    if (isHuuTy) {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-thongtinpk" onclick="window.location.href='thongtinphongkham.html'"><span><i class="fa-solid fa-hospital"></i></span> <span class="menu-text">Thông tin phòng khám</span></li>
            <li class="menu-item" id="menu-quanlyuser" onclick="window.location.href='quanlyuser.html'"><span><i class="fa-solid fa-user-shield"></i></span> <span class="menu-text">Quản lý nhân viên</span></li>
            <li class="menu-item" id="menu-thanhtoan" onclick="window.location.href='thanhtoan.html'"><span><i class="fa-solid fa-credit-card"></i></span> <span class="menu-text">Thanh toán & Gia hạn</span></li>
            <li class="menu-item" id="menu-quanlychung" onclick="window.location.href='quanlychung.html'">
                <span><i class="fa-solid fa-crown"></i></span> <span class="menu-text" style="font-weight: 700;">Quản lý chung (Hệ thống)</span>
            </li>
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span><i class="fa-solid fa-headset"></i></span> <span class="menu-text">Liên hệ</span></li>
        `;
    } else if (isTrueOwner) {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-thongtinpk" onclick="window.location.href='thongtinphongkham.html'"><span><i class="fa-solid fa-hospital"></i></span> <span class="menu-text">Thông tin phòng khám</span></li>
            <li class="menu-item" id="menu-quanlyuser" onclick="window.location.href='quanlyuser.html'"><span><i class="fa-solid fa-user-shield"></i></span> <span class="menu-text">Quản lý nhân viên</span></li>
            <li class="menu-item" id="menu-thanhtoan" onclick="window.location.href='thanhtoan.html'"><span><i class="fa-solid fa-credit-card"></i></span> <span class="menu-text">Thanh toán & Gia hạn</span></li>
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span><i class="fa-solid fa-headset"></i></span> <span class="menu-text">Liên hệ</span></li>
        `;
    } else {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span><i class="fa-solid fa-headset"></i></span> <span class="menu-text">Liên hệ</span></li>
        `;
    }

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    const ngayHienTai = now.toLocaleDateString('vi-VN', options);

    let dynamicMenuContent = '';
    dynamicMenuContent += `<li class="menu-item" id="menu-thongke" onclick="window.location.href='thongke.html'"><span><i class="fa-solid fa-chart-pie"></i></span> <span class="menu-text">Thống kê</span></li>`;

    dynamicMenuContent += `
        <li class="menu-item" id="menu-khachhang" onclick="window.location.href='khachhang.html'"><span><i class="fa-solid fa-users"></i></span> <span class="menu-text">Khách hàng</span></li>
        <li class="menu-item" id="menu-thucung" onclick="window.location.href='thucung.html'"><span><i class="fa-solid fa-paw"></i></span> <span class="menu-text">Thú cưng</span></li>
        <li class="menu-item" id="menu-lichhen" onclick="window.location.href='lichhen.html'"><span><i class="fa-solid fa-calendar-days"></i></span> <span class="menu-text">Lịch hẹn</span></li>
    `;

    if (isTrueOwner || isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle active-parent" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon"><i class="fa-solid fa-stethoscope"></i></span> <span class="menu-text">Khám & Điều trị</span></div> <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
            </li>
            <ul class="submenu-container open">
                <li class="menu-item" id="menu-khambenh" onclick="window.location.href='khambenh.html'"><span><i class="fa-solid fa-user-doctor"></i></span> <span class="menu-text">Khám bệnh</span></li>
                <li class="menu-item" id="menu-phieuchidinh" onclick="window.location.href='phieuchidinh.html'"><span><i class="fa-solid fa-file-medical"></i></span> <span class="menu-text">Chỉ định</span></li>
                <li class="menu-item" id="menu-donthuoc" onclick="window.location.href='donthuoc.html'"><span><i class="fa-solid fa-prescription"></i></span> <span class="menu-text">Đơn thuốc</span></li>
            </ul>
        `;
    }

    dynamicMenuContent += `
        <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
            <div class="menu-label-wrap"><span class="group-icon"><i class="fa-solid fa-boxes-stacked"></i></span> <span class="menu-text">Kho & Vắc-xin</span></div> <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
        </li>
        <ul class="submenu-container">
            <li class="menu-item" id="menu-khothuoc" onclick="window.location.href='khothuoc.html'"><span><i class="fa-solid fa-pills"></i></span> <span class="menu-text">Kho thuốc</span></li>
            <li class="menu-item" id="menu-khovaccine" onclick="window.location.href='khovaccine.html'"><span><i class="fa-solid fa-syringe"></i></span> <span class="menu-text">Kho vắc-xin</span></li>
            <li class="menu-item" id="menu-nhatkylamvaccine" onclick="window.location.href='nhatkylamvaccine.html'"><span><i class="fa-solid fa-clock-rotate-left"></i></span> <span class="menu-text">Nhật ký tiêm</span></li>
            <li class="menu-item" id="menu-dichvu" onclick="window.location.href='dichvu.html'"><span><i class="fa-solid fa-tags"></i></span> <span class="menu-text">Giá dịch vụ</span></li>
            <li class="menu-item" id="menu-dichvuchidinh" onclick="window.location.href='dichvuchidinh.html'">
                <span><i class="fa-solid fa-file-medical"></i></span> 
                <span class="menu-text">Giá dịch vụ chỉ định</span>
            </li>
        </ul>
        <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
            <div class="menu-label-wrap">
                <span class="group-icon"><i class="fa-solid fa-file-invoice-dollar"></i></span> 
                <span class="menu-text">Công nợ - Thu chi</span>
            </div> 
            <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
        </li> 
        <ul class="submenu-container">
            <li class="menu-item" id="menu-qlcongno" onclick="window.location.href='qlcongno.html'">
                <span><i class="fa-solid fa-user-tag"></i></span> 
                <span class="menu-text">Quản lý công nợ</span>
            </li>
            <li class="menu-item" id="menu-thuchi" onclick="window.location.href='thuchi.html'">
                <span><i class="fa-solid fa-wallet"></i></span> 
                <span class="menu-text">Thu chi phòng khám</span>
            </li>
        </ul>
    `;

    if (isTrueOwner || isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon"><i class="fa-solid fa-hotel"></i></span> <span class="menu-text">Quản lý Lưu trú</span></div> <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-noitru" onclick="window.location.href='noitru.html'"><span><i class="fa-solid fa-bed"></i></span> <span class="menu-text">Nội trú</span></li>
                <li class="menu-item" id="menu-nhatkynoitru" onclick="window.location.href='nhatkynoitru.html'"><span><i class="fa-solid fa-book-medical"></i></span> <span class="menu-text">Nhật ký nội trú</span></li>
            </ul>
        `;
    }

    if (!isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon"><i class="fa-solid fa-store"></i></span> <span class="menu-text">Petshop & Bán hàng</span></div> <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-danhmucsanpham" onclick="window.location.href='danhmucsanpham.html'"><span><i class="fa-solid fa-box-open"></i></span> <span class="menu-text">Sản phẩm</span></li>
                <li class="menu-item" id="menu-nhatkykho" onclick="window.location.href='nhatkykho.html'"><span><i class="fa-solid fa-clipboard-list"></i></span> <span class="menu-text">Nhật ký kho</span></li>
                <li class="menu-item" id="menu-donhang" onclick="window.location.href='donhang.html'"><span><i class="fa-solid fa-cart-shopping"></i></span> <span class="menu-text">Bán hàng</span></li>
                <li class="menu-item" id="menu-intem" onclick="window.location.href='intem.html'"><span><i class="fa-solid fa-print"></i></span> <span class="menu-text">In tem</span></li>
            </ul>
        `;
    }

    if (!isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></span> <span class="menu-text">Quản lý Spa</span></div> <span class="arrow"><i class="fa-solid fa-chevron-down"></i></span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-spa" onclick="window.location.href='spa.html'"><span><i class="fa-solid fa-bath"></i></span> <span class="menu-text">Bảng giá Spa</span></li>
                <li class="menu-item" id="menu-nhatkyspa" onclick="window.location.href='nhatkyspa.html'"><span><i class="fa-solid fa-scissors"></i></span> <span class="menu-text">Nhật ký Spa</span></li>
            </ul>
            <li class="menu-item" id="menu-khutrung" onclick="window.location.href='khutrung.html'">
                <span><i class="fa-solid fa-pump-soap"></i></span> 
                <span class="menu-text">Lịch sử khử trùng</span>
            </li>
            <li class="menu-item" id="menu-baocao" onclick="window.location.href='baocao.html'">
                <span><i class="fa-solid fa-chart-pie"></i></span> 
                <span class="menu-text">Báo cáo sử dụng thuốc</span>
            </li>
        `;
    }

    dynamicMenuContent += heThongMenuHtml;

    const mainThemeColor = '#0f172a';

    const menuHTML = `
    <div class="sidebar ${isExpired && !isHuuTy ? 'sidebar-frozen' : ''}" id="sidebar" style="background: ${mainThemeColor};">
        <div class="sidebar-header" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 20px; margin-right: 8px; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.15); border-radius: 8px; color: #60a5fa;"><i class="fa-solid fa-paw"></i></span> 
                    <span class="menu-text" style="font-weight: 800; font-size: 18px; letter-spacing: 0.5px; background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">VetCare Pro</span>
                </div>
            </div>
            <div id="sidebar-date" style="font-size: 11px; font-weight: 500; color: #94a3b8; padding-left: 2px; margin-top: 4px;">
                📅 ${ngayHienTai}
            </div>
        </div>
        
        <!-- NÚT BÁN HÀNG POS -->
        <li class="menu-item sub-item menu-pos-highlight" id="menu-pos" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='pos.html'"}">
            <span class="pos-icon"><i class="fa-solid fa-bolt"></i></span> 
            <span class="menu-text" style="font-weight: 700;">BÁN HÀNG POS</span>
            <span class="pos-badge">HOT</span>
        </li>

        <!-- MỤC TIẾP NHẬN KHÁCH & PET DẠNG MENU THƯỜNG, GỌN GÀNG -->
        <div style="padding: 2px 12px;">
            <li class="menu-item" id="menu-tiepnhan" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='tiepnhan.html'"}">
                <span><i class="fa-solid fa-user-plus" style="color: #0f766e;"></i></span> 
                <span class="menu-text" style="font-weight: 600;">Tiếp nhận khách & pet</span>
            </li>
        </div>
        
        <ul class="menu-list">
            ${dynamicMenuContent}
        </ul>
    </div>

    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <style>
        .sidebar {
            width: 275px !important;
            min-width: 275px !important;
            color: #f8fafc !important;
            box-shadow: 4px 0 25px rgba(0, 0, 0, 0.12);
            border-right: 1px solid rgba(255, 255, 255, 0.06);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, transform 0.3s ease;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .sidebar::-webkit-scrollbar { width: 5px; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }

        .sidebar-header {
            padding: 16px 14px 12px 14px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.15);
        }

        .sidebar .menu-category {
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #64748b;
            padding: 14px 14px 4px 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .sidebar ul.menu-list { list-style: none; padding: 6px 12px; margin: 0; }

        .sidebar .menu-item {
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            padding: 9px 12px;
            color: #94a3b8 !important;
            text-decoration: none;
            font-size: 12.5px !important;
            font-weight: 500 !important;
            border-radius: 8px;
            margin: 2px 0;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar .menu-item:hover {
            background-color: rgba(255, 255, 255, 0.06) !important;
            color: #f8fafc !important;
            transform: translateX(3px);
        }

        .sidebar .menu-item.active {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .sidebar .menu-item span.menu-text { display: inline-block !important; visibility: visible !important; opacity: 1 !important; }

        .sidebar .menu-list > li > span:first-child, 
        .submenu-container .menu-item span:first-child,
        #menu-tiepnhan span:first-child {
            display: inline-block;
            width: 22px;
            text-align: center;
            font-size: 13px !important;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .menu-dropdown-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 9px 12px;
            cursor: pointer;
            color: #94a3b8;
            font-weight: 600 !important;
            font-size: 12.5px !important;
            background: none !important;
            border: none !important;
            margin: 2px 0;
            border-radius: 8px;
            transition: all 0.2s ease;
            user-select: none;
            width: 100%;
            box-sizing: border-box;
        }
        .menu-dropdown-toggle:hover { background: rgba(255, 255, 255, 0.06) !important; color: #f8fafc; }
        .menu-dropdown-toggle .menu-label-wrap { display: flex; align-items: center; white-space: nowrap; overflow: hidden; gap: 10px; }
        .menu-dropdown-toggle .group-icon { display: inline-block; width: 22px; text-align: center; font-size: 13px !important; flex-shrink: 0; }
        .menu-dropdown-toggle .arrow { font-size: 9.5px; transition: transform 0.3s ease; flex-shrink: 0; margin-left: 6px; color: #64748b; }
        .menu-dropdown-toggle.active-parent .arrow { transform: rotate(180deg); color: #60a5fa; }
        .menu-dropdown-toggle.active-parent { color: #f8fafc; }

        .submenu-container {
            display: none;
            list-style: none;
            padding-left: 12px;
            margin: 2px 0 4px 0;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding-top: 4px;
            padding-bottom: 4px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .submenu-container.open { display: block; }
        .submenu-container .menu-item { padding: 8px 10px 8px 8px; font-size: 12px !important; margin: 2px 4px; }

        .menu-pos-highlight {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
            color: #ffffff !important;
            border-radius: 10px;
            margin: 12px 12px 4px 12px !important;
            padding: 10px 12px !important;
            box-shadow: 0 4px 16px rgba(2, 132, 199, 0.3);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .menu-pos-highlight:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .menu-pos-highlight .pos-icon { font-size: 14px; margin-right: 10px; }
        .menu-pos-highlight .pos-badge { background-color: #ef4444; color: white; font-size: 8.5px; padding: 2px 6px; border-radius: 5px; font-weight: 800; margin-left: auto; letter-spacing: 0.5px; }

        .sidebar-frozen { pointer-events: none; opacity: 0.65; filter: grayscale(30%); }

        .main-content {
            margin-left: 275px;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 100vh;
            background: #f8fafc;
        }

        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 999;
        }

        @media (max-width: 992px) {
            .sidebar {
                transform: translateX(-100%);
            }
            body.mobile-menu-open .sidebar {
                transform: translateX(0);
            }
            body.mobile-menu-open .sidebar-overlay {
                display: block;
            }
            .main-content {
                margin-left: 0 !important;
                width: 100% !important;
            }
        }

        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar { width: 70px !important; min-width: 70px !important; overflow: hidden; transform: translateX(0) !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .main-content { margin-left: 70px !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .menu-text,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .menu-category,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .arrow,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .pos-badge,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar #sidebar-date { display: none !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .submenu-container.open { display: none !important; }
    </style>`;

    const container = document.getElementById('menu-container');
    if (container) {
        container.innerHTML = menuHTML;
        
        if (isExpired && !isHuuTy) {
            const sidebarEl = document.getElementById('sidebar');
            if (sidebarEl) {
                sidebarEl.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isTrueOwner) {
                        window.location.href = '../quanly/thanhtoan.html';
                    } else {
                        hienThiPopupGiaHanChoNhanVien();
                    }
                }, true);
            }
        } else {
            const currentPage = window.location.pathname.split("/").pop();
            const activeItem = document.querySelector(`[onclick*='${currentPage}']`);
            if (activeItem) {
                activeItem.classList.add('active');
                const submenus = document.querySelectorAll('.submenu-container');
                submenus.forEach((sub) => {
                    if (sub.contains(activeItem)) {
                        sub.classList.add('open');
                        const toggleBtn = sub.previousElementSibling;
                        if (toggleBtn && toggleBtn.classList.contains('menu-dropdown-toggle')) {
                            toggleBtn.classList.add('active-parent');
                        }
                    }
                });
            }
        }
    }
});

function toggleSubmenu(element) {
    element.classList.toggle('active-parent');
    const submenu = element.nextElementSibling;
    if (submenu && submenu.classList.contains('submenu-container')) submenu.classList.toggle('open');
}

function toggleSidebar() {
    const body = document.body;
    if (window.innerWidth <= 992) {
        body.classList.toggle('mobile-menu-open');
    } else {
        body.classList.toggle('sidebar-collapsed');
        const isCollapsed = body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
    }
}
