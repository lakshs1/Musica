import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/track.dart';

class ApiService {
  // Set this to your deployed Render backend host (e.g., "musync-backend.onrender.com").
  // Leave empty to automatically resolve to localhost for local testing.
  static const String deployedBackendHost = "musync-8deh.onrender.com";

  static String get baseHttpUrl {
    if (deployedBackendHost.isNotEmpty) {
      final protocol = deployedBackendHost.startsWith('localhost') ? 'http' : 'https';
      return "$protocol://$deployedBackendHost/api/v1";
    }
    if (kIsWeb) {
      final baseUri = Uri.base;
      if (baseUri.scheme == 'http' || baseUri.scheme == 'https') {
        // Assume backend is on same host, port 8000
        return "${baseUri.scheme}://${baseUri.host}:8000/api/v1";
      }
    }
    // Fallback for mobile emulators connecting to local machine
    // Android emulator connects to 10.0.2.2 for localhost
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return "http://10.0.2.2:8000/api/v1";
    }
    return "http://localhost:8000/api/v1";
  }

  static String get baseWsUrl {
    if (deployedBackendHost.isNotEmpty) {
      final wsProtocol = deployedBackendHost.startsWith('localhost') ? 'ws' : 'wss';
      return "$wsProtocol://$deployedBackendHost/api/v1";
    }
    if (kIsWeb) {
      final baseUri = Uri.base;
      if (baseUri.scheme == 'http' || baseUri.scheme == 'https') {
        final wsScheme = baseUri.scheme == 'https' ? 'wss' : 'ws';
        return "$wsScheme://${baseUri.host}:8000/api/v1";
      }
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return "ws://10.0.2.2:8000/api/v1";
    }
    return "ws://localhost:8000/api/v1";
  }

  Future<String> createRoom() async {
    try {
      final response = await http.get(Uri.parse("$baseHttpUrl/rooms/create"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['room_code'] ?? '';
      }
      throw Exception("Failed to create room: ${response.statusCode}");
    } catch (e) {
      debugPrint("createRoom error: $e");
      rethrow;
    }
  }

  Future<bool> verifyRoom(String roomCode) async {
    try {
      final response = await http.get(Uri.parse("$baseHttpUrl/rooms/verify/$roomCode"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['exists'] ?? false;
      }
      return false;
    } catch (e) {
      debugPrint("verifyRoom error: $e");
      return false;
    }
  }

  Future<List<Track>> searchTracks(String query) async {
    try {
      final response = await http.get(
        Uri.parse("$baseHttpUrl/search").replace(queryParameters: {'q': query}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> items = data['items'] ?? [];
        return items.map((item) => Track.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      debugPrint("searchTracks error: $e");
      return [];
    }
  }

  Future<List<Track>> getRecommendations() async {
    try {
      final response = await http.get(Uri.parse("$baseHttpUrl/recommendations"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> items = data['items'] ?? [];
        return items.map((item) => Track.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      debugPrint("getRecommendations error: $e");
      return [];
    }
  }
}
