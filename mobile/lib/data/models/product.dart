import 'package:isar/isar.dart';

part 'product.g.dart';

@collection
class Product {
  Id id = Isar.autoIncrement;

  late int serverId;

  @Index(type: IndexType.value)
  late String name;

  late String sku;
  
  late double price;

  late DateTime createdAt;
}
