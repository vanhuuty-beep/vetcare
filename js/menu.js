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
                <span><i class="fa-solid fa-crown"></i></span> <span class="menu-text" style="font-weight: bold;">Quản lý chung (Hệ thống)</span>
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
                <span class="menu-text">Công nợ- Thu chi</span>
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

    // Cố định chuẩn mã màu Xanh Navy (#1e3a8a)
    const mainThemeColor = '#1e3a8a';

    const menuHTML = `
    <div class="sidebar ${isExpired && !isHuuTy ? 'sidebar-frozen' : ''}" id="sidebar" style="background: ${mainThemeColor};">
        <div class="sidebar-header" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 20px; margin-right: 8px;"><i class="fa-solid fa-paw" style="color: #60a5fa;"></i></span> <span class="menu-text">VetCare Pro</span>
                </div>
            </div>
            <div id="sidebar-date" style="font-size: 11px; font-weight: normal; color: rgba(255, 255, 255, 0.85); padding-left: 28px;">
                📅 ${ngayHienTai}
            </div>
        </div>
        
        <li class="menu-item sub-item menu-pos-highlight" id="menu-pos" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='pos.html'"}">
            <span class="pos-icon"><i class="fa-solid fa-bolt"></i></span> 
            <span class="menu-text" style="font-weight: bold;">BÁN HÀNG POS</span>
            <span class="pos-badge">HOT</span>
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
            box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            transition: width 0.3s ease, background 0.3s ease, transform 0.3s ease;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .sidebar::-webkit-scrollbar { width: 5px; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }

        .sidebar-header {
            padding: 18px 16px 12px 16px !important;
            font-size: 20px !important;
            font-weight: bold !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.1);
        }
        .sidebar-header .menu-text { font-size: 24px !important; letter-spacing: 0.5px; color: #ffffff; }

        .sidebar .menu-category {
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #94a3b8;
            padding: 14px 16px 6px 16px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        .sidebar ul.menu-list { list-style: none; padding: 8px 10px; margin: 0; }

        .sidebar .menu-item {
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            padding: 10px 14px;
            color: #cbd5e1 !important;
            text-decoration: none;
            font-size: 13.5px !important;
            font-weight: 600 !important;
            border-radius: 8px;
            margin: 3px 0;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }

        .sidebar .menu-item:hover {
            background-color: rgba(255, 255, 255, 0.08) !important;
            color: #ffffff !important;
            transform: translateX(3px);
        }

        .sidebar .menu-item.active {
            background: rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .sidebar .menu-item span.menu-text { display: inline-block !important; visibility: visible !important; opacity: 1 !important; }

        .sidebar .menu-list > li > span:first-child, 
        .submenu-container .menu-item span:first-child {
            display: inline-block;
            width: 24px;
            text-align: center;
            font-size: 14px !important;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .menu-dropdown-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            cursor: pointer;
            color: #cbd5e1;
            font-weight: 700 !important;
            font-size: 13.5px !important;
            background: none !important;
            border: none !important;
            margin: 3px 0;
            border-radius: 8px;
            transition: all 0.2s ease;
            user-select: none;
            width: 100%;
            box-sizing: border-box;
        }
        .menu-dropdown-toggle:hover { background: rgba(255, 255, 255, 0.08) !important; color: #ffffff; }
        .menu-dropdown-toggle .menu-label-wrap { display: flex; align-items: center; white-space: nowrap; overflow: hidden; gap: 10px; }
        .menu-dropdown-toggle .group-icon { display: inline-block; width: 24px; text-align: center; font-size: 14px !important; flex-shrink: 0; }
        .menu-dropdown-toggle .arrow { font-size: 10px; transition: transform 0.3s ease; flex-shrink: 0; margin-left: 6px; color: #94a3b8; }
        .menu-dropdown-toggle.active-parent .arrow { transform: rotate(180deg); color: #ffffff; }

        .submenu-container {
            display: none;
            list-style: none;
            padding-left: 14px;
            margin: 2px 0 6px 0;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            padding-top: 4px;
            padding-bottom: 4px;
        }
        .submenu-container.open { display: block; }
        .submenu-container .menu-item { padding: 8px 12px 8px 10px; font-size: 13px !important; margin: 2px 4px; }

        .menu-pos-highlight {
            background: rgba(255, 255, 255, 0.25) !important;
            color: #ffffff !important;
            border-radius: 8px;
            margin: 12px 10px !important;
            padding: 11px 14px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .menu-pos-highlight:hover { background: rgba(255, 255, 255, 0.35) !important; transform: translateY(-1px); }
        .menu-pos-highlight .pos-icon { font-size: 15px; margin-right: 10px; }
        .menu-pos-highlight .pos-badge { background-color: #dc2626; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: auto; }

        .sidebar-frozen { pointer-events: none; opacity: 0.65; filter: grayscale(30%); }

        .main-content {
            margin-left: 275px;
            transition: margin-left 0.3s ease;
            min-height: 100vh;
            background: #f1f5f9;
        }

        /* --- XỬ LÝ RESPONSIVE TRÊN MOBILE --- */
        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
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
        body.sidebar-collapsed:not(.mobile-menu-open) .submenu-container.open { display: none !important; }

        /* CSS THANH TÌM KIẾM THÔNG MINH TRÊN TOPBAR CHUNG */
        .topbar-smart-search-global {
            position: relative;
            flex: 1;
            max-width: 420px;
            margin: 0 15px;
        }
        .topbar-smart-search-global input {
            width: 100%;
            height: 36px;
            padding: 0 12px 0 34px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            font-size: 12px;
            outline: none;
            background: rgba(255, 255, 255, 0.95);
            color: #1e293b;
            transition: all 0.2s;
        }
        .topbar-smart-search-global input:focus {
            background: #ffffff;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.25);
        }
        .topbar-smart-search-global::before {
            content: "🔍";
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 13px;
            z-index: 2;
        }
        #topbarSearchDropdownGlobal {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: #fff;
            border-radius: 10px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 15px 35px rgba(15, 23, 42, 0.18);
            max-height: 400px;
            overflow-y: auto;
            z-index: 999999;
            display: none;
            text-align: left;
        }

        #pcNotificationDropdown {
            display: none;
            position: fixed !important;
            top: 60px !important;
            right: 25px !important;
            width: 320px !important;
            max-width: calc(100vw - 40px) !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: #ffffff !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
            z-index: 999999 !important;
            border: 1px solid #cbd5e1 !important;
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
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999999 !important;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .notify-toast-pc {
            pointer-events: auto;
            width: 320px !important;
            max-width: 90vw !important;
            background: #ffffff !important;
            padding: 12px 15px !important;
            border-radius: 10px !important;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
            display: flex !important;
            align-items: flex-start !important;
            border-left: 4px solid #008080 !important;
            box-sizing: border-box !important;
            word-break: break-word !important;
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
            <div class="top-navbar" id="topNavbarHeader" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; background: ${mainThemeColor}; border-bottom: 1px solid rgba(255,255,255,0.15); height: 55px; box-sizing: border-box; position: relative; color: white;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                    <button class="toggle-btn" onclick="toggleSidebar()" style="cursor: pointer; background: rgba(255,255,255,0.15); border: none; font-size: 16px; color: white; width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;"><i class="fa-solid fa-bars"></i></button>
                    <h2 style="margin: 0; font-size: 13px; font-weight: bold; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">QUẢN LÝ PHÒNG KHÁM THÚ Y</h2>
                </div>
                
                <!-- THANH TÌM KIẾM THÔNG MINH TOÀN HỆ THỐNG TRÊN TOPBAR -->
                <div class="topbar-smart-search-global">
                    <input type="text" id="topbarGlobalSearchInput" placeholder="🔍 Tìm khách hàng, SĐT hoặc thú cưng..." autocomplete="off" onkeyup="xuLyTimKiemThongMinhGlobalTopbar(this.value)">
                    <div id="topbarSearchDropdownGlobal"></div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px; position: relative;">
                    <div id="headerBellBtnPC" style="position: relative; display: flex; align-items: center; cursor: pointer; padding: 5px;" title="Bấm để xem lịch sử thông báo">
                        <span style="font-size: 18px; color: #fbbf24;"><i class="fa-solid fa-bell"></i></span>
                        <span id="navNotificationBadge" style="position: absolute; top: 0; right: 0; background: #dc2626; color: white; font-size: 10px; padding: 1px 5px; border-radius: 50%; display: none; font-weight: bold;">0</span>
                    </div>

                    <div onclick="moModalSuaThongTinCaNhan()" style="display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.15); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); font-size: 12px; font-weight: 600; color: white; cursor: pointer; white-space: nowrap;">
                        <span><i class="fa-solid fa-user"></i></span> <span style="max-width: 90px; overflow: hidden; text-overflow: ellipsis;">${tenHienThi}</span>
                    </div>
                    
                    <a href="../mb/trangchu.html" style="background-color: #0284c7; color: white; text-decoration: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; white-space: nowrap; display: none; @media(min-width: 1024px){display: inline-flex;} align-items: center; gap: 4px;">
                        <i class="fa-solid fa-mobile-screen-button"></i> Mobile
                    </a>

                    <button onclick="dangXuat()" style="background-color: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500; white-space: nowrap;">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Đóng dropdown tìm kiếm global khi click ra ngoài
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.topbar-smart-search-global');
        const dropdown = document.getElementById('topbarSearchDropdownGlobal');
        if (searchContainer && dropdown && !searchContainer.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

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
            <div style="background: #1e3a8a; color: white; padding: 10px 12px; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; align-items: center; border-radius: 11px 11px 0 0;">
                <span>🔔 Lịch sử thông báo</span>
                <button onclick="xoaTatCaThongBaoPC()" style="background: rgba(255,255,255,0.2); border: none; color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Xóa tất cả</button>
            </div>
            <div id="pcNotificationList" style="padding: 0;">
                <div style="padding: 15px; text-align: center; color: #64748b; font-size: 12px;">Chưa có thông báo nào</div>
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

// --- HÀM TÌM KIẾM THÔNG MINH TOÀN HỆ THỐNG TRÊN TOPBAR (HIỆN KHÁCH HÀNG & THÚ CƯNG + BỘ 4 NÚT TÁC VỤ) ---
async function xuLyTimKiemThongMinhGlobalTopbar(tuKhoa) {
    const dropdown = document.getElementById('topbarSearchDropdownGlobal');
    const keywordRaw = tuKhoa.trim();

    if (!keywordRaw) {
        dropdown.style.display = 'none';
        return;
    }

    if (typeof db === 'undefined' || !db) {
        dropdown.style.display = 'none';
        return;
    }

    try {
        // 1. Tìm chủ nuôi theo tên hoặc SĐT
        const { data: listKhach, error: errKhach } = await db.from('khachhang')
            .select('*')
            .or(`hovaten.ilike.%${keywordRaw}%,sodienthoai.ilike.%${keywordRaw}%`)
            .limit(5);

        // 2. Lấy danh sách thú cưng độc lập khớp với từ khóa
        const { data: listThuCung, error: errTC } = await db.from('thucung')
            .select('*')
            .ilike('tenthucung', `%${keywordRaw}%`)
            .limit(5);

        // Gom ID các khách hàng tìm được để lấy danh sách thú cưng của họ
        let khachIds = [];
        if (listKhach && listKhach.length > 0) {
            khachIds = listKhach.map(k => k.id);
        }

        let mapThuCungTheoKhach = {};
        if (khachIds.length > 0) {
            // Truy vấn lấy thú cưng thuộc các khách hàng này (thường cột liên kết là makhachhang hoặc makh)
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

        dropdown.style.display = 'block';
        let html = '';

        const hasKhach = listKhach && listKhach.length > 0;
        const hasTC = listThuCung && listThuCung.length > 0;

        if (!hasKhach && !hasTC) {
            dropdown.innerHTML = `<div style="padding: 12px; font-size: 12px; color: #64748b; text-align: center;">Không tìm thấy khách hàng hoặc thú cưng phù hợp</div>`;
            return;
        }

        // Hiển thị kết quả Khách hàng kèm thú cưng trực thuộc
        if (hasKhach) {
            html += `<div style="padding: 6px 12px; font-size: 11px; font-weight: bold; background: #f1f5f9; color: #475569; border-bottom: 1px solid #e2e8f0;">👤 KHÁCH HÀNG & THÚ CƯNG</div>`;
            listKhach.forEach(kh => {
                const sdtStr = kh.sodienthoai || kh.sdt || 'Không có';
                const dsThuCungCuaKhach = mapThuCungTheoKhach[kh.id] || [];

                html += `
                    <div style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; background: #fff;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div>
                                <b style="color: #1e293b; font-size: 13px;">${kh.hovaten}</b> 
                                <span style="font-size: 11px; color: #2563eb; margin-left: 6px;">(SĐT: ${sdtStr})</span>
                            </div>
                            <button onclick="window.location.href='khachhang.html?id=${kh.id}'" style="background: #e2e8f0; border: none; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold;">Xem KH</button>
                        </div>
                `;

                if (dsThuCungCuaKhach.length > 0) {
                    html += `<div style="padding-left: 10px; border-left: 2px solid #cbd5e1; margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">`;
                    dsThuCungCuaKhach.forEach(tc => {
                        html += `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 6px 8px; border-radius: 6px; font-size: 11px;">
                                <div>
                                    <span style="font-weight: bold; color: #1e3a8a;">🐾 ${tc.tenthucung || tc.ten || '---'}</span>
                                    <span style="color: #64748b; font-size: 10px; margin-left: 4px;">(${tc.loaigiong || tc.giong || 'Thú cưng'})</span>
                                </div>
                                <div style="display: flex; gap: 4px;">
                                    <button type="button" onclick="window.location.href='khambenh.html?mathucung=${tc.id}'" style="background: #10b981; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Khám bệnh">Khám</button>
                                    <button type="button" onclick="window.location.href='nhatkylamvaccine.html?mathucung=${tc.id}'" style="background: #f59e0b; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Tiêm vắc-xin">Tiêm</button>
                                    <button type="button" onclick="window.location.href='noitru.html?mathucung=${tc.id}'" style="background: #8b5cf6; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Lưu trú nội trú">Lưu trú</button>
                                    <button type="button" onclick="window.location.href='nhatkyspa.html?mathucung=${tc.id}'" style="background: #ec4899; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;" title="Spa thú cưng">Spa</button>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                } else {
                    html += `<div style="font-size: 11px; color: #94a3b8; font-style: italic; padding-left: 10px;">Chưa có thú cưng nào</div>`;
                }

                html += `</div>`;
            });
        }

        // Hiển thị kết quả tìm kiếm theo tên Thú cưng trực tiếp
        if (hasTC) {
            html += `<div style="padding: 6px 12px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; border-bottom: 1px solid #bae6fd; margin-top: 4px;">🐾 KẾT QUẢ TÌM THÚ CƯNG</div>`;
            listThuCung.forEach(tc => {
                html += `
                    <div style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fdfdfd;">
                        <div>
                            <div style="font-weight: bold; color: #1e3a8a; font-size: 12px;">🐶 ${tc.tenthucung || tc.ten || '---'}</div>
                            <div style="font-size: 11px; color: #64748b;">Giống: ${tc.loaigiong || tc.giong || '---'}</div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button type="button" onclick="window.location.href='khambenh.html?mathucung=${tc.id}'" style="background: #10b981; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">Khám</button>
                            <button type="button" onclick="window.location.href='nhatkylamvaccine.html?mathucung=${tc.id}'" style="background: #f59e0b; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">Tiêm</button>
                            <button type="button" onclick="window.location.href='noitru.html?mathucung=${tc.id}'" style="background: #8b5cf6; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">Lưu trú</button>
                            <button type="button" onclick="window.location.href='nhatkyspa.html?mathucung=${tc.id}'" style="background: #ec4899; color: white; border: none; padding: 4px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">Spa</button>
                        </div>
                    </div>
                `;
            });
        }

        dropdown.innerHTML = html;
    } catch (err) {
        console.error('Lỗi tìm kiếm topbar:', err);
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
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;

    modal.innerHTML = `
        <div style="background: #ffffff; padding: 25px; border-radius: 12px; width: 90%; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); position: relative;">
            <button onclick="document.getElementById('modalSuaThongTinCaNhan').remove()" style="position: absolute; top: 12px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
            <h3 style="color: #1e3a8a; margin-top: 0; margin-bottom: 15px; font-size: 18px; text-align: center;">👤 Chỉnh Sửa Thông Tin Cá Nhân</h3>
            <form onsubmit="luuThongTinCaNhan(event)">
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Họ & Tên / Tên hiển thị:</label>
                    <input type="text" id="self_tennhanvien" value="${tenHienTai}" required style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Email:</label>
                    <input type="email" id="self_email" value="${emailHienTai}" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Số điện thoại:</label>
                    <input type="text" id="self_sdt" value="${sdtHienTai}" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px;">Mật khẩu mới (Bỏ trống nếu không đổi):</label>
                    <input type="password" id="self_matkhau" placeholder="Mật khẩu mới..." style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="document.getElementById('modalSuaThongTinCaNhan').remove()" style="background: #94a3b8; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">Hủy</button>
                    <button type="submit" style="background: #2563eb; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">💾 Lưu thay đổi</button>
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
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;
    modal.innerHTML = `
        <div style="background: #ffffff; padding: 35px; border-radius: 12px; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
            <h2 style="color: #dc2626; margin-top: 0; font-size: 22px;">Phòng Khám Đã Hết Hạn Bản Quyền</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">Tài khoản sử dụng của phòng khám đã hết hạn bản quyền phần mềm. Vui lòng liên hệ <b>Chủ phòng khám</b> để tiến hành gia hạn và tiếp tục sử dụng hệ thống.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="dangXuat()" style="background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">Đăng xuất</button>
            </div>
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
        toast.innerHTML = `<div style="font-size: 18px; margin-right: 10px;">🔔</div><div style="flex: 1;"><h4 style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;">Thông Báo Mới</h4><p style="margin: 0; font-size: 12px; color: #64748b;">${noiDungThongBao}</p></div><button onclick="this.parentElement.remove()" style="background:none; border:none; font-size:16px; cursor:pointer; color:#94a3b8; padding-left:10px;">&times;</button>`;
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
        listDiv.innerHTML = `<div style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; word-break: break-word;"><div><div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${noiDungThongBao}</div><div style="font-size: 10px; color: #64748b;">${timeNow}</div></div></div>` + listDiv.innerHTML;
    }
}

function xoaTatCaThongBaoPC() {
    const listDiv = document.getElementById('pcNotificationList');
    if (listDiv) listDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #64748b; font-size: 12px;">Chưa có thông báo nào</div>`;
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
