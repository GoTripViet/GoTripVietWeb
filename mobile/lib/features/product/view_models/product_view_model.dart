import 'package:flutter/material.dart';
import '../../../shared/models/product_model.dart';
import '../services/product_service.dart';
import '../services/inventory_service.dart';

class ProductViewModel extends ChangeNotifier {
  final ProductService _productService = ProductService();
  final InventoryService _inventoryService = InventoryService();

  ProductModel? _product;
  List<dynamic> _inventoryItems = [];
  dynamic _selectedInventory; // The specific date user chooses
  
  bool _isLoading = true;
  String _error = '';

  ProductModel? get product => _product;
  List<dynamic> get inventoryItems => _inventoryItems;
  dynamic get selectedInventory => _selectedInventory;
  bool get isLoading => _isLoading;
  String get error => _error;

  // Fetch both Product and Inventory
  Future<void> loadProductDetails(String id) async {
    _isLoading = true;
    _error = '';
    notifyListeners();

    try {
      final results = await Future.wait([
        _productService.getProductDetail(id),
        _inventoryService.getInventoryByProductId(id),
      ]);

      // Parse Product
      _product = ProductModel.fromJson(results[0] as Map<String, dynamic>);
      
      // Parse Inventory (Sort by date)
      var rawInventory = results[1] as List<dynamic>;
      rawInventory.sort((a, b) => 
        DateTime.parse(a['tour_details']['date']).compareTo(DateTime.parse(b['tour_details']['date']))
      );
      _inventoryItems = rawInventory;

      // Select first available date by default
      if (_inventoryItems.isNotEmpty) {
        _selectedInventory = _inventoryItems[0];
      }

    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectDate(dynamic inventoryItem) {
    _selectedInventory = inventoryItem;
    notifyListeners();
  }
}