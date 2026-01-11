import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/models/event_model.dart'; // Import Event Model
import '../../product/services/inventory_service.dart'; // Import Inventory Service

class HomeService {
  final ApiClient _catalogClient = ApiClient(baseUrl: ApiConstants.catalogUrl);
  final ApiClient _inventoryClient = ApiClient(
    baseUrl: "${ApiConstants.baseUrl}:3003",
  ); // Port 3003 for Events

  // Reuse InventoryService logic to check dates for tours
  final InventoryService _inventoryService = InventoryService();

  // 1. Fetch Newest Tours with Smart Schedule
  Future<List<ProductModel>> fetchNewestTours() async {
    try {
      final response = await _catalogClient.dio.get(
        '/products',
        queryParameters: {
          'product_type': 'tour',
          'limit': 6,
          'sort': '-createdAt',
        },
      );

      final rawList =
          response.data['products'] ?? response.data['data']['products'] ?? [];
      List<ProductModel> smartList = [];

      for (var item in rawList) {
        List<String> validDates = [];

        try {
          // Lấy lịch từ Inventory
          final invList = await _inventoryService.getInventoryByProductId(
            item['_id'],
          );

          for (var inv in invList) {
            if (inv['tour_details'] != null &&
                inv['tour_details']['date'] != null) {
              bool isActive = inv['is_active'] ?? true;
              int total = inv['tour_details']['total_slots'] ?? 0;
              int booked = inv['tour_details']['booked_slots'] ?? 0;
              String dateStr = inv['tour_details']['date'];

              // 🔥 SỬA TẠI ĐÂY: Bỏ điều kiện so sánh ngày giờ (isAfter)
              // Chỉ cần Active và Còn chỗ là lấy luôn
              if (isActive && (total - booked) > 0) {
                validDates.add(dateStr);
              }
            }
          }

          // Sắp xếp ngày tăng dần
          validDates.sort(
            (a, b) => DateTime.parse(a).compareTo(DateTime.parse(b)),
          );
        } catch (e) {
          print("⚠️ Lỗi lấy lịch: $e");
        }

        item['departure_dates'] = validDates;
        smartList.add(ProductModel.fromJson(item));
      }

      return smartList;
    } catch (e) {
      return [];
    }
  }

  Future<List<EventModel>> fetchEvents() async {
    try {
      final now = DateTime.now();
      // Call endpoint: /inventory/events/month/:year/:month
      final response = await _inventoryClient.dio.get(
        '/inventory/events/month/${now.year}/${now.month}',
      );

      final data = response.data is List
          ? response.data
          : response.data['data'] ?? [];
      return (data as List).map((e) => EventModel.fromJson(e)).toList();
    } catch (e) {
      print("Error fetching events: $e");
      return [];
    }
  }

  // 3. Locations (Keep existing)
  Future<List<dynamic>> fetchLocations() async {
    try {
      final response = await _catalogClient.dio.get('/locations');
      return response.data is List
          ? response.data
          : response.data['data'] ?? [];
    } catch (e) {
      return [];
    }
  }

  // 4. Categories (Keep existing)
  Future<List<dynamic>> fetchCategories() async {
    try {
      final response = await _catalogClient.dio.get('/categories');
      return response.data is List
          ? response.data
          : response.data['data'] ?? [];
    } catch (e) {
      return [];
    }
  }
}
