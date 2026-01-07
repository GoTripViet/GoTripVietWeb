import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../view_models/profile_view_model.dart';
import '../../../../core/utils/image_helper.dart';
import 'order_detail_screen.dart'; // ✅ Import Detail Screen

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({Key? key}) : super(key: key);

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  @override
  void initState() {
    super.initState();
    // Refresh data when entering the screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProfileViewModel>(context, listen: false).fetchMyBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          "Lịch sử đơn hàng",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(color: Colors.black),
      ),
      body: Consumer<ProfileViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isLoadingBookings) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF00897B)),
            );
          }

          if (viewModel.bookings.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: viewModel.fetchMyBookings,
            color: const Color(0xFF00897B),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: viewModel.bookings.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final booking = viewModel.bookings[index];
                return _buildOrderCard(booking);
              },
            ),
          );
        },
      ),
    );
  }

  // --- WIDGET: EMPTY STATE ---
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.airplane_ticket_outlined,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            "Bạn chưa có chuyến đi nào",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Hãy khám phá và đặt tour ngay hôm nay!",
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  // --- WIDGET: ORDER CARD ---
  Widget _buildOrderCard(dynamic booking) {
    // Safe Data Extraction
    final items = booking['items'] as List?;
    final firstItem = (items != null && items.isNotEmpty) ? items[0] : {};
    final snapshot = firstItem['snapshot'] ?? {};

    final String title =
        snapshot['title'] ?? firstItem['productTitle'] ?? "Đang cập nhật...";

    // Image Helper
    String rawImage = snapshot['image'] ?? "";
    final String validImageUrl = ImageHelper.resolveUrl(rawImage);

    final String bookingId = booking['_id'] ?? "";
    final String status = booking['status'] ?? "pending";
    final num price = booking['pricing']?['final_price'] ?? 0;

    // Date Formatting
    String dateStr = "";
    if (booking['createdAt'] != null) {
      final date = DateTime.parse(booking['createdAt']);
      dateStr = DateFormat('dd/MM/yyyy').format(date);
    }

    // ✅ Wrap in GestureDetector for navigation
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OrderDetailScreen(bookingId: bookingId),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header: Date & ID
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Ngày đặt: $dateStr",
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  Text(
                    "ID: ${bookingId.length > 6 ? bookingId.substring(bookingId.length - 6).toUpperCase() : bookingId}",
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: CachedNetworkImage(
                      imageUrl: validImageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      placeholder: (context, url) =>
                          Container(color: Colors.grey[200]),
                      errorWidget: (context, url, error) => Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey[200],
                        child: const Icon(
                          Icons.broken_image,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        _buildStatusBadge(status),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFEEEEEE)),

            // Footer: Price & Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Tổng thanh toán",
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        NumberFormat.currency(
                          locale: 'vi',
                          symbol: 'đ',
                        ).format(price),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF00897B),
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // ✅ Navigate to Order Detail
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              OrderDetailScreen(bookingId: bookingId),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF00897B),
                      elevation: 0,
                      side: const BorderSide(color: Color(0xFF00897B)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text("Chi tiết"),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper: Status Badge
  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'confirmed':
        color = Colors.blue;
        label = "Đã xác nhận";
        icon = Icons.check_circle_outline;
        break;
      case 'completed':
        color = Colors.green;
        label = "Hoàn thành";
        icon = Icons.flag_outlined;
        break;
      case 'cancelled':
        color = Colors.red;
        label = "Đã hủy";
        icon = Icons.cancel_outlined;
        break;
      case 'failed':
        color = Colors.grey;
        label = "Thất bại";
        icon = Icons.error_outline;
        break;
      default: // pending
        color = Colors.orange;
        label = "Chờ xử lý";
        icon = Icons.hourglass_empty;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
