// src/api/inventoryApi.js
import axios from 'axios';

const inventoryClient = axios.create({
  baseURL: 'http://localhost:3003', // Port 3003 của Inventory
  headers: {
    'Content-Type': 'application/json',
  },
});

const inventoryApi = {
  // Lấy lịch khởi hành (đã làm)
  getInventoryByProductId: (productId) => {
    return inventoryClient.get(`/inventory/product/${productId}`);
  },

  // [MỚI] Kiểm tra mã giảm giá
  checkPromotion: (code) => {
    return inventoryClient.get(`/promotions/code/${code}`);
  }
};

export default inventoryApi;