// src/utils/formatData.js

// 1. Format tiền tệ VNĐ
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// 2. Tính khoảng thời gian
export const formatDuration = (days) => {
    if (!days || days <= 1) return "Trong ngày";
    return `${days}N${days - 1}Đ`;
};

// 3. Format ngày ngắn
export const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
};

// --- [MỚI] HÀM CHỌN ICON PHƯƠNG TIỆN ---
const getTransportIcon = (type) => {
    if (!type) return "bi-bus-front"; // Mặc định là Xe
    
    const t = type.toLowerCase();
    if (t.includes("bay")) return "bi-airplane-engines";   // Máy bay
    if (t.includes("tàu") && t.includes("hỏa")) return "bi-train-front"; // Tàu hỏa
    if (t.includes("thuyền") || t.includes("thuỷ")) return "bi-water";   // Du thuyền
    if (t.includes("tự túc")) return "bi-person-walking"; // Tự túc
    
    return "bi-bus-front"; // Xe du lịch / Xe ghế ngồi / Limousine
};

// 4. Map Product từ API -> Props cho BigCard
export const mapProductToCard = (product) => {
    if (!product) return null;

    const t = product.tour_details || {};
    
    // a. Mã Tour
    const tourCode = product._id ? `TOUR-${product._id.slice(-4).toUpperCase()}` : "TOUR-NEW";

    // b. Ngày khởi hành
    const rawDates = t.departure_times || [];
    const sortedDates = [...rawDates].sort((a, b) => new Date(a) - new Date(b));
    const displayDates = sortedDates.slice(0, 3).map(d => formatShortDate(d));

    // c. Ảnh
    const firstImage = (product.images && product.images.length > 0) ? product.images[0] : "";
    const validImage = (firstImage && firstImage.startsWith("http")) 
        ? firstImage 
        : "https://placehold.co/400x300?text=No+Image";

    // d. Phương tiện (Lấy từ DB hoặc mặc định)
    const transportName = t.transport_type || "Đi bộ";

    return {
        id: product._id,
        title: product.title,
        imageUrl: validImage,
        price: product.base_price,
        originalPrice: product.base_price * 1.15,

        // --- CÁC TRƯỜNG MỚI ---
        tourCode: tourCode,
        startPoint: t.start_point || "Hồ Chí Minh",
        duration: formatDuration(t.duration_days),
        
        transport: transportName,            // Tên phương tiện (để hiện chữ)
        transportIcon: getTransportIcon(transportName), // Icon tương ứng (để hiện hình)
        
        departureDates: displayDates
    };
};

export const formatDateWithWeekday = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    return d.toLocaleDateString('vi-VN', options);
};