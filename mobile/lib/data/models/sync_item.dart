import 'package:isar/isar.dart';

part 'sync_item.g.dart';

@collection
class SyncItem {
  Id id = Isar.autoIncrement;

  @Index(type: IndexType.value)
  late String type; // 'createSale' or 'proposeCustomer'

  late String jsonData; // Serialized data

  @Index()
  late DateTime createdAt;

  @Index()
  bool isSynced = false;

  String? error; // For tracking sync failures
}
