import 'package:flutter/material.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/models/event_model.dart'; // Import
import '../services/home_service.dart';

class HomeViewModel extends ChangeNotifier {
  final HomeService _homeService = HomeService();

  List<ProductModel> _tours = [];
  List<dynamic> _locations = [];
  List<dynamic> _categories = [];
  List<EventModel> _events = []; // NEW

  bool _isLoading = false;

  List<ProductModel> get tours => _tours;
  List<dynamic> get locations => _locations;
  List<dynamic> get categories => _categories;
  List<EventModel> get events => _events; // Getter
  bool get isLoading => _isLoading;

  Future<void> loadHomeData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        _homeService.fetchNewestTours(), // Updated method
        
        _homeService.fetchLocations(),
        _homeService.fetchCategories(),
        _homeService.fetchEvents(), // New method
      ]);

      _tours = results[0] as List<ProductModel>;
      _locations = results[1] as List<dynamic>;
      _categories = results[2] as List<dynamic>;
      _events = results[3] as List<EventModel>;

    } catch (e) {
      print("Error loading home data: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}