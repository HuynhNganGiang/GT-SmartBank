// Mạng lưới Chi nhánh & ATM - GT SmartBank
// Tích hợp bản đồ LeafletJS tương tác, bộ lọc nâng cao và tìm kiếm động

// Dữ liệu Demo thực tế tại Bình Thuận, TP.HCM, Đồng Nai
const locations = [
    {
        id: 1,
        name: "Hội sở chính TP.HCM - GT SmartBank",
        address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
        phone: "028.38686868",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6), 08:00 - 11:30 (Thứ 7)",
        type: "Branch",
        lat: 10.7735,
        lng: 106.6605
    },
    {
        id: 2,
        name: "Chi nhánh Quận 1",
        address: "85 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        phone: "028.38212121",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6)",
        type: "Branch",
        lat: 10.7725,
        lng: 106.7042
    },
    {
        id: 3,
        name: "Chi nhánh Bình Thuận",
        address: "123 Trần Hưng Đạo, Phường Phú Thuỷ, TP. Phan Thiết, Bình Thuận",
        phone: "0252.3821821",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6)",
        type: "Branch",
        lat: 10.9382,
        lng: 108.1039
    },
    {
        id: 4,
        name: "Chi nhánh Đồng Nai",
        address: "55 Cách Mạng Tháng Tám, Phường Quyết Thắng, TP. Biên Hòa, Đồng Nai",
        phone: "0251.3941941",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6)",
        type: "Branch",
        lat: 10.9482,
        lng: 106.8189
    },
    {
        id: 5,
        name: "ATM Hoàng Văn Thụ",
        address: "350 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 10.7972,
        lng: 106.6575
    },
    {
        id: 6,
        name: "ATM Lê Lợi",
        address: "65 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 10.7752,
        lng: 106.7001
    },
    {
        id: 7,
        name: "ATM Thủ Khoa Huân",
        address: "45 Thủ Khoa Huân, Phường Bình Hưng, TP. Phan Thiết, Bình Thuận",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 10.9325,
        lng: 108.1082
    },
    {
        id: 8,
        name: "ATM La Gi",
        address: "12 Thống Nhất, Phường Tân Thiện, Thị xã La Gi, Bình Thuận",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 10.6625,
        lng: 107.7836
    },
    {
        id: 9,
        name: "ATM Hùng Vương",
        address: "42 Hùng Vương, Phường Xuân Trung, TP. Long Khánh, Đồng Nai",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 10.9232,
        lng: 107.2372
    },
    {
        id: 10,
        name: "Chi nhánh Đà Nẵng",
        address: "45 Lê Duẩn, Phường Hải Châu I, Quận Hải Châu, TP. Đà Nẵng",
        phone: "0236.3821821",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6)",
        type: "Branch",
        lat: 16.0544,
        lng: 108.2022
    },
    {
        id: 11,
        name: "ATM Bạch Đằng",
        address: "204 Bạch Đằng, Phường Phước Ninh, Quận Hải Châu, TP. Đà Nẵng",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 16.0678,
        lng: 108.2201
    },
    {
        id: 12,
        name: "Chi nhánh Hà Nội",
        address: "15 Ngô Quyền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
        phone: "024.39363636",
        hours: "08:00 - 17:00 (Thứ 2 - Thứ 6)",
        type: "Branch",
        lat: 21.0285,
        lng: 105.8542
    },
    {
        id: 13,
        name: "ATM Hàng Đường",
        address: "72 Hàng Đường, Phường Hàng Đào, Quận Hoàn Kiếm, Hà Nội",
        phone: "1900.545415",
        hours: "24/7",
        type: "ATM",
        lat: 21.0333,
        lng: 105.8456
    }
];

let map;
let markerGroup;
let currentFilter = "all";
let searchPattern = "";

// Icon tùy biến cho Chi nhánh (Màu đỏ thương hiệu GT SmartBank)
const branchIcon = L.divIcon({
    html: `<div class="flex items-center justify-center w-9 h-9 bg-[#b60000] rounded-full border-2 border-white dark:border-slate-900 shadow-md text-white hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21m16.5 0H3.75" /></svg>
    </div>`,
    className: 'custom-map-marker-branch',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

// Icon tùy biến cho Cây ATM (Màu vàng thương hiệu GT SmartBank)
const atmIcon = L.divIcon({
    html: `<div class="flex items-center justify-center w-9 h-9 bg-[#f7b500] rounded-full border-2 border-white dark:border-slate-900 shadow-md text-slate-950 hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
    </div>`,
    className: 'custom-map-marker-atm',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    renderLocations();
});

// Khởi tạo bản đồ Leaflet
function initMap() {
    // Căn giữa khu vực miền Nam (TP.HCM làm tâm)
    map = L.map('map', {
        zoomControl: true
    }).setView([10.7735, 106.6605], 9);

    // Sử dụng OpenStreetMap Tile Layer chất lượng cao
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    markerGroup = L.layerGroup().addTo(map);

    // Di chuyển bộ điều khiển Zoom xuống góc dưới cùng bên phải cho gọn giao diện
    map.zoomControl.setPosition('bottomright');
}

// Xử lý loại bỏ dấu tiếng Việt để tìm kiếm chính xác hơn
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|ã|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|á|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|R|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Kết hợp khoảng trắng thừa
    return str.toLowerCase().trim();
}

// Lọc dữ liệu theo Từ khóa và Loại
function getFilteredLocations() {
    return locations.filter(loc => {
        // Lọc theo loại
        if (currentFilter !== "all" && loc.type !== currentFilter) {
            return false;
        }

        // Lọc theo ô tìm kiếm
        if (searchPattern) {
            const rawSearch = removeVietnameseTones(searchPattern);
            const rawName = removeVietnameseTones(loc.name);
            const rawAddress = removeVietnameseTones(loc.address);
            return rawName.includes(rawSearch) || rawAddress.includes(rawSearch);
        }

        return true;
    });
}

// Hiển thị danh sách địa điểm và vẽ các Marker lên bản đồ
function renderLocations() {
    const listContainer = document.getElementById("locationList");
    const filtered = getFilteredLocations();

    // Xóa tất cả marker hiện tại
    markerGroup.clearLayers();

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 flex flex-col items-center justify-center gap-2">
                <span class="text-3xl text-slate-350 dark:text-slate-650">🔍</span>
                <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Không tìm thấy địa điểm nào khớp với bộ lọc.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = "";
    const mapBounds = L.latLngBounds();

    filtered.forEach(loc => {
        // 1. Tạo Marker và đưa lên bản đồ
        const marker = L.marker([loc.lat, loc.lng], {
            icon: loc.type === "Branch" ? branchIcon : atmIcon
        });

        // Liên kết popup thông tin
        marker.bindPopup(createPopupHtml(loc));
        marker.addTo(markerGroup);

        // Lưu đối tượng marker để có thể kích hoạt sau này
        loc.marker = marker;
        mapBounds.extend([loc.lat, loc.lng]);

        // 2. Thêm thẻ HTML vào danh sách bên trái
        const card = document.createElement("div");
        const borderType = loc.type === "Branch" ? "border-[#b60000]" : "border-[#f7b500]";
        const textBadgeColor = loc.type === "Branch" ? "bg-rose-50 dark:bg-rose-950/40 text-[#b60000] dark:text-rose-400" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400";
        const typeLabel = loc.type === "Branch" ? "Chi nhánh" : "ATM";

        card.className = `p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 ${borderType} rounded-r-xl border border-y-slate-200/50 border-r-slate-200/50 dark:border-y-slate-800/45 dark:border-r-slate-800/45 cursor-pointer transition-all hover:translate-x-1 duration-200 group flex flex-col justify-between`;
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-2 mb-1.5">
                    <h3 class="font-extrabold text-sm text-slate-800 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-amber-400 transition-colors leading-tight">${loc.name}</h3>
                    <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full ${textBadgeColor} uppercase tracking-wider flex-shrink-0">${typeLabel}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-3 flex items-start gap-1">
                    <span class="text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5">📍</span>
                    <span>${loc.address}</span>
                </p>
            </div>
            <div class="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-550 font-bold border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
                <span>📞 ${loc.phone}</span>
                <span>🕒 ${loc.type === "Branch" ? "Hành chính" : "24/7"}</span>
            </div>
        `;

        // Nhấp vào thẻ danh sách để căn giữa bản đồ
        card.addEventListener("click", () => {
            focusLocation(loc.id);
        });

        listContainer.appendChild(card);
    });

    // Tự động căn khung bản đồ hiển thị vừa đủ tất cả các Marker được hiển thị
    if (filtered.length > 0) {
        map.fitBounds(mapBounds, { padding: [50, 50] });
    }
}

// Tập trung bản đồ vào 1 marker và mở popup tương ứng
function focusLocation(id) {
    const loc = locations.find(l => l.id === id);
    if (loc && loc.marker) {
        map.setView([loc.lat, loc.lng], 15, {
            animate: true,
            duration: 0.8
        });
        loc.marker.openPopup();

        // Cuộn khung bản đồ lên trên trên mobile nếu cần thiết
        if (window.innerWidth < 1024) {
            document.getElementById("map").scrollIntoView({ behavior: "smooth" });
        }
    }
}

// Xử lý sự kiện tìm kiếm tự động
function handleSearch() {
    searchPattern = document.getElementById("searchInput").value;
    renderLocations();
}

// Chuyển đổi bộ lọc (Tất cả / Chi nhánh / ATM)
function setFilter(filterType) {
    currentFilter = filterType;

    // Cập nhật giao diện nút hoạt động
    const btnAll = document.getElementById("btnFilterAll");
    const btnBranch = document.getElementById("btnFilterBranch");
    const btnATM = document.getElementById("btnFilterATM");

    // Reset styles
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
    const activeClass = "bg-white dark:bg-slate-850 text-rose-700 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-800/40";

    [btnAll, btnBranch, btnATM].forEach(btn => {
        btn.className = btn.className.replace(activeClass, "").replace(inactiveClass, "").trim();
    });

    if (filterType === "all") {
        btnAll.className += " " + activeClass;
        btnBranch.className += " " + inactiveClass;
        btnATM.className += " " + inactiveClass;
    } else if (filterType === "Branch") {
        btnAll.className += " " + inactiveClass;
        btnBranch.className += " " + activeClass;
        btnATM.className += " " + inactiveClass;
    } else if (filterType === "ATM") {
        btnAll.className += " " + inactiveClass;
        btnBranch.className += " " + inactiveClass;
        btnATM.className += " " + activeClass;
    }

    renderLocations();
}

// Tạo mã HTML Popup đẹp cho bản đồ
function createPopupHtml(loc) {
    const typeText = loc.type === "Branch" ? "Chi nhánh" : "Cây ATM";
    const typeBg = loc.type === "Branch" ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
    
    return `
        <div class="flex flex-col gap-2.5 min-w-[240px] max-w-[280px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span class="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${typeBg}">${typeText}</span>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">GT SmartBank</span>
            </div>
            <div>
                <h3 class="font-extrabold text-sm text-slate-850 dark:text-slate-200 leading-snug mb-1">${loc.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-1">
                    <span class="text-slate-400 flex-shrink-0 mt-0.5">📍</span>
                    <span>${loc.address}</span>
                </p>
            </div>
            <div class="grid grid-cols-1 gap-1 text-[11px] text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div class="flex items-start gap-1.5">
                    <span class="text-slate-400 flex-shrink-0">🕒</span>
                    <span><strong>Giờ mở cửa:</strong> ${loc.hours}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="text-slate-400 flex-shrink-0">📞</span>
                    <span><strong>Đường dây nóng:</strong> ${loc.phone}</span>
                </div>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}" target="_blank" class="flex items-center justify-center gap-1.5 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold text-center transition-all shadow-md shadow-rose-600/20 hover:shadow-rose-600/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>
                Tìm đường đi
            </a>
        </div>
    `;
}
