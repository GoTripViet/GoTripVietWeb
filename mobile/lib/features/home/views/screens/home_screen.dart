import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

// ViewModels
import '../../view_models/home_view_model.dart';
import '../../../auth/view_models/auth_view_model.dart';

// Screens
import '../../../product/views/screens/product_detail_screen.dart';
import '../../../profile/views/screens/profile_screen.dart'; // ✅ Import Profile

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
  int _selectedIndex = 0; // Current Tab Index

  @override
  void initState() {
    super.initState();
    // Load data only once when the screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HomeViewModel>(context, listen: false).loadHomeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    // List of Pages for the Bottom Navigation
    final List<Widget> pages = [
      const _HomeTab(), // 0: Home Content (Extracted below)
      const Center(child: Text("Yêu thích (Đang phát triển)")), // 1: Placeholder
      const Center(child: Text("Đơn hàng (Đang phát triển)")), // 2: Placeholder
      const ProfileScreen(), // 3: Profile Screen
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      drawer: const HomeDrawer(), // Sidebar Menu
      
      // 1. BOTTOM NAVIGATION BAR
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          selectedItemColor: const Color(0xFF00897B),
          unselectedItemColor: Colors.grey[400],
          backgroundColor: Colors.white,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          showUnselectedLabels: true,
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore),
              label: "Khám phá",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite_border),
              activeIcon: Icon(Icons.favorite),
              label: "Yêu thích",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: "Đơn hàng",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: "Tài khoản",
            ),
          ],
        ),
      ),

      // 2. SWITCHABLE BODY
      body: pages[_selectedIndex],
    );
  }
}

// -----------------------------------------------------------------------------
// ✅ EXTRACTED WIDGET: _HomeTab
// This contains the complex SliverScrollView for the "Discovery" page.
// -----------------------------------------------------------------------------
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
            // 2. SLIVER APP BAR (Header + Floating Search)
            SliverAppBar(
              backgroundColor: const Color(0xFF00897B),
              expandedHeight: 170.0,
              floating: false,
              pinned: true,
              elevation: 0,

              // Custom Menu Icon
              leading: Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.sort_rounded, color: Colors.white, size: 28),
                  onPressed: () => Scaffold.of(context).openDrawer(),
                ),
              ),

              actions: [
                Container(
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 24),
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
                    // Decorative Circles
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

                    // User Greeting
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

              // Floating Search Bar logic
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
                        )
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
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Spacer for search bar
            const SliverToBoxAdapter(child: SizedBox(height: 40)),

            // 3. LOADING STATE
            if (viewModel.isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator(color: Color(0xFF00897B))),
              ),

            // 4. MAIN CONTENT
            if (!viewModel.isLoading) ...[
              // A. EVENT BANNERS
              if (viewModel.events.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 25),
                    child: BannerSlider(events: viewModel.events),
                  ),
                ),

              // B. CATEGORIES
              if (viewModel.categories.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        child: Text(
                          "Danh mục",
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 110,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: viewModel.categories.length,
                          itemBuilder: (context, index) {
                            final cat = viewModel.categories[index];
                            return _buildCategoryItem(cat['name'] ?? "Khác");
                          },
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ),
                ),

              // C. FAVORITE DESTINATIONS
              if (viewModel.locations.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SectionTitle(title: "Điểm đến phổ biến", onSeeAll: () {}),
                      SizedBox(
                        height: 140, // Height for SmallCard
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 20),
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: viewModel.locations.length,
                          itemBuilder: (context, index) {
                            final loc = viewModel.locations[index];

                            // Image Logic
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
                              onTap: () {},
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 15),
                    ],
                  ),
                ),

              // D. NEWEST TOURS
              if (viewModel.tours.isNotEmpty)
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      SectionTitle(title: "Tour Mới Nhất", onSeeAll: () {}),
                      SizedBox(
                        height: 315, // Height for TourCard
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 20, bottom: 20),
                          scrollDirection: Axis.horizontal,
                          itemCount: viewModel.tours.length,
                          itemBuilder: (context, index) {
                            final product = viewModel.tours[index];
                            return TourCard(
                              product: product,
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
              const SliverToBoxAdapter(child: SizedBox(height: 30)),
            ],
          ],
        );
      },
    );
  }

  // Helper Widget for Categories
  Widget _buildCategoryItem(String label) {
    IconData icon = Icons.category_outlined;
    Color color = const Color(0xFF00897B);
    Color bgColor = const Color(0xFFE0F2F1);

    if (label.contains("Biển")) {
      icon = Icons.beach_access_rounded;
      color = const Color(0xFF0288D1);
      bgColor = const Color(0xFFE1F5FE);
    } else if (label.contains("Núi")) {
      icon = Icons.landscape_rounded;
      color = const Color(0xFF388E3C);
      bgColor = const Color(0xFFE8F5E9);
    } else if (label.contains("Phố") || label.contains("City")) {
      icon = Icons.location_city_rounded;
      color = const Color(0xFFF57C00);
      bgColor = const Color(0xFFFFF3E0);
    } else if (label.contains("Di sản") || label.contains("Văn hóa")) {
      icon = Icons.account_balance_rounded;
      color = const Color(0xFF7B1FA2);
      bgColor = const Color(0xFFF3E5F5);
    } else if (label.contains("Ẩm thực")) {
      icon = Icons.restaurant_rounded;
      color = const Color(0xFFD32F2F);
      bgColor = const Color(0xFFFFEBEE);
    }

    return Container(
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        children: [
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.black54,
            ),
          ),
        ],
      ),
    );
  }
}