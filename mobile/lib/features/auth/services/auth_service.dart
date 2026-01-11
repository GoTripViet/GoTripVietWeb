import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  // Use the User Service URL (port 3001) or Gateway (3000)
  final ApiClient _client = ApiClient(baseUrl: "${ApiConstants.baseUrl}:3001");

  // POST /auth/login
  Future<UserModel> login(String email, String password) async {
    // 1. LOG REQUEST START
    print("🚀 [LOGIN] Sending request to: ${_client.dio.options.baseUrl}/auth/login");
    print("🚀 [LOGIN] Email: $email");

    try {
      final response = await _client.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      // 2. LOG SUCCESS RESPONSE
      print("✅ [LOGIN] Status Code: ${response.statusCode}");
      print("✅ [LOGIN] Raw Response: ${response.data}");

      final user = UserModel.fromJson(response.data);
      
      if (user.token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', user.token!);
        await prefs.setString('userId', user.id);
        await prefs.setString('userName', user.fullName);
        print("💾 [LOGIN] Token saved to storage.");
      }

      return user;

    } on DioException catch (e) {
      // 3. LOG SPECIFIC ERROR
      print("❌ [LOGIN ERROR] Type: ${e.type}");
      print("❌ [LOGIN ERROR] Message: ${e.message}");
      
      if (e.response != null) {
        print("❌ [LOGIN ERROR] Server Response: ${e.response?.data}");
        print("❌ [LOGIN ERROR] Status Code: ${e.response?.statusCode}");
      } else {
        print("❌ [LOGIN ERROR] No response from server. Check IP/Firewall.");
      }

      throw Exception(e.response?.data['message'] ?? 'Login failed');
    } catch (e) {
      // 4. LOG UNKNOWN ERROR
      print("❌ [LOGIN ERROR] Unknown Exception: $e");
      throw Exception(e.toString());
    }
  }
  // POST /auth/register
  Future<void> register(String fullName, String email, String password, String phone) async {
    try {
      await _client.dio.post('/auth/register', data: {
        'fullName': fullName,
        'email': email,
        'password': password,
        'phone': phone,
      });
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Registration failed');
    }
  }

  // GET /users/me (Fetch Profile)
 Future<UserModel> getProfile() async {
    try {
      final response = await _client.dio.get('/users/me');
      // Handle data structure: Web usually returns { data: ... } or direct object
      final data = response.data['data'] ?? response.data;
      return UserModel.fromJson(data);
    } catch (e) {
      throw e;
    }
  }

  // ✅ MATCH WEB: PUT /users/me
  Future<UserModel> updateProfile({required String fullName, required String phone}) async {
    try {
      final response = await _client.dio.put('/users/me', data: {
        'full_name': fullName,
        'phone_number': phone,
      });
      
      final data = response.data['data'] ?? response.data;
      return UserModel.fromJson(data);
    } catch (e) {
      print("Update Profile Error: $e");
      throw e;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Clears token and user data
  }
}