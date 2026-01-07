import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'payment_success_screen.dart'; // Import the new screen

class PaymentWebView extends StatefulWidget {
  final String paymentUrl;
  final String bookingId; // Add bookingId to pass to success screen

  const PaymentWebView({
    Key? key, 
    required this.paymentUrl,
    required this.bookingId, // Add this
  }) : super(key: key);

  @override
  State<PaymentWebView> createState() => _PaymentWebViewState();
}

class _PaymentWebViewState extends State<PaymentWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
            _handleRedirect(url); // Check URL here
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
          // Even if the page fails to load (because localhost doesn't exist on phone),
          // we can still catch the URL in 'onWebResourceError' or 'onNavigationRequest'
          // but usually onPageStarted is enough for redirects.
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  void _handleRedirect(String url) {
    // 1. Check if this is the "Return URL" from VNPAY
    // It usually looks like: http://localhost:5173/booking-success?vnp_Amount=...&vnp_ResponseCode=00
    
    if (url.contains('booking-success') || url.contains('vnp_ResponseCode')) {
      
      // 2. Parse the Response Code
      final uri = Uri.parse(url);
      final responseCode = uri.queryParameters['vnp_ResponseCode'];

      if (responseCode == '00') {
        // ✅ SUCCESS!
        // Stop loading the broken localhost page
        _controller.loadRequest(Uri.parse('about:blank')); 

        // Navigate to our native Flutter Success Screen
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => PaymentSuccessScreen(bookingId: widget.bookingId),
          ),
        );
      } else {
        // ❌ FAILED / CANCELLED
        Navigator.pop(context); // Close WebView
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Thanh toán không thành công hoặc đã bị hủy.")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Thanh toán VNPAY"), backgroundColor: Colors.white, foregroundColor: Colors.black),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) const Center(child: CircularProgressIndicator(color: Colors.teal)),
        ],
      ),
    );
  }
}