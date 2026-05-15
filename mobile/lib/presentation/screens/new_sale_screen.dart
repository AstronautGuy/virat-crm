import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/providers/repository_provider.dart';

class NewSaleScreen extends ConsumerStatefulWidget {
  const NewSaleScreen({super.key});

  @override
  ConsumerState<NewSaleScreen> createState() => _NewSaleScreenState();
}

class _NewSaleScreenState extends ConsumerState<NewSaleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _customerNameController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _areaController = TextEditingController();
  final _addressController = TextEditingController();
  final _invoiceAmountController = TextEditingController();
  final _receivedAmountController = TextEditingController();

  bool _isFetchingPincode = false;
  List<Map<String, dynamic>> _items = [];

  void _handlePincodeChange(String val) async {
    if (val.length == 6) {
      setState(() => _isFetchingPincode = true);
      try {
        final address = await ref.read(crmRepositoryProvider).getAddressFromPincode(val);
        _cityController.text = address['city'] ?? '';
        _stateController.text = address['state'] ?? '';
        _areaController.text = address['area'] ?? '';
      } catch (e) {
        // Handle error
      } finally {
        setState(() => _isFetchingPincode = false);
      }
    }
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final saleData = {
        'customerName': _customerNameController.text,
        'pincode': _pincodeController.text,
        'city': _cityController.text,
        'state': _stateController.text,
        'area': _areaController.text,
        'addressLine1': _addressController.text,
        'invoiceAmount': double.tryParse(_invoiceAmountController.text) ?? 0.0,
        'receivedAmount': double.tryParse(_receivedAmountController.text) ?? 0.0,
        'items': _items,
      };

      final syncRepo = await ref.read(syncRepositoryProvider.future);
      await syncRepo.queueAction('createSale', saleData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sale saved and queued for sync')),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('LOG NEW SALE')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            _sectionHeader('CUSTOMER & LOCATION'),
            _BigTextField(
              controller: _customerNameController,
              label: 'Customer Name',
              icon: Icons.person,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            _BigTextField(
              controller: _pincodeController,
              label: 'Pincode',
              icon: Icons.pin_drop,
              keyboardType: TextInputType.number,
              onChanged: _handlePincodeChange,
              suffix: _isFetchingPincode ? const CircularProgressIndicator() : null,
              validator: (v) => v!.length != 6 ? 'Invalid Pincode' : null,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _BigTextField(
                    controller: _cityController,
                    label: 'City',
                    icon: Icons.location_city,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _BigTextField(
                    controller: _stateController,
                    label: 'State',
                    icon: Icons.map,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _BigTextField(
              controller: _areaController,
              label: 'Area / Post Office',
              icon: Icons.landscape,
            ),
            const SizedBox(height: 16),
            _BigTextField(
              controller: _addressController,
              label: 'Address Line 1',
              icon: Icons.home,
              maxLines: 2,
            ),
            const SizedBox(height: 32),
            _sectionHeader('FINANCIALS'),
            _BigTextField(
              controller: _invoiceAmountController,
              label: 'Invoice Amount (₹)',
              icon: Icons.currency_rupee,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            _BigTextField(
              controller: _receivedAmountController,
              label: 'Received Today (₹)',
              icon: Icons.payments,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 80),
                backgroundColor: AppTheme.accentColor,
              ),
              onPressed: _submit,
              child: const Text('SAVE SALE', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _BigTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final int maxLines;
  final TextInputType keyboardType;
  final Function(String)? onChanged;
  final Widget? suffix;
  final String? Function(String?)? validator;

  const _BigTextField({
    required this.controller,
    required this.label,
    required this.icon,
    this.maxLines = 1,
    this.keyboardType = TextInputType.text,
    this.onChanged,
    this.suffix,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      onChanged: onChanged,
      validator: validator,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 20),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 28),
        suffixIcon: suffix != null ? Padding(padding: const EdgeInsets.all(12), child: suffix) : null,
        contentPadding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
