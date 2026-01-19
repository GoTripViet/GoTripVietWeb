import 'package:flutter/material.dart';
import 'package:mobile/features/home/views/screens/all_categories_screen.dart';
import 'package:mobile/features/home/views/screens/all_locations_screen.dart';
import 'package:mobile/features/home/views/screens/tour_list_screen.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

// ViewModels
import '../../view_models/home_view_model.dart';
import '../../../auth/view_models/auth_view_model.dart';

// Screens
import '../../../product/views/screens/product_detail_screen.dart';
import '../../../profile/views/screens/profile_screen.dart';
import '../../../profile/views/screens/order_history_screen.dart';
// Widgets
import '../widgets/section_title.dart';
import '../widgets/tour_card.dart';
import '../widgets/small_card.dart';
import '../widgets/home_drawer.dart';
import '../widgets/banner_slider.dart';

// Utils
import '../../../../core/utils/image_helper.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0; // Tab hiện tại

  @override
  void initState() {
    super.initState();
    // Load dữ liệu 1 lần khi vào app
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HomeViewModel>(context, listen: false).loadHomeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Danh sách các màn hình cho BottomBar
    final List<Widget> pages = [
      const _HomeTab(), // Index 0: Trang chủ
      const OrderHistoryScreen(), // Index 1: Lịch sử đơn hàng
      const ProfileScreen(), // Index 2: Tài khoản
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      drawer: const HomeDrawer(), // Menu bên trái
      // 1. BOTTOM NAVIGATION BAR
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          selectedItemColor: const Color(0xFF00897B),
          unselectedItemColor: Colors.grey[400],
          backgroundColor: Colors.white,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
          showUnselectedLabels: true,
          onTap: (index) {
            setState(() => _selectedIndex = index);
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore),
              label: "Khám phá",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: "Chuyến đi",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: "Tài khoản",
            ),
          ],
        ),
      ),

      // 2. BODY
      body: pages[_selectedIndex],
    );
  }
}

// --- NỘI DUNG TAB TRANG CHỦ ---
class _HomeTab extends StatelessWidget {
  const _HomeTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final user = authViewModel.user;

    return Consumer<HomeViewModel>(
      builder: (context, viewModel, child) {
        return CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ====================================================
            // 1. SLIVER APP BAR (Header + Search)
            // ====================================================
            SliverAppBar(
              backgroundColor: const Color(0xFF00897B),
              expandedHeight: 170.0,
              floating: false,
              pinned: true,
              elevation: 0,

              // Menu Icon
              leading: Builder(
                builder: (context) => IconButton(
                  icon: const Icon(
                    Icons.sort_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                  onPressed: () => Scaffold.of(context).openDrawer(),
                ),
              ),

              // Notification Icon
              actions: [
                Container(
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.notifications_outlined,
                      color: Colors.white,
                      size: 24,
                    ),
                    onPressed: () {},
                  ),
                ),
              ],

              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  children: [
                    // Gradient Background
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF00897B), Color(0xFF004D40)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),
                    // Trang trí
                    Positioned(
                      top: -60,
                      right: -40,
                      child: CircleAvatar(
                        radius: 120,
                        backgroundColor: Colors.white.withOpacity(0.05),
                      ),
                    ),
                    Positioned(
                      bottom: -20,
                      left: -40,
                      child: CircleAvatar(
                        radius: 80,
                        backgroundColor: Colors.white.withOpacity(0.05),
                      ),
                    ),

                    // Greeting Text
                    Positioned(
                      bottom: 75,
                      left: 20,
                      right: 20,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                "Xin chào,",
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 18,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Flexible(
                                child: Text(
                                  "${user?.fullName.split(' ').last ?? 'Bạn'} 👋",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 5),
                          const Text(
                            "Khám phá Việt Nam tươi đẹp!",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Thanh tìm kiếm nổi
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(30),
                child: Transform.translate(
                  offset: const Offset(0, 24),
                  child: Container(
                    height: 50,
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.teal.withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: TextField(
                      textAlignVertical: TextAlignVertical.center,
                      decoration: InputDecoration(
                        hintText: "Tìm kiếm địa điểm, tour...",
                        hintStyle: TextStyle(
                          color: Colors.grey[400],
                          fontSize: 14,
                        ),
                        prefixIcon: const Icon(
                          Icons.search_rounded,
                          color: Color(0xFF00897B),
                        ),
                        suffixIcon: Container(
                          margin: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2F1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.tune_rounded,
                            color: Color(0xFF00897B),
                            size: 20,
                          ),
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 40)),

            // Loading State
            if (viewModel.isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFF00897B)),
                ),
              ),

            if (!viewModel.isLoading) ...[
              // ====================================================
              // 2. BANNER SỰ KIỆN
              // ====================================================
              if (viewModel.events.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 25),
                    child: BannerSlider(events: viewModel.events),
                  ),
                ),

              // ====================================================
              // 3. DANH MỤC (CATEGORIES)
              // ====================================================
              if (viewModel.categories.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              "Danh mục",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),

                            // Nút Xem tất cả -> Mở AllCategoriesScreen
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => AllCategoriesScreen(
                                      categories: viewModel.categories,
                                    ),
                                  ),
                                );
                              },
                              child: const Text(
                                "Xem tất cả",
                                style: TextStyle(
                                  color: Color(0xFF00897B),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      SizedBox(
                        height: 120,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: viewModel.categories.length,
                          separatorBuilder: (ctx, index) =>
                              const SizedBox(width: 16),
                          itemBuilder: (context, index) {
                            final cat = viewModel.categories[index];

                            // Lấy ID an toàn
                            final String catId = cat['_id'] ?? cat['id'] ?? "";

                            // Lấy ảnh
                            String rawImage = "";
                            if (cat['image'] != null && cat['image'] is Map) {
                              rawImage = cat['image']['url'] ?? "";
                            }
                            final imageUrl = ImageHelper.resolveUrl(rawImage);

                            return _buildCategoryItem(
                              cat['name'] ?? "Khác",
                              imageUrl,
                              // ✅ LOGIC: Bấm vào 1 mục -> Lọc tour theo Category ID
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => TourListScreen(
                                      title: cat['name'] ?? "Danh sách Tour",
                                      queryParams: {'category_id': catId},
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),

              // ====================================================
              // 4. ĐIỂM ĐẾN PHỔ BIẾN (LOCATIONS)
              // ====================================================
              if (viewModel.locations.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SectionTitle(
                        title: "Điểm đến phổ biến",
                        // Nút Xem tất cả -> Mở AllLocationsScreen
                        onSeeAll: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => AllLocationsScreen(
                                locations: viewModel.locations,
                              ),
                            ),
                          );
                        },
                      ),
                      SizedBox(
                        height: 140,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 20, right: 10),
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: viewModel.locations.length,
                          itemBuilder: (context, index) {
                            final loc = viewModel.locations[index];

                            // Lấy ID an toàn
                            final String locId = loc['_id'] ?? loc['id'] ?? "";

                            // Lấy ảnh
                            String rawImage = "";
                            if (loc['images'] != null &&
                                (loc['images'] as List).isNotEmpty) {
                              var firstImg = loc['images'][0];
                              if (firstImg is Map) {
                                rawImage = firstImg['url'] ?? "";
                              } else {
                                rawImage = firstImg.toString();
                              }
                            }
                            final imageUrl = ImageHelper.resolveUrl(rawImage);

                            return SmallCard(
                              name: loc['name'] ?? "Địa điểm",
                              imageUrl: imageUrl,
                              // ✅ LOGIC: Bấm vào địa điểm -> Lọc tour theo Location ID
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => TourListScreen(
                                      title: "Du lịch ${loc['name']}",
                                      queryParams: {'location_id': locId},
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),

              // ====================================================
              // 5. TOUR MỚI NHẤT (NẰM DƯỚI CÙNG)
              // ====================================================
              if (viewModel.tours.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SectionTitle(
                        title: "Tour Mới Nhất 🔥",
                        // Xem tất cả -> Mở list lọc theo ngày tạo mới nhất
                        onSeeAll: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const TourListScreen(
                                title: "Tour Mới Nhất",
                                queryParams: {'sort': '-createdAt'},
                              ),
                            ),
                          );
                        },
                      ),
                      SizedBox(
                        height: 315, // Chiều cao phù hợp TourCard
                        child: ListView.builder(
                          padding: const EdgeInsets.only(
                            left: 20,
                            bottom: 20,
                            right: 10,
                          ),
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: viewModel.tours.length,
                          itemBuilder: (context, index) {
                            final product = viewModel.tours[index];
                            return TourCard(
                              product: product,
                              // Bấm vào tour -> Xem chi tiết
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ProductDetailScreen(
                                      productId: product.id,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),

              // Khoảng trống dưới cùng để không bị che bởi BottomBar nếu cần
              const SliverToBoxAdapter(child: SizedBox(height: 30)),
            ],
          ],
        );
      },
    );
  }

  // Helper Widget: Category Item
  Widget _buildCategoryItem(
    String label,
    String imageUrl, {
    required VoidCallback onTap,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 70,
          height: 70,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(25),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00897B).withOpacity(0.15),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(25),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: onTap,
              splashColor: const Color(0xFF00897B).withOpacity(0.2),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[50],
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.teal,
                      ),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: const Color(0xFFE0F2F1),
                  child: const Icon(
                    Icons.image_not_supported_outlined,
                    color: Color(0xFF80CBC4),
                    size: 28,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: 75,
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF455A64),
              height: 1.2,
            ),
          ),
        ),
      ],
    );
  }
}
