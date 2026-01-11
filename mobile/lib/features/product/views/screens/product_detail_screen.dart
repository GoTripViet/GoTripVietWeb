import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../view_models/product_view_model.dart';
import '../../../../core/utils/image_helper.dart'; // Use your image helper
import '../../../booking/views/screens/booking_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({Key? key, required this.productId})
    : super(key: key);

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProductViewModel>(
        context,
        listen: false,
      ).loadProductDetails(widget.productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<ProductViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isLoading)
            return const Center(child: CircularProgressIndicator());
          if (viewModel.product == null)
            return const Center(child: Text("Không tìm thấy tour"));

          final product = viewModel.product!;
          final price = viewModel.selectedInventory != null
              ? viewModel.selectedInventory['price']
              : product.price;

          return Stack(
            children: [
              CustomScrollView(
                slivers: [
                  // 1. APP BAR IMAGE
                  SliverAppBar(
                    expandedHeight: 300,
                    pinned: true,
                    backgroundColor: Colors.teal,
                    flexibleSpace: FlexibleSpaceBar(
                      background: CachedNetworkImage(
                        imageUrl: ImageHelper.resolveUrl(product.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                    leading: CircleAvatar(
                      backgroundColor: Colors.black26,
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                  ),

                  // 2. MAIN CONTENT
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title & Rating
                          Text(
                            product.title,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 20,
                              ),
                              const Text(
                                " 5.0 (Tuyệt vời) ",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const Spacer(),
                              Text(
                                "Mã: ${product.id.substring(product.id.length - 6).toUpperCase()}",
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                          const Divider(height: 30),

                          // 3. QUICK INFO GRID
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildInfoItem(
                                Icons.access_time,
                                "Thời gian",
                                product.duration,
                              ),
                              _buildInfoItem(
                                Icons.directions_bus,
                                "Phương tiện",
                                product.transport,
                              ),
                              _buildInfoItem(
                                Icons.place,
                                "Khởi hành",
                                product.startPoint,
                              ),
                            ],
                          ),
                          const Divider(height: 30),

                          // 4. DATE SELECTOR (INVENTORY)
                          const Text(
                            "Lịch khởi hành",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          if (viewModel.inventoryItems.isEmpty)
                            const Text(
                              "Đang cập nhật lịch khởi hành...",
                              style: TextStyle(color: Colors.grey),
                            )
                          else
                            SizedBox(
                              height: 60,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: viewModel.inventoryItems.length,
                                itemBuilder: (context, index) {
                                  final item = viewModel.inventoryItems[index];
                                  final date = DateTime.parse(
                                    item['tour_details']['date'],
                                  );
                                  final isSelected =
                                      viewModel.selectedInventory == item;

                                  return GestureDetector(
                                    onTap: () => viewModel.selectDate(item),
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 12),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? Colors.teal
                                            : Colors.white,
                                        border: Border.all(color: Colors.teal),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            DateFormat('dd/MM').format(date),
                                            style: TextStyle(
                                              color: isSelected
                                                  ? Colors.white
                                                  : Colors.black,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Text(
                                            DateFormat('EEEE', 'vi').format(
                                              date,
                                            ), // Requires intl initialized
                                            style: TextStyle(
                                              color: isSelected
                                                  ? Colors.white70
                                                  : Colors.grey,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          const SizedBox(height: 24),

                          // 5. ITINERARY
                          const Text(
                            "Lịch trình chi tiết",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          ...product.itinerary
                              .map(
                                (item) => Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  elevation: 0,
                                  color: Colors.grey[50],
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: ExpansionTile(
                                    leading: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: const BoxDecoration(
                                        color: Colors.teal,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Text(
                                        item.day,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    title: Text(
                                      item.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.all(16.0),
                                        child: Text(
                                          item.details,
                                          style: const TextStyle(
                                            color: Colors.black87,
                                            height: 1.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                              .toList(),

                          const SizedBox(height: 80), // Space for bottom bar
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // 6. BOTTOM BOOKING BAR
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 15,
                  ),
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
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "Tổng cộng",
                            style: TextStyle(color: Colors.grey),
                          ),
                          Text(
                            NumberFormat.currency(
                              locale: 'vi',
                              symbol: '₫',
                            ).format(price),
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
                            horizontal: 32,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        onPressed: viewModel.selectedInventory == null
                            ? null
                            : () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => BookingScreen(
                                      product: product, // Pass current product
                                      selectedInventory: viewModel
                                          .selectedInventory, // Pass selected date
                                    ),
                                  ),
                                );
                              },
                        child: const Text(
                          "Đặt ngay",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.teal.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: Colors.teal),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ],
    );
  }
}
