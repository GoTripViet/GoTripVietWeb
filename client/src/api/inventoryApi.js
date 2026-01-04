import axios from "axios";

const inventoryClient = axios.create({
  baseURL: "http://localhost:3003", // Port 3003 của Inventory
  headers: {
    "Content-Type": "application/json",
  },
});

const inventoryApi = {
  // Lấy lịch khởi hành (đã làm)
  getInventoryByProductId: (productId) => {
    return inventoryClient.get(`/inventory/product/${productId}`);
  },
  // Kiểm tra mã giảm giá
  checkPromotion: (code) => {
    return inventoryClient.get(`/promotions/code/${code}`);
  },
  // EVENTS (PUBLIC)
  getActiveEvents: () => {
    return inventoryClient.get(`/events/active`);
  },
  // Lấy chi tiết sự kiện public theo id hoặc slug
  getPublicEventByIdOrSlug: (idOrSlug) => {
    return inventoryClient.get(`/events/public/${idOrSlug}`);
  },
  // Lấy danh sách tour áp dụng sự kiện public theo id hoặc slug
  getPublicEventTours: (idOrSlug) => {
    return inventoryClient.get(`/events/public/${idOrSlug}/tours`);
  },
  // Lấy tất cả event trong tháng (theo month 1-12)
  getEventsInMonth: (year, month) => {
    return inventoryClient.get(`/events/public/month`, {
      params: { year, month },
    });
  },
};

export default inventoryApi;
