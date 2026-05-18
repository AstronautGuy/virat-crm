# ProGuard rules for virat_mobile
# Keep Isar core library and generated classes from obfuscation or shrinking
-keep class io.isar.** { *; }
-keep class * implements io.isar.IsarLink { *; }
-keep class * implements io.isar.IsarLinks { *; }

# Keep model classes used by Isar schema
-keep class com.virat.crm.virat_mobile.data.models.** { *; }
-keep class com.virat.crm.virat_mobile.data.repositories.** { *; }

# Keep Flutter Background Service packages and components
-keep class id.flutter.flutter_background_service.** { *; }

# Keep Path Provider
-keep class io.flutter.plugins.pathprovider.** { *; }

# Keep Geolocator and connectivity
-keep class com.baseflow.geolocator.** { *; }
-keep class dev.fluttercommunity.plus.connectivity.** { *; }
