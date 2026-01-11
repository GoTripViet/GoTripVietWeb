import 'package:flutter/material.dart';
import '../services/booking_service.dart';
import '../../product/services/inventory_service.dart';

// Helper class for Passenger Details
class PassengerInfo {
  String fullName = '';
  String gender = 'Nam';
  String type; // adult, child, toddler, infant
  DateTime? dob;

  PassengerInfo({required this.type});
}

class BookingViewModel extends ChangeNotifier {
  final BookingService _bookingService = BookingService();
  final InventoryService _inventoryService = InventoryService();

  bool _isLoading = false;
  String _errorMessage = '';

  // Passenger Counts
  int _adults = 1;
  int _children = 0;
  int _toddlers = 0; // 2-4 years
  int _infants = 0; // < 2 years

  // Passenger Detail List
  List<PassengerInfo> _passengers = [PassengerInfo(type: 'adult')];

  // Promo Code
  String _promoCode = '';
  Map<String, dynamic>? _appliedPromo;
  String _promoError = '';

  // Getters
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  int get adults => _adults;
  int get children => _children;
  int get toddlers => _toddlers;
  int get infants => _infants;
  List<PassengerInfo> get passengers => _passengers;
  Map<String, dynamic>? get appliedPromo => _appliedPromo;
  String get promoError => _promoError;

  // --- 1. HANDLE COUNTS & PASSENGER LIST ---
  void updateCount(String type, int delta) {
    if (type == 'adult') {
      if (_adults + delta < 1) return;
      _adults += delta;
    } else if (type == 'child') {
      if (_children + delta < 0) return;
      _children += delta;
    } else if (type == 'toddler') {
      if (_toddlers + delta < 0) return;
      _toddlers += delta;
    } else if (type == 'infant') {
      if (_infants + delta < 0) return;
      _infants += delta;
    }

    _regeneratePassengerList();
    notifyListeners();
  }

  // Rebuild the list of forms (Keep existing data if possible)
  void _regeneratePassengerList() {
    List<PassengerInfo> newList = [];

    void addType(int count, String type) {
      for (int i = 0; i < count; i++) {
        // Try to find existing data to preserve user input
        var existing = _passengers.where((p) => p.type == type).toList();
        if (i < existing.length) {
          newList.add(existing[i]);
        } else {
          newList.add(PassengerInfo(type: type));
        }
      }
    }

    addType(_adults, 'adult');
    addType(_children, 'child');
    addType(_toddlers, 'toddler');
    addType(_infants, 'infant');

    _passengers = newList;
  }

  void updatePassengerInfo(
    int index, {
    String? name,
    String? gender,
    DateTime? dob,
  }) {
    if (name != null) _passengers[index].fullName = name;
    if (gender != null) _passengers[index].gender = gender;
    if (dob != null) _passengers[index].dob = dob;
    notifyListeners(); // UI needs to update
  }

  // --- 2. PROMO CODE LOGIC ---
  Future<void> applyPromoCode(String code, double currentSubTotal) async {
    _isLoading = true;
    _promoError = '';
    notifyListeners();

    final result = await _inventoryService.checkPromotion(code);

    if (result == null) {
      _appliedPromo = null;
      _promoError = 'Mã giảm giá không hợp lệ';
    } else {
      // Check min spend rule
      final minSpend = result['rules']?['min_spend'] ?? 0;
      if (currentSubTotal < minSpend) {
        _appliedPromo = null;
        _promoError = 'Đơn hàng chưa đủ điều kiện (Tối thiểu ${minSpend})';
      } else {
        _appliedPromo = result;
        _promoError = '';
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  void removePromo() {
    _appliedPromo = null;
    _promoError = '';
    notifyListeners();
  }

  // --- 3. PRICE CALCULATION ---
  Map<String, double> calculatePrice(double basePrice) {
    // Pricing Rules from React:
    // Adult: 100%, Child: 80%, Toddler: 50%, Infant: 10%
    double subTotal = 0;
    subTotal += _adults * basePrice;
    subTotal += _children * (basePrice * 0.8);
    subTotal += _toddlers * (basePrice * 0.5);
    subTotal += _infants * (basePrice * 0.1);

    double discount = 0;
    if (_appliedPromo != null) {
      if (_appliedPromo!['type'] == 'percentage') {
        discount = subTotal * ((_appliedPromo!['value'] ?? 0) / 100);
      } else {
        discount = (_appliedPromo!['value'] ?? 0).toDouble();
      }

      // Ensure discount doesn't exceed total
      if (discount > subTotal) discount = subTotal;
    }

    return {
      'subTotal': subTotal,
      'discount': discount,
      'final': subTotal - discount,
    };
  }

  // --- 4. SUBMIT ---
  Future<dynamic> submitBooking({
    required String productId,
    required String productTitle,
    required dynamic inventoryItem,
    required String userId,
    required Map<String, dynamic> contactInfo,
    required double basePrice,
    required Map<String, double> priceData,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      // 1. Chuẩn bị danh sách hành khách (Khớp với React)
      List<Map<String, dynamic>> passengerPayload = _passengers
          .map(
            (p) => {
              'fullName': p.fullName,
              'gender': p.gender,
              'type': p.type,
              'dateOfBirth': p.dob?.toIso8601String(),
            },
          )
          .toList();

      // 2. Chuẩn bị Items (QUAN TRỌNG: Key phải khớp Order.jsx)
      List<Map<String, dynamic>> items = [];
      items.add({
        "productId": productId, // Sửa: product -> productId
        "inventoryId": inventoryItem['_id'], // Sửa: inventory -> inventoryId
        "productType": "tour", // Thêm: productType
        "quantity": _adults + _children + _toddlers + _infants,
        "unitPrice": basePrice, // Sửa: price -> unitPrice
        "productTitle": productTitle, // Sửa: name -> productTitle
        "currency": "VND",
        // Bạn có thể thêm "detailsText": "Ngày đi: ..." nếu cần
      });

      // 3. Tạo Payload tổng (Khớp cấu trúc React)
      final bookingData = {
        // React không gửi top-level product/inventory_id, chỉ gửi trong items
        // Nhưng nếu backend mobile API cần, bạn có thể giữ lại.
        // Tuy nhiên, an toàn nhất là gửi đủ cả 2 chuẩn.
        'product': productId,
        'inventory_id': inventoryItem['_id'],

        'items': items, // ✅ Cấu trúc items đã chuẩn theo React
        'promotionCode': _appliedPromo != null ? _appliedPromo!['code'] : null,
        'passengers': passengerPayload,
        'contactInfo': contactInfo,
        'total_price': priceData['final'],
        'user': userId,
        'status': 'pending',
        'payment_status': 'unpaid',
      };

      print("📦 Payload gửi đi: $bookingData"); // Debug xem data

      final result = await _bookingService.createBooking(bookingData);

      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      print("❌ Lỗi Booking: $e");
      notifyListeners();
      return null;
    }
  }
  
}
