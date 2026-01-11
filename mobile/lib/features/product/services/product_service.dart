import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/product_model.dart';

class ProductService {
  // Catalog Service (Port 3000)
  final ApiClient _client = ApiClient(baseUrl: ApiConstants.catalogUrl);

  // Lấy chi tiết sản phẩm theo ID
  // Tương ứng: catalogApi.getById(id)
  Future<Map<String, dynamic>> getProductDetail(String id) async {
    try {
      final response = await _client.dio.get('/products/$id');
      // Backend trả về trọn bộ object product
      return response.data; 
    } catch (e) {
      throw Exception('Không tải được thông tin tour');
    }
  }
}