import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class AppConfig {
  static String get baseUrl {
    if (kReleaseMode) {
      return 'https://virat-crm.vercel.app/api/rest';
    }
    if (kIsWeb) {
      return 'http://localhost:3000/api/rest';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api/rest';
    }
    return 'http://localhost:3000/api/rest';
  }
}

