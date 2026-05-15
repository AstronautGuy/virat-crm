import 'package:dio/dio.dart';
import 'package:virat_mobile/core/api_client.dart';

class CrmRepository {
  final ApiClient apiClient;

  CrmRepository(this.apiClient);

  Future<List<Map<String, dynamic>>> getProducts() async {
    final response = await apiClient.dio.get('/inventory/products');
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(response.data);
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getCustomers({String? search}) async {
    final response = await apiClient.dio.get('/crm/customers', queryParameters: {
      if (search != null) 'search': search,
    });
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(response.data);
    }
    return [];
  }

  Future<Map<String, dynamic>> getAddressFromPincode(String pincode) async {
    final response = await Dio().get('https://api.postalpincode.in/pincode/$pincode');
    if (response.statusCode == 200 && response.data is List) {
      final list = response.data as List;
      if (list.isNotEmpty && list[0]['Status'] == 'Success') {
        final postOffice = list[0]['PostOffice'][0];
        return {
          'city': postOffice['District'],
          'state': postOffice['State'],
          'area': postOffice['Name'],
        };
      }
    }
    throw Exception('Invalid Pincode');
  }
}
