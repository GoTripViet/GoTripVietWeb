import 'package:intl/intl.dart';

class ProductModel {
  final String id;
  final String title;
  final String imageUrl; // Thumbnail
  final List<String> images; // All images
  final num price;
  final String duration;
  final String transport;
  final String startPoint;
  final num hotelRating;
  final List<ItineraryItem> itinerary; 
  final List<DateTime>? departureDates; // Smart Schedule
  final String productCode;

  ProductModel({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.images,
    required this.price,
    required this.duration,
    required this.transport,
    required this.startPoint,
    required this.hotelRating,
    required this.itinerary,
    this.departureDates,
    required this.productCode,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final details = json['tour_details'] ?? {};
    
    // 1. Parse Itinerary
    // Handle cases where itinerary might be null or empty
    var rawItinerary = details['itinerary'];
    List<ItineraryItem> itineraryList = [];
    
    if (rawItinerary != null && rawItinerary is List) {
      itineraryList = rawItinerary.map((i) => ItineraryItem.fromJson(i)).toList();
    }

    // 2. Parse Images (Handle both Objects and Strings)
    List<String> imgList = [];
    if (json['images'] != null && json['images'] is List) {
      imgList = (json['images'] as List).map((i) {
        if (i is Map && i['url'] != null) return i['url'].toString();
        if (i is String) return i;
        return '';
      }).where((s) => s.isNotEmpty).toList();
    }

    // 3. Format Duration (e.g., "3N2Đ")
    int days = details['duration_days'] ?? 1;
    String formattedDuration = "$days ngày";
    if (days > 1) {
      formattedDuration = "${days}N${days - 1}Đ";
    }

    // 4. Parse Departure Dates (Injected from HomeService)
    List<DateTime> dates = [];
    if (json['departure_dates'] != null && json['departure_dates'] is List) {
      dates = (json['departure_dates'] as List)
          .map((e) => DateTime.parse(e.toString()))
          .toList();
    }

    return ProductModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? 'Chưa cập nhật tên',
      imageUrl: imgList.isNotEmpty ? imgList[0] : 'https://placehold.co/400x300',
      images: imgList,
      price: json['base_price'] ?? 0,
      duration: formattedDuration,
      transport: details['transport_type'] ?? 'Chưa cập nhật',
      startPoint: details['start_point'] ?? 'Chưa cập nhật',
      hotelRating: details['hotel_rating'] ?? 0,
      itinerary: itineraryList,
      departureDates: dates,
      productCode: json['product_code'] ?? 'Chưa cập nhật',
    );
  }

  
}

class ItineraryItem {
  final String day;
  final String title;
  final String details;

  ItineraryItem({required this.day, required this.title, required this.details});

  factory ItineraryItem.fromJson(Map<String, dynamic> json) {
    return ItineraryItem(
      day: json['day'].toString(),
      title: json['title'] ?? '',
      details: json['details'] ?? '',
    );
  }
}