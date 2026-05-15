import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/presentation/providers/auth_provider.dart';

class FeatureGate extends ConsumerWidget {
  final String featureKey;
  final Widget child;
  final Widget? fallback;

  const FeatureGate({
    super.key,
    required this.featureKey,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final permissions = ref.watch(permissionsProvider);
    final isEnabled = permissions[featureKey] ?? false; // STRICT: Default to disabled if not found

    if (isEnabled) {
      return child;
    }

    return fallback ?? const SizedBox.shrink();
  }
}
