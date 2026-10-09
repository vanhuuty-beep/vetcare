document.addEventListener("DOMContentLoaded", function() {
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }

    // Đảm bảo trang web đã nhúng Font Awesome
    if (!document.getElementById('font-awesome-cdn')) {
        const faLink = document.createElement('link');
        faLink.id = 'font-awesome-cdn';
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // Chuẩn hóa chuỗi vai trò
    const vaitroRaw = currentUser ? (currentUser.vaitro || currentUser.role || '') : '';
    const vaitro = vaitroRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    // Xác định tài khoản siêu quản lý hệ thống
    const tentaiKhoanHienTai = currentUser ? String(currentUser.tentaikhoan || currentUser.username || currentUser.sodienthoai || '').toLowerCase().trim() : '';
    const sdtHienTai = currentUser ? String(currentUser.sodienthoai || currentUser.sdt || '').trim() : '';
    const isHuuTy = (tentaiKhoanHienTai === 'huuty' || tentaiKhoanHienTai.includes('huuty') || sdtHienTai === '0935778727');

    const isTrueOwner = vaitro.includes('chủ phòng khám') || vaitro.includes('chu phong kham') || vaitro.includes('chupk');
    const isBacSi = vaitro.includes('bac si') || vaitro === 'bacsi';

    // --- LỚP PHONG TỎA & ĐIỀU HƯỚNG KHI HẾT HẠN ---
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

    // Xây dựng danh mục HỆ THỐNG theo phân quyền
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

    // Tông màu chủ đạo SaaS Deep Slate & Indigo tinh tế
    const mainThemeColor = '#0f172a';

    const menuHTML = `
    <div class="sidebar ${isExpired && !isHuuTy ? 'sidebar-frozen' : ''}" id="sidebar" style="background: ${mainThemeColor};">
        <div class="sidebar-header" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 22px; margin-right: 10px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(59, 130, 246, 0.15); border-radius: 10px; color: #60a5fa;"><i class="fa-solid fa-paw"></i></span> 
                    <span class="menu-text" style="font-weight: 800; font-size: 20px; letter-spacing: 0.5px; background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">VetCare Pro</span>
                </div>
            </div>
            <div id="sidebar-date" style="font-size: 11px; font-weight: 500; color: #94a3b8; padding-left: 2px; margin-top: 4px;">
                📅 ${ngayHienTai}
            </div>
        </div>
        
        <li class="menu-item sub-item menu-pos-highlight" id="menu-pos" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='pos.html'"}">
            <span class="pos-icon"><i class="fa-solid fa-bolt"></i></span> 
            <span class="menu-text" style="font-weight: 700;">BÁN HÀNG POS</span>
            <span class="pos-badge">HOT</span>
        </li>

        <!-- MỤC TIẾP NHẬN KHÁCH & PET MỚI BỔ SUNG -->
        <li class="menu-item" id="menu-tiepnhan" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='tiepnhan.html'"}">
            <span><i class="fa-solid fa-user-plus" style="color: #38bdf8;"></i></span> 
            <span class="menu-text" style="font-weight: 600;">Tiếp nhận khách & pet</span>
        </li>
        
        <ul class="menu-list">
            ${dynamicMenuContent}
        </ul>
    </div>

    <!-- Màn hình mờ khi mở menu trên mobile -->
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
            padding: 20px 16px 14px 16px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.15);
        }

        .sidebar .menu-category {
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #64748b;
            padding: 16px 16px 6px 16px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .sidebar ul.menu-list { list-style: none; padding: 10px 12px; margin: 0; }

        .sidebar .menu-item {
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            padding: 11px 14px;
            color: #94a3b8 !important;
            text-decoration: none;
            font-size: 13px !important;
            font-weight: 500 !important;
            border-radius: 10px;
            margin: 3px 0;
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
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .sidebar .menu-item span.menu-text { display: inline-block !important; visibility: visible !important; opacity: 1 !important; }

        .sidebar .menu-list > li > span:first-child, 
        .submenu-container .menu-item span:first-child,
        #menu-tiepnhan span:first-child {
            display: inline-block;
            width: 24px;
            text-align: center;
            font-size: 14px !important;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .menu-dropdown-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 11px 14px;
            cursor: pointer;
            color: #94a3b8;
            font-weight: 600 !important;
            font-size: 13px !important;
            background: none !important;
            border: none !important;
            margin: 3px 0;
            border-radius: 10px;
            transition: all 0.2s ease;
            user-select: none;
            width: 100%;
            box-sizing: border-box;
        }
        .menu-dropdown-toggle:hover { background: rgba(255, 255, 255, 0.06) !important; color: #f8fafc; }
        .menu-dropdown-toggle .menu-label-wrap { display: flex; align-items: center; white-space: nowrap; overflow: hidden; gap: 12px; }
        .menu-dropdown-toggle .group-icon { display: inline-block; width: 24px; text-align: center; font-size: 14px !important; flex-shrink: 0; }
        .menu-dropdown-toggle .arrow { font-size: 10px; transition: transform 0.3s ease; flex-shrink: 0; margin-left: 6px; color: #64748b; }
        .menu-dropdown-toggle.active-parent .arrow { transform: rotate(180deg); color: #60a5fa; }
        .menu-dropdown-toggle.active-parent { color: #f8fafc; }

        .submenu-container {
            display: none;
            list-style: none;
            padding-left: 14px;
            margin: 2px 0 6px 0;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding-top: 6px;
            padding-bottom: 6px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .submenu-container.open { display: block; }
        .submenu-container .menu-item { padding: 9px 12px 9px 10px; font-size: 12.5px !important; margin: 2px 4px; }

        .menu-pos-highlight {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
            color: #ffffff !important;
            border-radius: 12px;
            margin: 14px 12px 4px 12px !important;
            padding: 12px 14px !important;
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .menu-pos-highlight:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .menu-pos-highlight .pos-icon { font-size: 15px; margin-right: 12px; }
        .menu-pos-highlight .pos-badge { background-color: #ef4444; color: white; font-size: 9px; padding: 2px 7px; border-radius: 6px; font-weight: 800; margin-left: auto; letter-spacing: 0.5px; }

        #menu-tiepnhan {
            margin: 0 12px 10px 12px !important;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        #menu-tiepnhan:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }

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

        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar { width: 75px !important; min-width: 75px !important; overflow: hidden; transform: translateX(0) !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .main-content { margin-left: 75px !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .menu-text,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .menu-category,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .arrow,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar .pos-badge,
        body.sidebar-collapsed:not(.mobile-menu-open) .sidebar #sidebar-date { display: none !important; }
        body.sidebar-collapsed:not(.mobile-menu-open) .submenu-container.open { display: none !important; }

        @media (max-width: 768px) {
            .topbar-title-pc { display: none !important; }
            .topbar-user-btn { max-width: 85px; padding: 4px 6px !important; }
            .topbar-username-text { max-width: 45px !important; font-size: 10.5px !important; }
        }

        #pcNotificationDropdown {
            display: none;
            position: fixed !important;
            top: 65px !important;
            right: 25px !important;
            width: 330px !important;
            max-width: calc(100vw - 40px) !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: #ffffff !important;
            border-radius: 14px !important;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15) !important;
            z-index: 999999 !important;
            border: 1px solid #e2e8f0 !important;
            word-break: break-word !important;
        }
        #pcNotificationDropdown * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            white-space: normal !important;
        }

        #notification-center-pc {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            z-index: 9999999 !important;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .notify-toast-pc {
            pointer-events: auto;
            width: 330px !important;
            max-width: 90vw !important;
            background: #ffffff !important;
            padding: 14px 16px !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12) !important;
            display: flex !important;
            align-items: flex-start !important;
            border-left: 4px solid #10b981 !important;
            box-sizing: border-box !important;
            word-break: break-word !important;
            border: 1px solid #f1f5f9;
        }
        .notify-toast-pc * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            white-space: normal !important;
        }
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

    const tenHienThi = currentUser?.tennhanvien || currentUser?.hovaten || currentUser?.tentaikhoan || currentUser?.username || 'Tài khoản';

    const topnavContainer = document.getElementById('topnav-container');
    if (topnavContainer) {
        topnavContainer.innerHTML = `
            <div class="top-navbar" id="topNavbarHeader" style="display: flex; justify-content: space-between; align-items: center; padding: 0 8px; background: ${mainThemeColor}; border-bottom: 1px solid rgba(255,255,255,0.08); height: 55px; box-sizing: border-box; position: relative; color: white; width: 100%; overflow: hidden;">
                
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <button class="toggle-btn" onclick="toggleSidebar()" style="cursor: pointer; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); font-size: 16px; color: white; width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Mở/Đóng Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
                
                <div onclick="moModalTimKiemNhanh()" style="cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 7px 10px; display: flex; align-items: center; gap: 6px; flex: 1; max-width: 380px; margin: 0 6px; box-sizing: border-box;" title="Click để tìm kiếm nhanh">
                    <span style="font-size: 13px; flex-shrink: 0;">🔍</span>
                    <span style="font-size: 11.5px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tìm kiếm KH, SĐT...</span>
                </div>

                <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                    <div id="headerBellBtnPC" style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer;" title="Xem lịch sử thông báo">
                        <span style="font-size: 14px; color: #fbbf24;"><i class="fa-solid fa-bell"></i></span>
                        <span id="navNotificationBadge" style="position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 9px; padding: 1px 4px; border-radius: 50%; display: none; font-weight: bold;">0</span>
                    </div>

                    <div onclick="moModalSuaThongTinCaNhan()" class="topbar-user-btn" style="display: flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.08); padding: 4px 6px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-size: 11px; font-weight: 600; color: white; cursor: pointer; white-space: nowrap;" title="Thông tin cá nhân">
                        <span style="color: #60a5fa;"><i class="fa-solid fa-user-circle"></i></span> 
                        <span class="topbar-username-text" style="max-width: 60px; overflow: hidden; text-overflow: ellipsis;">${tenHienThi}</span>
                    </div>

                    <button onclick="dangXuat()" style="background-color: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); width: 34px; height: 34px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;" title="Đăng xuất">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        `;
    }

    if (!document.getElementById('globalAudioNotification')) {
        const audioTag = document.createElement('audio');
        audioTag.id = 'globalAudioNotification';
        audioTag.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
        audioTag.preload = 'auto';
        document.body.appendChild(audioTag);
    }

    if (!document.getElementById('notification-center-pc')) {
        const center = document.createElement('div');
        center.id = 'notification-center-pc';
        document.body.appendChild(center);
    }

    if (!document.getElementById('pcNotificationDropdown')) {
        const dropdown = document.createElement('div');
        dropdown.id = 'pcNotificationDropdown';
        dropdown.innerHTML = `
            <div style="background: #0f172a; color: white; padding: 12px 16px; font-weight: 700; font-size: 13px; display: flex; justify-content: space-between; align-items: center; border-radius: 13px 13px 0 0;">
                <span>🔔 Lịch sử thông báo</span>
                <button onclick="xoaTatCaThongBaoPC()" style="background: rgba(255,255,255,0.15); border: none; color: #fbbf24; padding: 3px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 600;">Xóa tất cả</button>
            </div>
            <div id="pcNotificationList" style="padding: 0;">
                <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">Chưa có thông báo nào</div>
            </div>
        `;
        document.body.appendChild(dropdown);
    }

    const bellBtn = document.getElementById('headerBellBtnPC');
    const dropdown = document.getElementById('pcNotificationDropdown');
    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const badge = document.getElementById('navNotificationBadge');
            if (badge) {
                badge.innerText = '0';
                badge.style.display = 'none';
            }
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    langNgheThongBaoRealtimePC();

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'collapsed' && window.innerWidth > 992) {
        document.body.classList.add('sidebar-collapsed');
    }
});

function moModalTimKiemNhanh() {
    if (document.getElementById('modalTimKiemNhanh')) return;
    const modal = document.createElement('div');
    modal.id = 'modalTimKiemNhanh';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 9999999; display: flex; align-items: flex-start; justify-content: center; padding-top: 50px; font-family: 'Inter', sans-serif; box-sizing: border-box;`;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 92%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px rgba(15, 23, 42, 0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;">
            <div style="padding: 14px 16px; background: #0f172a; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">🔍</span>
                <input type="text" id="popupGlobalSearchInput" placeholder="Nhập tên khách hàng, SĐT hoặc thú cưng..." autocomplete="off" onkeyup="xuLyTimKiemModal(this.value)" style="flex: 1; height: 40px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 0 14px; color: #fff; font-size: 13.5px; outline: none;" autofocus>
                <button onclick="document.getElementById('modalTimKiemNhanh').remove()" style="background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; padding: 0 4px;">&times;</button>
            </div>
            <div id="popupSearchResultContainer" style="padding: 12px; overflow-y: auto; flex: 1; background: #f8fafc;">
                <div style="text-align: center; color: #64748b; font-size: 13px; padding: 30px;">Nhập từ khóa để bắt đầu tìm kiếm...</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        const input = document.getElementById('popupGlobalSearchInput');
        if (input) input.focus();
    }, 100);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

async function xuLyTimKiemModal(tuKhoa) {
    const container = document.getElementById('popupSearchResultContainer');
    const keywordRaw = tuKhoa.trim();

    if (!keywordRaw) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 13px; padding: 30px;">Nhập từ khóa để bắt đầu tìm kiếm...</div>`;
        return;
    }

    if (typeof db === 'undefined' || !db) {
        container.innerHTML = `<div style="text-align: center; color: #dc2626; font-size: 13px; padding: 20px;">Lỗi kết nối cơ sở dữ liệu!</div>`;
        return;
    }

    try {
        const { data: listKhach } = await db.from('khachhang')
            .select('*')
            .or(`hovaten.ilike.%${keywordRaw}%,sodienthoai.ilike.%${keywordRaw}%`)
            .limit(6);

        const { data: listThuCung } = await db.from('thucung')
            .select('*')
            .ilike('tenthucung', `%${keywordRaw}%`)
            .limit(6);

        let khachIds = [];
        if (listKhach && listKhach.length > 0) {
            khachIds = listKhach.map(k => k.id);
        }

        let mapThuCungTheoKhach = {};
        if (khachIds.length > 0) {
            let resPets = await db.from('thucung').select('*').in('makhachhang', khachIds);
            if (resPets.error || !resPets.data || resPets.data.length === 0) {
                resPets = await db.from('thucung').select('*').in('makh', khachIds);
            }
            if (resPets.data) {
                resPets.data.forEach(pet => {
                    let kid = pet.makhachhang || pet.makh;
                    if (!mapThuCungTheoKhach[kid]) mapThuCungTheoKhach[kid] = [];
                    mapThuCungTheoKhach[kid].push(pet);
                });
            }
        }

        let html = '';
        const hasKhach = listKhach && listKhach.length > 0;
        const hasTC = listThuCung && listThuCung.length > 0;

        if (!hasKhach && !hasTC) {
            container.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 13px; padding: 30px;">Không tìm thấy kết quả phù hợp</div>`;
            return;
        }

        if (hasKhach) {
            html += `<div style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Khách hàng & Thú cưng trực thuộc</div>`;
            listKhach.forEach(kh => {
                const sdtStr = kh.sodienthoai || kh.sdt || 'Không có';
                const dsThuCungCuaKhach = mapThuCungTheoKhach[kh.id] || [];

                html += `
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div>
                                <b style="color: #0f172a; font-size: 13.5px;">${kh.hovaten}</b> 
                                <span style="font-size: 12px; color: #2563eb; font-weight: 600; margin-left: 6px;">(${sdtStr})</span>
                            </div>
                            <button onclick="window.location.href='khachhang.html?id=${kh.id}'" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 700; color: #334155;">Xem KH</button>
                        </div>
                `;

                if (dsThuCungCuaKhach.length > 0) {
                    html += `<div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">`;
                    dsThuCungCuaKhach.forEach(tc => {
                        html += `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 10px; border-radius: 8px; border: 1px solid #f1f5f9;">
                                <div>
                                    <span style="font-weight: 700; color: #1e293b; font-size: 12px;">🐾 ${tc.tenthucung || tc.ten || '---'}</span>
                                    <span style="color: #64748b; font-size: 11px; margin-left: 4px;">(${tc.loaigiong || tc.giong || 'Thú cưng'})</span>
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button type="button" onclick="window.location.href='khambenh.html?mathucung=${tc.id}'" style="background: #10b981; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Khám</button>
                                    <button type="button" onclick="window.location.href='nhatkylamvaccine.html?mathucung=${tc.id}'" style="background: #f59e0b; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Tiêm</button>
                                    <button type="button" onclick="window.location.href='noitru.html?mathucung=${tc.id}'" style="background: #8b5cf6; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Lưu trú</button>
                                    <button type="button" onclick="window.location.href='nhatkyspa.html?mathucung=${tc.id}'" style="background: #ec4899; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Spa</button>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                } else {
                    html += `<div style="font-size: 11.5px; color: #94a3b8; font-style: italic;">Chưa có thú cưng nào</div>`;
                }

                html += `</div>`;
            });
        }

        if (hasTC) {
            html += `<div style="font-size: 11px; font-weight: 800; color: #0369a1; margin: 14px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">🐾 Kết quả tìm kiếm Thú cưng</div>`;
            listThuCung.forEach(tc => {
                html += `
                    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">🐶 ${tc.tenthucung || tc.ten || '---'}</div>
                            <div style="font-size: 11px; color: #64748b;">Giống: ${tc.loaigiong || tc.giong || '---'}</div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button type="button" onclick="window.location.href='khambenh.html?mathucung=${tc.id}'" style="background: #10b981; color: white; border: none; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Khám</button>
                            <button type="button" onclick="window.location.href='nhatkylamvaccine.html?mathucung=${tc.id}'" style="background: #f59e0b; color: white; border: none; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Tiêm</button>
                            <button type="button" onclick="window.location.href='noitru.html?mathucung=${tc.id}'" style="background: #8b5cf6; color: white; border: none; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Lưu trú</button>
                            <button type="button" onclick="window.location.href='nhatkyspa.html?mathucung=${tc.id}'" style="background: #ec4899; color: white; border: none; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Spa</button>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    } catch (err) {
        console.error('Lỗi tìm kiếm modal:', err);
    }
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

function moModalSuaThongTinCaNhan() {
    if (document.getElementById('modalSuaThongTinCaNhan')) return;
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) { currentUser = {}; }

    const tenHienTai = currentUser?.tennhanvien || currentUser?.hovaten || currentUser?.tentaikhoan || '';
    const emailHienTai = currentUser?.email || '';
    const sdtHienTai = currentUser?.sodienthoai || currentUser?.sdt || '';

    const modal = document.createElement('div');
    modal.id = 'modalSuaThongTinCaNhan';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;`;

    modal.innerHTML = `
        <div style="background: #ffffff; padding: 28px; border-radius: 16px; width: 90%; max-width: 420px; box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25); position: relative;">
            <button onclick="document.getElementById('modalSuaThongTinCaNhan').remove()" style="position: absolute; top: 16px; right: 18px; background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 18px; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center;">&times;</button>
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 20px; font-size: 17px; font-weight: 800; text-align: center;">👤 Chỉnh Sửa Thông Tin Cá Nhân</h3>
            <form onsubmit="luuThongTinCaNhan(event)">
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Họ & Tên / Tên hiển thị:</label>
                    <input type="text" id="self_tennhanvien" value="${tenHienTai}" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; box-sizing: border-box; outline: none;">
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Email:</label>
                    <input type="email" id="self_email" value="${emailHienTai}" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; box-sizing: border-box; outline: none;">
                </div>
                <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Số điện thoại:</label>
                    <input type="text" id="self_sdt" value="${sdtHienTai}" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; box-sizing: border-box; outline: none;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">Mật khẩu mới (Bỏ trống nếu không đổi):</label>
                    <input type="password" id="self_matkhau" placeholder="Mật khẩu mới..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; box-sizing: border-box; outline: none;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="document.getElementById('modalSuaThongTinCaNhan').remove()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 12.5px;">Hủy</button>
                    <button type="submit" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 12.5px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">💾 Lưu thay đổi</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function luuThongTinCaNhan(event) {
    event.preventDefault();
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}

    if (!currentUser || !currentUser.id) {
        alert('Không tìm thấy thông tin phiên đăng nhập!');
        return;
    }

    const tenMoi = document.getElementById('self_tennhanvien').value.trim();
    const emailMoi = document.getElementById('self_email').value.trim();
    const sdtMoi = document.getElementById('self_sdt').value.trim();
    const matKhauMoi = document.getElementById('self_matkhau').value.trim();

    const updatePayload = { tennhanvien: tenMoi, email: emailMoi, sodienthoai: sdtMoi };
    if (matKhauMoi) updatePayload.matkhau = matKhauMoi;

    if (typeof db !== 'undefined' && db) {
        let { error } = await db.from('user').update(updatePayload).eq('id', currentUser.id);
        if (error) {
            alert('Lỗi cập nhật: ' + error.message);
            return;
        }
    }

    currentUser.tennhanvien = tenMoi;
    currentUser.email = emailMoi;
    currentUser.sodienthoai = sdtMoi;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('✅ Cập nhật thông tin cá nhân thành công!');
    location.reload();
}

function hienThiPopupGiaHanChoNhanVien() {
    if (document.getElementById('modalGiaHanNV')) return;
    const modal = document.createElement('div');
    modal.id = 'modalGiaHanNV';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;`;
    modal.innerHTML = `
        <div style="background: #ffffff; padding: 35px; border-radius: 16px; width: 90%; max-width: 440px; text-align: center; box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);">
            <div style="font-size: 52px; margin-bottom: 12px;">🔒</div>
            <h2 style="color: #dc2626; margin-top: 0; font-size: 20px; font-weight: 800;">Phòng Khám Đã Hết Hạn Bản Quyền</h2>
            <p style="color: #475569; font-size: 13.5px; line-height: 1.6; margin-bottom: 24px;">Tài khoản sử dụng của phòng khám đã hết hạn bản quyền phần mềm. Vui lòng liên hệ <b>Chủ phòng khám</b> để tiến hành gia hạn và tiếp tục sử dụng hệ thống.</p>
            <button onclick="dangXuat()" style="background: #dc2626; color: white; border: none; padding: 11px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13.5px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">Đăng xuất</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function hienThiThongBaoHetHan() {
    alert('⚠️ Phòng khám đã hết hạn bản quyền sử dụng hệ thống!');
}

function xuLyCoDuLieuMoiPC(noiDungThongBao) {
    const audio = document.getElementById('globalAudioNotification');
    if (audio) audio.play().catch(error => console.log(error));

    const center = document.getElementById('notification-center-pc');
    if (center) {
        const toast = document.createElement('div');
        toast.className = 'notify-toast-pc';
        toast.innerHTML = `<div style="font-size: 18px; margin-right: 12px;">🔔</div><div style="flex: 1;"><h4 style="margin: 0 0 4px 0; font-size: 13.5px; font-weight: 700; color: #0f172a;">Thông Báo Mới</h4><p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">${noiDungThongBao}</p></div><button onclick="this.parentElement.remove()" style="background:none; border:none; font-size:16px; cursor:pointer; color:#94a3b8; padding-left:10px;">&times;</button>`;
        center.appendChild(toast);
        setTimeout(() => { toast.style.transition = 'opacity 0.3s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 5000);
    }

    const badge = document.getElementById('navNotificationBadge');
    if (badge) {
        let count = parseInt(badge.innerText || '0') + 1;
        badge.innerText = count;
        badge.style.display = 'inline-block';
    }

    const listDiv = document.getElementById('pcNotificationList');
    if (listDiv) {
        if (listDiv.innerHTML.includes('Chưa có thông báo nào')) listDiv.innerHTML = '';
        const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        listDiv.innerHTML = `<div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 12px; display: flex; justify-content: space-between; align-items: flex-start; background: #fff; word-break: break-word;"><div><div style="font-weight: 600; color: #1e293b; margin-bottom: 3px; line-height: 1.4;">${noiDungThongBao}</div><div style="font-size: 10.5px; color: #94a3b8;">${timeNow}</div></div></div>` + listDiv.innerHTML;
    }
}

function xoaTatCaThongBaoPC() {
    const listDiv = document.getElementById('pcNotificationList');
    if (listDiv) listDiv.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">Chưa có thông báo nào</div>`;
    const badge = document.getElementById('navNotificationBadge');
    if (badge) { badge.innerText = '0'; badge.style.display = 'none'; }
}

function langNgheThongBaoRealtimePC() {
    setTimeout(() => {
        if (typeof db === 'undefined' || !db) return;
        try {
            if (!window._realtimePCSubscribed) {
                const channel = db.channel('realtime-vetcare-toan-bo-bang-v3');
                channel.on('postgres_changes', { event: 'INSERT', schema: 'public' }, p => xuLySuKienRealtime('Thêm mới', p));
                channel.on('postgres_changes', { event: 'UPDATE', schema: 'public' }, p => xuLySuKienRealtime('Cập nhật', p));
                channel.on('postgres_changes', { event: 'DELETE', schema: 'public' }, p => xuLySuKienRealtime('Xóa', p));
                channel.subscribe();
                window._realtimePCSubscribed = true;
            }
        } catch (err) { console.error(err); }
    }, 1500);
}

function xuLySuKienRealtime(hanhDong, payload) {
    const tableName = payload.table.toLowerCase();
    const data = payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old;
    let tenNhanVien = "Nhân viên";
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) tenNhanVien = user.tennhanvien || user.hovaten || user.name || "Nhân viên";
    } catch (e) {}

    let tenDoiTuong = `dữ liệu [${payload.table}]`;
    switch (tableName) {
        case 'khachhang': tenDoiTuong = `khách hàng [${data.tenkhachhang || data.hovaten || ''}]`; break;
        case 'thucung': tenDoiTuong = `thú cưng [${data.tenthucung || data.ten || ''}]`; break;
        case 'lichhen': tenDoiTuong = `lịch hẹn`; break;
        case 'khambenh': tenDoiTuong = `phiếu khám bệnh`; break;
        case 'donhang': tenDoiTuong = `đơn hàng`; break;
    }
    let icon = hanhDong === 'Thêm mới' ? '➕' : (hanhDong === 'Cập nhật' ? '✏️' : '🗑️');
    xuLyCoDuLieuMoiPC(`${icon} <b>${tenNhanVien}</b> vừa <b>${hanhDong.toLowerCase()}</b> ${tenDoiTuong}`);
}

function toggleSubmenu(element) {
    element.classList.toggle('active-parent');
    const submenu = element.nextElementSibling;
    if (submenu && submenu.classList.contains('submenu-container')) submenu.classList.toggle('open');
}

function dangXuat() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }
}

// Tự động chèn Favicon chung từ thư mục logo cho toàn bộ hệ thống
(function() {
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = '../logo/logo.png';
    document.getElementsByTagName('head')[0].appendChild(link);
})();
