// js/menu.js
function loadMenu(activePage) {
    // 1. Phân quyền giả lập (sau này bạn thay bằng logic lấy từ Login)
    const userRole = 'admin'; // Hoặc 'bacsi', 'letan'
    
    // 2. Định nghĩa menu
    const navItems = [
        { id: 'trangchu', name: 'Trang chủ', link: 'trangchu.html', icon: 'fa-house' },
        { id: 'lichhen', name: 'Lịch hẹn', link: 'lichhen.html', icon: 'fa-calendar-days' },
        { id: 'thucung', name: 'Thú cưng', link: 'thucung.html', icon: 'fa-paw' },
        { id: 'thongke', name: 'Báo cáo', link: 'thongke.html', icon: 'fa-chart-line' },
        { id: 'taikhoan', name: 'Tài khoản', link: 'quanlyuser.html', icon: 'fa-user' }
    ];

    // 3. Tạo HTML menu
    let html = '';
    navItems.forEach(item => {
        // Sau này bạn thêm logic if (item.role.includes(userRole)) ở đây để phân quyền
        const activeClass = (activePage === item.id) ? 'active' : '';
        html += `
            <a href="${item.link}" class="nav-item ${activeClass}">
                <i class="fa-solid ${item.icon}"></i>
                ${item.name}
            </a>
        `;
    });

    // 4. Bơm vào thẻ div có id="bottom-nav-container"
    const container = document.getElementById('bottom-nav-container');
    if (container) {
        container.innerHTML = html;
    }
}