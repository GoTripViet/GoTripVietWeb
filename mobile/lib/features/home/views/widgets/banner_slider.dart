import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../shared/models/event_model.dart';
import '../../../../core/utils/image_helper.dart';

class BannerSlider extends StatelessWidget {
  final List<EventModel> events;

  const BannerSlider({Key? key, required this.events}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 180,
      child: PageView.builder(
        controller: PageController(viewportFraction: 0.9), // Show a bit of next slide
        itemCount: events.length,
        itemBuilder: (context, index) {
          final event = events[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 5),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              image: DecorationImage(
                image: CachedNetworkImageProvider(ImageHelper.resolveUrl(event.imageUrl)),
                fit: BoxFit.cover,
              ),
              boxShadow: [
                BoxShadow(color: Colors.black26, blurRadius: 5, offset: Offset(0, 3))
              ]
            ),
            child: Stack(
              children: [
                // Dark Gradient overlay for text readability
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    gradient: LinearGradient(
                      colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 15,
                  left: 15,
                  right: 15,
                  child: Text(
                    event.title,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
        },
      ),
    );
  }
}