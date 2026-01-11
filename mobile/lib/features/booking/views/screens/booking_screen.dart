import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../view_models/booking_view_model.dart';
import '../../../auth/view_models/auth_view_model.dart';
import '../../../../shared/models/product_model.dart';
import '../../../../core/utils/image_helper.dart';
import '../../../payment/views/screens/payment_screen.dart';

class BookingScreen extends StatefulWidget {
  final ProductModel product;
  final dynamic selectedInventory;

  const BookingScreen({
    Key? key,
    required this.product,
    required this.selectedInventory,
  }) : super(key: key);

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _promoController = TextEditingController();

  // Contact Controllers
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  final TextEditingController _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthViewModel>(context, listen: false).user;
    _nameController = TextEditingController(text: user?.fullName ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _noteController.dispose();
    _promoController.dispose();
    super.dispose();
  }

  // Format Currency
  String formatCurrency(num amount) {
    return NumberFormat.currency(locale: 'vi', symbol: '₫').format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<BookingViewModel>(context);
    final user = Provider.of<AuthViewModel>(context).user;

    // Price Calculations
    final double basePrice =
        (widget.selectedInventory['price'] ?? widget.product.price).toDouble();
    final priceData = viewModel.calculatePrice(basePrice);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Đặt Tour"),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      backgroundColor: Colors.grey[100],
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. TOUR INFO & TRANSPORT
              _buildSummaryCard(),
              const SizedBox(height: 16),

              // 2. CONTACT INFO
              _sectionTitle("Thông tin liên hệ"),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildInput(_nameController, "Họ và tên *", Icons.person),
                    const SizedBox(height: 12),
                    _buildInput(
                      _phoneController,
                      "Số điện thoại *",
                      Icons.phone,
                      type: TextInputType.phone,
                    ),
                    const SizedBox(height: 12),
                    _buildInput(
                      _emailController,
                      "Email *",
                      Icons.email,
                      type: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 12),
                    _buildInput(_noteController, "Ghi chú", Icons.note),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 3. PASSENGER COUNTS (4 Types)
              _sectionTitle("Số lượng hành khách"),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    _buildCounter(
                      "Người lớn",
                      "Từ 12 tuổi",
                      viewModel.adults,
                      (v) => viewModel.updateCount('adult', v),
                      basePrice,
                    ),
                    const Divider(),
                    _buildCounter(
                      "Trẻ em",
                      "5 - 11 tuổi",
                      viewModel.children,
                      (v) => viewModel.updateCount('child', v),
                      basePrice * 0.8,
                    ),
                    const Divider(),
                    _buildCounter(
                      "Trẻ nhỏ",
                      "2 - 4 tuổi",
                      viewModel.toddlers,
                      (v) => viewModel.updateCount('toddler', v),
                      basePrice * 0.5,
                    ),
                    const Divider(),
                    _buildCounter(
                      "Em bé",
                      "< 2 tuổi",
                      viewModel.infants,
                      (v) => viewModel.updateCount('infant', v),
                      basePrice * 0.1,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 4. PASSENGER DETAILS FORM (Dynamic List)
              if (viewModel.passengers.isNotEmpty) ...[
                _sectionTitle("Thông tin hành khách"),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: viewModel.passengers.length,
                  itemBuilder: (ctx, index) {
                    final p = viewModel.passengers[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "#${index + 1} - ${_getTypeLabel(p.type)}",
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            initialValue: p.fullName,
                            decoration: const InputDecoration(
                              labelText: "Họ tên khách",
                              isDense: true,
                              border: OutlineInputBorder(),
                            ),
                            onChanged: (val) =>
                                viewModel.updatePassengerInfo(index, name: val),
                            validator: (v) =>
                                v!.isEmpty ? "Nhập tên khách" : null,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  value: p.gender,
                                  decoration: const InputDecoration(
                                    labelText: "Giới tính",
                                    isDense: true,
                                    border: OutlineInputBorder(),
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                      value: "Nam",
                                      child: Text("Nam"),
                                    ),
                                    DropdownMenuItem(
                                      value: "Nữ",
                                      child: Text("Nữ"),
                                    ),
                                  ],
                                  onChanged: (val) => viewModel
                                      .updatePassengerInfo(index, gender: val),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],

              // 5. PROMO CODE
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Mã giảm giá",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _promoController,
                            decoration: const InputDecoration(
                              hintText: "Nhập mã",
                              isDense: true,
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 12,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: () => viewModel.applyPromoCode(
                            _promoController.text,
                            priceData['subTotal']!,
                          ),
                          child: const Text("Áp dụng"),
                        ),
                      ],
                    ),
                    if (viewModel.promoError.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 5),
                        child: Text(
                          viewModel.promoError,
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    if (viewModel.appliedPromo != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 5),
                        child: Text(
                          "Đã áp dụng mã: ${viewModel.appliedPromo!['code']}",
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),

      // BOTTOM BAR: PRICE & SUBMIT
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Price Details
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Tạm tính:", style: TextStyle(color: Colors.grey)),
                Text(formatCurrency(priceData['subTotal']!)),
              ],
            ),
            if (priceData['discount']! > 0)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Giảm giá:",
                    style: TextStyle(color: Colors.green),
                  ),
                  Text(
                    "-${formatCurrency(priceData['discount']!)}",
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            const Divider(),
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Tổng thanh toán",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      formatCurrency(priceData['final']!),
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 12,
                    ),
                  ),
                  onPressed: viewModel.isLoading
                      ? null
                      : () async {
                          if (_formKey.currentState!.validate()) {
                            // Submit
                            final result = await viewModel.submitBooking(
                              productId: widget.product.id,
                              productTitle: widget.product.title,
                              inventoryItem: widget.selectedInventory,
                              userId: user?.id ?? '',
                              contactInfo: {
                                'fullName':
                                    _nameController.text, // Match Web key name
                                'email': _emailController.text,
                                'phone': _phoneController.text,
                                'note': _noteController.text,
                              },
                              basePrice: basePrice,
                              priceData: priceData,
                            );

                            if (result != null && mounted) {
                              print("✅ Server Response: $result");

                              // --- CẬP NHẬT LOGIC TÌM ID ---

                              // 1. Ưu tiên tìm key 'bookingId' (Khớp với log của bạn)
                              String? bookingId = result['bookingId'];

                              // 2. Nếu không thấy, tìm tiếp các key thông dụng khác (_id, id)
                              if (bookingId == null) {
                                bookingId = result['_id'] ?? result['id'];
                              }

                              // 3. Tìm trong object con 'data' (nếu có)
                              if (bookingId == null && result['data'] != null) {
                                bookingId =
                                    result['data']['bookingId'] ??
                                    result['data']['_id'] ??
                                    result['data']['id'];
                              }

                              // 4. Tìm trong object con 'booking' (nếu có)
                              if (bookingId == null &&
                                  result['booking'] != null) {
                                bookingId =
                                    result['booking']['bookingId'] ??
                                    result['booking']['_id'] ??
                                    result['booking']['id'];
                              }

                              // --- KẾT THÚC ---

                              if (bookingId != null) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        PaymentScreen(bookingId: bookingId!),
                                  ),
                                );
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      "Lỗi: Không tìm thấy key 'bookingId' trong phản hồi server.",
                                    ),
                                  ),
                                );
                              }
                            }
                          }
                        },
                  child: viewModel.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white),
                        )
                      : const Text(
                          "Thanh toán",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // --- WIDGET HELPERS ---

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildInput(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType type = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      validator: (v) => v!.isEmpty ? "Vui lòng nhập $label" : null,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: Colors.teal),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 10),
      ),
    );
  }

  Widget _buildCounter(
    String label,
    String sub,
    int value,
    Function(int) onChange,
    double price,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  sub,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                Text(
                  formatCurrency(price),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.teal,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => onChange(-1),
            icon: const Icon(Icons.remove_circle_outline, color: Colors.grey),
            visualDensity: VisualDensity.compact,
          ),
          SizedBox(
            width: 20,
            child: Center(
              child: Text(
                "$value",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          IconButton(
            onPressed: () => onChange(1),
            icon: const Icon(Icons.add_circle_outline, color: Colors.teal),
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'adult':
        return 'Người lớn';
      case 'child':
        return 'Trẻ em';
      case 'toddler':
        return 'Trẻ nhỏ';
      case 'infant':
        return 'Em bé';
      default:
        return 'Khách';
    }
  }

  Widget _buildSummaryCard() {
    // Show Transport info if available (Like in React)
    final date = DateTime.parse(
      widget.selectedInventory['tour_details']['date'],
    );
    String transportType = widget.product.transport;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: ImageHelper.resolveUrl(widget.product.imageUrl),
              width: 90,
              height: 90,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.product.title,
                  maxLines: 2,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 5),
                Text(
                  "Khởi hành: ${DateFormat('dd/MM/yyyy').format(date)}",
                  style: const TextStyle(fontSize: 13, color: Colors.teal),
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    const Icon(
                      Icons.directions_bus,
                      size: 14,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      transportType,
                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
