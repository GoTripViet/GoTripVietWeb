import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/image_helper.dart';
import '../../../booking/services/booking_service.dart';

class OrderDetailScreen extends StatefulWidget {
  final String bookingId;

  const OrderDetailScreen({Key? key, required this.bookingId}) : super(key: key);

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final BookingService _bookingService = BookingService();
  
  bool _isLoading = true;
  Map<String, dynamic>? _booking;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBookingDetail();
  }

  // 1. Fetch Data
  Future<void> _fetchBookingDetail() async {
    setState(() { _isLoading = true; _errorMessage = null; });
    try {
      final data = await _bookingService.getBookingDetails(widget.bookingId);
      setState(() { _booking = data; _isLoading = false; });
    } catch (e) {
      setState(() { _errorMessage = "Không thể tải thông tin đơn hàng."; _isLoading = false; });
    }
  }

  // 2. Cancel Booking Action
  Future<void> _handleCancelBooking() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Hủy đơn hàng?"),
        content: const Text("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Không")),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true), 
            child: const Text("Hủy đơn", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _bookingService.cancelBooking(widget.bookingId);
        if(!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Đã hủy đơn hàng thành công")));
        _fetchBookingDetail(); // Refresh data
      } catch (e) {
        if(!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Lỗi khi hủy đơn hàng"), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFF00897B))));
    if (_errorMessage != null) return Scaffold(appBar: AppBar(title: const Text("Chi tiết")), body: Center(child: Text(_errorMessage!)));
    if (_booking == null) return const Scaffold();

    // --- DATA PARSING ---
    final status = _booking!['status'] ?? 'pending';
    final paymentStatus = _booking!['payment_status'] ?? 'unpaid';
    final paymentMethod = _booking!['payment_method'] ?? 'unknown'; // ✅ NEW
    
    // Date
    String bookingDate = "N/A";
    if (_booking!['createdAt'] != null) {
      bookingDate = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(_booking!['createdAt']));
    }

    final contact = _booking!['contact_info'] ?? {};
    final pricing = _booking!['pricing'] ?? {};
    final items = _booking!['items'] as List? ?? [];
    final firstItem = items.isNotEmpty ? items[0] : {};
    final snapshot = firstItem['snapshot'] ?? {};
    final passengers = _booking!['passengers'] as List? ?? [];
    final String? note = _booking!['note']; // ✅ NEW

    // Pricing Breakdown
    final num totalPrice = pricing['total_price'] ?? 0; // Base price
    final num discount = pricing['discount'] ?? 0;      // Discount
    final num finalPrice = pricing['final_price'] ?? 0; // Final

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text("Chi tiết đơn hàng", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- 1. HEADER: ID, DATE & STATUS ---
            _buildStatusHeader(status, widget.bookingId, bookingDate),
            const SizedBox(height: 16),

            // --- 2. PRODUCT INFO ---
            _buildSectionTitle("Thông tin chuyến đi"),
            _buildProductCard(snapshot, firstItem),
            const SizedBox(height: 20),

            // --- 3. CONTACT INFO ---
            _buildSectionTitle("Thông tin liên hệ"),
            _buildInfoCard([
              _buildInfoRow(Icons.person, "Họ tên", contact['full_name'] ?? "N/A"),
              _buildInfoRow(Icons.email, "Email", contact['email'] ?? "N/A"),
              _buildInfoRow(Icons.phone, "Điện thoại", contact['phone'] ?? contact['phone_number'] ?? "N/A"),
              // ✅ NEW: Notes
              if (note != null && note.isNotEmpty)
                 _buildInfoRow(Icons.note, "Ghi chú", note),
            ]),
            const SizedBox(height: 20),

            // --- 4. PASSENGERS ---
            if (passengers.isNotEmpty) ...[
              _buildSectionTitle("Danh sách hành khách (${passengers.length})"),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  children: passengers.asMap().entries.map((entry) {
                    final p = entry.value;
                    final isLast = entry.key == passengers.length - 1;
                    return Column(
                      children: [
                        ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.grey[100],
                            child: const Icon(Icons.person_outline, color: Colors.grey),
                          ),
                          title: Text(p['full_name'] ?? "Khách ${entry.key + 1}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text("Loại vé: ${p['age_group'] == 'child' ? 'Trẻ em' : 'Người lớn'}", style: const TextStyle(fontSize: 12)),
                        ),
                        if (!isLast) const Divider(height: 1, indent: 16, endIndent: 16),
                      ],
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // --- 5. PAYMENT INFO (Enhanced) ---
            _buildSectionTitle("Thanh toán"),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  // Payment Status
                  _buildPaymentRow("Trạng thái", paymentStatus == 'paid' ? "Đã thanh toán" : "Chưa thanh toán", 
                      color: paymentStatus == 'paid' ? Colors.green : Colors.orange),
                  const SizedBox(height: 12),
                  
                  // ✅ NEW: Payment Method
                  _buildPaymentRow("Phương thức", _formatPaymentMethod(paymentMethod)),
                  const Divider(height: 24),

                  // ✅ NEW: Breakdown
                  if (discount > 0) ...[
                    _buildPaymentRow("Tạm tính", _formatCurrency(totalPrice)),
                    const SizedBox(height: 8),
                    _buildPaymentRow("Giảm giá", "- ${_formatCurrency(discount)}", color: Colors.green),
                    const Divider(height: 24),
                  ],

                  // Final Price
                  _buildPaymentRow("Tổng tiền", _formatCurrency(finalPrice), isBold: true, color: const Color(0xFF00897B)),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // --- 6. ACTION BUTTON (CANCEL) ---
            if (status == 'pending' || status == 'confirmed') // Allow cancel if pending
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: _handleCancelBooking,
                  icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                  label: const Text("Hủy đơn hàng", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // --- WIDGET HELPER METHODS ---

  String _formatCurrency(num amount) {
    return NumberFormat.currency(locale: 'vi', symbol: 'đ').format(amount);
  }

  String _formatPaymentMethod(String method) {
    switch (method.toLowerCase()) {
      case 'cod': return "Tiền mặt (COD)";
      case 'vnpay': return "VNPAY";
      case 'momo': return "Ví MoMo";
      case 'banking': return "Chuyển khoản";
      default: return method.toUpperCase();
    }
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 4),
      child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
    );
  }

  // Updated Header to include Booking Date
  Widget _buildStatusHeader(String status, String id, String date) {
    Color color = Colors.orange;
    String text = "Chờ xử lý";
    if (status == 'confirmed') { color = Colors.blue; text = "Đã xác nhận"; }
    if (status == 'completed') { color = Colors.green; text = "Hoàn thành"; }
    if (status == 'cancelled') { color = Colors.red; text = "Đã hủy"; }
    if (status == 'failed') { color = Colors.grey; text = "Thất bại"; }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 4),
              Text("ID: ${id.length > 6 ? id.substring(id.length - 6).toUpperCase() : id}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 2),
              // ✅ NEW: Display Booking Date
              Text("Ngày đặt: $date", style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          const Icon(Icons.local_activity, color: Colors.white, size: 32),
        ],
      ),
    );
  }

  Widget _buildProductCard(Map snapshot, Map item) {
    // ✅ Fix Image Logic
    String imageUrl = ImageHelper.resolveUrl(snapshot['image']);
    String title = snapshot['title'] ?? item['productTitle'] ?? "Unknown Tour";
    String code = snapshot['product_code'] ?? snapshot['code'] ?? ""; // ✅ NEW: Product Code
    
    // Parse Date
    String dateStr = "N/A";
    if (item['startDate'] != null) {
      dateStr = DateFormat('dd/MM/yyyy').format(DateTime.parse(item['startDate']));
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: imageUrl, height: 80, width: 80, fit: BoxFit.cover,
              errorWidget: (_, __, ___) => Container(color: Colors.grey[200], child: const Icon(Icons.broken_image)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                 if (code.isNotEmpty)
                  Text(code, style: const TextStyle(fontSize: 10, color: Colors.teal, fontWeight: FontWeight.bold)),
                Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text("Khởi hành: $dateStr", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Column(children: children),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: Colors.grey)),
        Text(value, style: TextStyle(
          fontSize: isBold ? 18 : 14, 
          fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
          color: color ?? (isBold ? Colors.black : Colors.black87),
        )),
      ],
    );
  }
}