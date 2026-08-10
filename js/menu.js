document.addEventListener("DOMContentLoaded", function() {
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }

    // Chuẩn hóa chuỗi vai trò
    const vaitroRaw = currentUser ? (currentUser.vaitro || currentUser.role || '') : '';
    const vaitro = vaitroRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    // Xác định tài khoản siêu quản lý hệ thống (huuty hoặc số điện thoại 0935778727)
    const tentaiKhoanHienTai = currentUser ? String(currentUser.tentaikhoan || currentUser.username || currentUser.sodienthoai || '').toLowerCase().trim() : '';
    const sdtHienTai = currentUser ? String(currentUser.sodienthoai || currentUser.sdt || '').trim() : '';
    const isHuuTy = (tentaiKhoanHienTai === 'huuty' || tentaiKhoanHienTai.includes('huuty') || sdtHienTai === '0935778727');

    // Xác định quyền Chủ phòng khám (loại bỏ hoàn toàn vai trò Admin cũ, chỉ nhận chủ phòng khám)
    const isTrueOwner = vaitro.includes('chủ phòng khám') || vaitro.includes('chu phong kham') || vaitro.includes('chupk');
    
    // Bác sĩ
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
            window.location.replace('thanhtoan.html');
            return;
        } else if (!isHuuTy) {
            hienThiPopupGiaHanChoNhanVien();
        }
    }

    // Xây dựng danh mục HỆ THỐNG theo phân quyền
    let heThongMenuHtml = `<li class="menu-category">👨‍⚕️ HỆ THỐNG</li>`;

    // 1. Quản lý hệ thống tối cao (0935778727 hoặc huuty) thấy tất cả
    if (isHuuTy) {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-thongtinpk" onclick="window.location.href='thongtinphongkham.html'"><span>🏥</span> <span class="menu-text">Thông tin phòng khám</span></li>
            <li class="menu-item" id="menu-quanlyuser" onclick="window.location.href='quanlyuser.html'"><span>🔐</span> <span class="menu-text">Quản lý nhân viên</span></li>
            <li class="menu-item" id="menu-thanhtoan" onclick="window.location.href='thanhtoan.html'"><span>💳</span> <span class="menu-text">Thanh toán & Gia hạn</span></li>
            <li class="menu-item" id="menu-quanlychung" onclick="window.location.href='quanlychung.html'" style="background: rgba(2, 132, 199, 0.15); border-left: 4px solid #0284c7;">
                <span>👑</span> <span class="menu-text" style="font-weight: bold; color: #0284c7;">Quản lý chung (Hệ thống)</span>
            </li>
            
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span>📞</span> <span class="menu-text">Liên hệ</span></li>
        `;
    } 
    // 2. Chủ phòng khám thấy thông tin PK, quản lý nhân viên, thanh toán (ẨN hoàn toàn Quản lý chung)
    else if (isTrueOwner) {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-thongtinpk" onclick="window.location.href='thongtinphongkham.html'"><span>🏥</span> <span class="menu-text">Thông tin phòng khám</span></li>
            <li class="menu-item" id="menu-quanlyuser" onclick="window.location.href='quanlyuser.html'"><span>🔐</span> <span class="menu-text">Quản lý nhân viên</span></li>
            <li class="menu-item" id="menu-thanhtoan" onclick="window.location.href='thanhtoan.html'"><span>💳</span> <span class="menu-text">Thanh toán & Gia hạn</span></li>
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span>📞</span> <span class="menu-text">Liên hệ</span></li>
        `;
    } 
    // 3. Nhân viên và Bác sĩ: Chỉ thấy Liên hệ trong phần hệ thống
    else {
        heThongMenuHtml += `
            <li class="menu-item" id="menu-lienhe" onclick="window.location.href='lienhe.html'"><span>📞</span> <span class="menu-text">Liên hệ</span></li>
        `;
    }

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    const ngayHienTai = now.toLocaleDateString('vi-VN', options);

    // XÂY DỰNG CÁC NHÓM MENU CHUYÊN MÔN
    let dynamicMenuContent = '';

    // Thống kê (Ai cũng thấy)
    dynamicMenuContent += `<li class="menu-item" id="menu-thongke" onclick="window.location.href='thongke.html'"><span>📈</span> <span class="menu-text">Thống kê</span></li>`;

    // Khách hàng, Thú cưng, Lịch hẹn (Ai cũng thấy để làm việc)
    dynamicMenuContent += `
        <li class="menu-item" id="menu-khachhang" onclick="window.location.href='khachhang.html'"><span>👤</span> <span class="menu-text">Khách hàng</span></li>
        <li class="menu-item" id="menu-thucung" onclick="window.location.href='thucung.html'"><span>🐶</span> <span class="menu-text">Thú cưng</span></li>
        <li class="menu-item" id="menu-lichhen" onclick="window.location.href='lichhen.html'"><span>📅</span> <span class="menu-text">Lịch hẹn</span></li>
    `;

    // Khám & Điều trị: Chủ phòng khám, Bác sĩ và Quản lý hệ thống thấy (Nhân viên bị ẩn)
    if (isTrueOwner || isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle active-parent" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon">🩺</span> <span class="menu-text">Khám & Điều trị</span></div> <span class="arrow">▼</span>
            </li>
            <ul class="submenu-container open">
                <li class="menu-item" id="menu-khambenh" onclick="window.location.href='khambenh.html'"><span>🏥</span> <span class="menu-text">Khám bệnh</span></li>
                <li class="menu-item" id="menu-phieuchidinh" onclick="window.location.href='phieuchidinh.html'"><span>📋</span> <span class="menu-text">Phiếu chỉ định</span></li>
                <li class="menu-item" id="menu-donthuoc" onclick="window.location.href='donthuoc.html'"><span>📜</span> <span class="menu-text">Đơn thuốc</span></li>
            </ul>
        `;
    }

    // Kho & Vắc-xin (Ai cũng thấy)
    dynamicMenuContent += `
        <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
            <div class="menu-label-wrap"><span class="group-icon">📦</span> <span class="menu-text">Kho & Vắc-xin</span></div> <span class="arrow">▼</span>
        </li>
        <ul class="submenu-container">
            <li class="menu-item" id="menu-khothuoc" onclick="window.location.href='khothuoc.html'"><span>💊</span> <span class="menu-text">Kho thuốc</span></li>
            <li class="menu-item" id="menu-khovaccine" onclick="window.location.href='khovaccine.html'"><span>💉</span> <span class="menu-text">Kho vắc-xin</span></li>
            <li class="menu-item" id="menu-nhatkylamvaccine" onclick="window.location.href='nhatkylamvaccine.html'"><span>⏰</span> <span class="menu-text">Nhật ký tiêm</span></li>
            <li class="menu-item" id="menu-dichvu" onclick="window.location.href='dichvu.html'"><span>📜</span> <span class="menu-text">Giá dịch vụ</span></li>
        </ul>
    `;

    // Quản lý Lưu trú: Chủ phòng khám, Bác sĩ và Quản lý hệ thống thấy (Nhân viên bị ẩn)
    if (isTrueOwner || isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon">🏨</span> <span class="menu-text">Quản lý Lưu trú</span></div> <span class="arrow">▼</span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-noitru" onclick="window.location.href='noitru.html'"><span>🏨</span> <span class="menu-text">Nội trú</span></li>
                <li class="menu-item" id="menu-nhatkynoitru" onclick="window.location.href='nhatkynoitru.html'"><span>📖</span> <span class="menu-text">Nhật ký Nội trú</span></li>
            </ul>
        `;
    }

    // Petshop & Bán hàng: Bác sĩ bị ẩn hoàn toàn (Chủ phòng khám, Nhân viên và Quản lý hệ thống thấy)
    if (!isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon">🛍️</span> <span class="menu-text">Petshop & Bán hàng</span></div> <span class="arrow">▼</span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-danhmucsanpham" onclick="window.location.href='danhmucsanpham.html'"><span>📦</span> <span class="menu-text">Thêm sản phẩm</span></li>
                <li class="menu-item" id="menu-nhatkykho" onclick="window.location.href='nhatkykho.html'"><span>📋</span> <span class="menu-text">Nhật ký kho</span></li>
                <li class="menu-item" id="menu-donhang" onclick="window.location.href='donhang.html'"><span>📊</span> <span class="menu-text">Chi tiết bán hàng</span></li>
                <li class="menu-item" id="menu-intem" onclick="window.location.href='intem.html'"><span>📥</span> <span class="menu-text">In tem mã vạch</span></li>
            </ul>
        `;
    }

    // Quản lý Spa: Bác sĩ bị ẩn hoàn toàn (Chủ phòng khám, Nhân viên và Quản lý hệ thống thấy)
    if (!isBacSi || isHuuTy) {
        dynamicMenuContent += `
            <li class="menu-dropdown-toggle" onclick="toggleSubmenu(this)">
                <div class="menu-label-wrap"><span class="group-icon">✨</span> <span class="menu-text">Quản lý Spa</span></div> <span class="arrow">▼</span>
            </li>
            <ul class="submenu-container">
                <li class="menu-item" id="menu-spa" onclick="window.location.href='spa.html'"><span>✨</span> <span class="menu-text">Bảng giá Spa</span></li>
                <li class="menu-item" id="menu-nhatkyspa" onclick="window.location.href='nhatkyspa.html'"><span>✂️</span> <span class="menu-text">Nhật ký Spa</span></li>
            </ul>
        `;
    }

    dynamicMenuContent += heThongMenuHtml;

    const menuHTML = `
    <div class="sidebar ${isExpired && !isHuuTy ? 'sidebar-frozen' : ''}" id="sidebar">
        <div class="sidebar-header" style="flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="display: flex; align-items: center;">
                <span>🐾</span> <span class="menu-text">VetCare Pro</span>
            </div>
            <div id="sidebar-date" style="font-size: 11px; font-weight: normal; color: rgba(255, 255, 255, 0.85); padding-left: 32px;">
                📅 ${ngayHienTai}
            </div>
        </div>
        
        <li class="menu-item sub-item menu-pos-highlight" id="menu-pos" onclick="${isExpired && !isHuuTy ? 'hienThiThongBaoHetHan()' : "window.location.href='pos.html'"}">
            <span class="pos-icon">⚡</span> 
            <span class="menu-text" style="font-weight: bold;">BÁN HÀNG POS</span>
            <span class="pos-badge">HOT</span>
        </li>
        
        <ul class="menu-list">
            ${dynamicMenuContent}
        </ul>
    </div>

    <style>
        .sidebar { width: 275px !important; min-width: 275px !important; transition: width 0.3s ease; }
        .sidebar .menu-text, .sidebar .menu-category, .sidebar li { font-size: 14px !important; font-weight: 700 !important; }
        .sidebar .menu-category { font-size: 12px !important; font-weight: 800 !important; }
        .sidebar ul li { display: flex !important; align-items: center !important; white-space: nowrap !important; }
        .sidebar ul li span.menu-text { display: inline-block !important; visibility: visible !important; opacity: 1 !important; }
        .sidebar .menu-list > li > span:first-child, .sidebar .menu-pos-highlight .pos-icon, .submenu-container .menu-item span:first-child { display: inline-block; width: 24px; text-align: center; font-size: 16px !important; margin-right: 8px; flex-shrink: 0; }
        .menu-dropdown-toggle { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; color: #ffffff; font-weight: 800 !important; font-size: 13px !important; background: none !important; border: none !important; margin: 4px 8px; border-radius: 6px; transition: background 0.2s ease; user-select: none; }
        .menu-dropdown-toggle .menu-label-wrap { display: flex; align-items: center; white-space: nowrap; overflow: hidden; gap: 8px; }
        .menu-dropdown-toggle .group-icon { display: inline-block; width: 24px; text-align: center; font-size: 16px !important; flex-shrink: 0; }
        .menu-dropdown-toggle:hover { background: rgba(255, 255, 255, 0.1) !important; color: #ffffff; }
        .menu-dropdown-toggle .arrow { font-size: 10px; transition: transform 0.3s ease; flex-shrink: 0; margin-left: 6px; }
        .submenu-container { display: none; list-style: none; padding-left: 10px; margin: 0; }
        .submenu-container.open { display: block; }
        .menu-dropdown-toggle.active-parent .arrow { transform: rotate(180deg); }
        .menu-pos-highlight { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; color: #ffffff !important; border-radius: 6px; margin: 4px 8px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); cursor: pointer; transition: all 0.2s ease; }
        .menu-pos-highlight:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af) !important; transform: translateY(-1px); }
        .menu-pos-highlight .pos-badge { background-color: #dc2626; color: white; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: bold; margin-left: auto; }
        .sidebar-header { font-size: 20px !important; font-weight: bold !important; padding: 15px 15px 10px 15px !important; }
        .sidebar-header span:first-child { font-size: 22px !important; margin-right: 8px; }
        .sidebar-header .menu-text { font-size: 26px !important; letter-spacing: 0.5px; }
        .sidebar-frozen { pointer-events: none; opacity: 0.65; filter: grayscale(30%); }

        .main-content {
            margin-left: 275px;
            transition: margin-left 0.3s ease;
        }

        body.sidebar-collapsed .sidebar {
            width: 70px !important;
            min-width: 70px !important;
            overflow: hidden;
        }

        body.sidebar-collapsed .main-content {
            margin-left: 70px !important;
        }

        body.sidebar-collapsed .sidebar .menu-text,
        body.sidebar-collapsed .sidebar .menu-category,
        body.sidebar-collapsed .sidebar .arrow,
        body.sidebar-collapsed .sidebar .pos-badge,
        body.sidebar-collapsed .sidebar #sidebar-date {
            display: none !important;
        }

        body.sidebar-collapsed .submenu-container.open {
            display: none !important;
        }

        #notification-center-pc { position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; max-width: 350px; width: 100%; pointer-events: none; }
        .notify-toast-pc { background: #ffffff; border-left: 5px solid #059669; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 12px 15px; border-radius: 6px; pointer-events: auto; display: flex; align-items: flex-start; justify-content: space-between; animation: slideInRight 0.3s ease-out forwards; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        #pcNotificationDropdown {
            display: none;
            position: fixed !important;
            top: 60px !important;
            right: 20px !important;
            width: 340px !important;
            max-height: 380px !important;
            overflow-y: auto !important;
            background: #ffffff !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
            z-index: 99999 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            border: 1px solid #cbd5e1 !important;
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
                        window.location.href = 'thanhtoan.html';
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
            <div class="top-navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 25px; background: #ffffff; border-bottom: 1px solid #e2e8f0; height: 55px; box-sizing: border-box; position: relative;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="toggle-btn" onclick="toggleSidebar()" style="cursor: pointer; background: none; border: none; font-size: 18px;">☰</button>
                    <h2 style="margin: 0; font-size: 14px; font-weight: bold; color: #1e3a8a;">HỆ THỐNG QUẢN LÝ PHÒNG KHÁM THÚ Y</h2>
                </div>
                
                <div style="display: flex; align-items: center; gap: 14px; margin-right: 10px;">
                    <div id="headerBellBtnPC" style="position: relative; display: flex; align-items: center; cursor: pointer; padding: 5px;" title="Bấm để xem lịch sử thông báo">
                        <span style="font-size: 22px; color: #fbbf24; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">🔔</span>
                        <span id="navNotificationBadge" style="position: absolute; top: 0; right: 0; background: #dc2626; color: white; font-size: 10px; padding: 1px 5px; border-radius: 50%; display: none; font-weight: bold;">0</span>
                    </div>

                    <div class="search-container" style="position: relative; margin: 0;">
                        <input type="text" id="globalSearchInput" class="search-box" placeholder="🔍 Tìm tên KH, SĐT, thú cưng..." autocomplete="off" style="padding: 7px 12px; width: 220px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;">
                        <div id="searchDropdown" class="search-dropdown"></div>
                    </div>

                    <div onclick="moModalSuaThongTinCaNhan()" style="display: flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 5px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 600; color: #1e293b; cursor: pointer; white-space: nowrap;" title="Bấm để chỉnh sửa thông tin cá nhân">
                        <span>👤</span> <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis;">${tenHienThi}</span>
                    </div>
                    
                    <a href="../mobile/thucung.html" style="background-color: #0284c7; color: white; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 4px;">
                        📱 Giao diện Mobile
                    </a>

                    <button onclick="dangXuat()" style="background-color: #dc2626; color: white; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        🚪 Đăng Xuất
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
            <div style="background: #1e3a8a; color: white; padding: 10px 12px; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <span>🔔 Lịch sử thông báo</span>
                <button onclick="xoaTatCaThongBaoPC()" style="background: none; border: none; color: #fbbf24; font-size: 11px; cursor: pointer;">Xóa tất cả</button>
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
    if (savedSidebarState === 'collapsed') {
        document.body.classList.add('sidebar-collapsed');
    }
});

// --- CÁC HÀM TIỆN ÍCH ---
function toggleSidebar() {
    const body = document.body;
    body.classList.toggle('sidebar-collapsed');
    const isCollapsed = body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
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
        <div style="background: #ffffff; padding: 25px; border-radius: 12px; width: 100%; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); position: relative;">
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
        <div style="background: #ffffff; padding: 35px; border-radius: 12px; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
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
        listDiv.innerHTML = `<div style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc;"><div><div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${noiDungThongBao}</div><div style="font-size: 10px; color: #64748b;">${timeNow}</div></div></div>` + listDiv.innerHTML;
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
