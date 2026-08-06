function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "flex";
}

// Đóng Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

// Đóng modal khi click nền tối
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.style.display = "none";
    }
});

// Alert thành công
function showSuccess(message) {
    alert("✅ " + message);
}

// Alert lỗi
function showError(message) {
    alert("❌ " + message);
}

// Xác nhận xóa
function confirmDelete(message = "Bạn có chắc muốn xóa?") {
    return confirm(message);
}

// Loading
function showLoading() {

    let loading = document.getElementById("loading");

    if (!loading) {

        loading = document.createElement("div");
        loading.id = "loading";

        loading.innerHTML = `
            <div class="loading-box">
                Đang tải...
            </div>
        `;

        loading.style.position = "fixed";
        loading.style.top = 0;
        loading.style.left = 0;
        loading.style.right = 0;
        loading.style.bottom = 0;
        loading.style.background = "rgba(0,0,0,.25)";
        loading.style.display = "flex";
        loading.style.justifyContent = "center";
        loading.style.alignItems = "center";
        loading.style.zIndex = 99999;

        document.body.appendChild(loading);
    }

    loading.style.display = "flex";
}

// Ẩn Loading
function hideLoading() {

    const loading = document.getElementById("loading");

    if (loading) {
        loading.style.display = "none";
    }
}