// Bộ quản lý phân trang chung
const PaginationManager = {
    // Trạng thái mặc định
    state: {
        trangHienTai: 1,
        soDongMoiTrang: 10
    },

    // Hàm cắt mảng dữ liệu theo trang
    layDuLieuTrang: function(danhSachGoc, soDongMoiTrang = 10) {
        this.state.soDongMoiTrang = soDongMoiTrang;
        const { trangHienTai } = this.state;
        
        const viTriBatDau = (trangHienTai - 1) * soDongMoiTrang;
        const viTriKetThuc = viTriBatDau + soDongMoiTrang;
        
        return danhSachGoc.slice(viTriBatDau, viTriKetThuc);
    },

    // Hàm vẽ các nút phân trang ra HTML
    veNutPhanTrang: function(tongSoDong, containerId, callbackRender) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const { trangHienTai, soDongMoiTrang } = this.state;
        const tongSoTrang = Math.ceil(tongSoDong / soDongMoiTrang);

        if (tongSoTrang <= 1) return; // Nếu chỉ có 1 trang thì ẩn thanh phân trang

        // Nút Trước
        container.innerHTML += `
            <button class="page-btn" ${trangHienTai === 1 ? 'disabled' : ''} onclick="PaginationManager.chuyenTrang(${trangHienTai - 1}, ${tongSoTrang}, '${containerId}', ${callbackRender.name})">◀ Trước</button>
        `;

        // Các số trang
        for (let i = 1; i <= tongSoTrang; i++) {
            if (i === 1 || i === tongSoTrang || (i >= trangHienTai - 1 && i <= trangHienTai + 1)) {
                container.innerHTML += `
                    <button class="page-btn ${i === trangHienTai ? 'active' : ''}" onclick="PaginationManager.chuyenTrang(${i}, ${tongSoTrang}, '${containerId}', ${callbackRender.name})">${i}</button>
                `;
            } else if (i === trangHienTai - 2 || i === trangHienTai + 2) {
                container.innerHTML += `<span style="padding: 0 4px; color: #64748b;">...</span>`;
            }
        }

        // Nút Sau
        container.innerHTML += `
            <button class="page-btn" ${trangHienTai === tongSoTrang ? 'disabled' : ''} onclick="PaginationManager.chuyenTrang(${trangHienTai + 1}, ${tongSoTrang}, '${containerId}', ${callbackRender.name})">Sau ▶</button>
        `;
    },

    // Hàm xử lý khi bấm chuyển trang
    chuyenTrang: function(trangMoi, tongSoTrang, containerId, renderFunc) {
        if (trangMoi < 1 || trangMoi > tongSoTrang) return;
        this.state.trangHienTai = trangMoi;
        
        if (typeof renderFunc === 'function') {
            renderFunc();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Reset về trang 1 (dùng khi tìm kiếm)
    resetTrang: function() {
        this.state.trangHienTai = 1;
    }
};