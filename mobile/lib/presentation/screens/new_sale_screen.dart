import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
  bool _isSubmitting = false;
  bool _isLoadingProducts = true;
  List<Map<String, dynamic>> _availableProducts = [];
  final List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  @override
  void dispose() {
    _customerNameController.dispose();
    _pincodeController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _areaController.dispose();
    _addressController.dispose();
    _invoiceAmountController.dispose();
    _receivedAmountController.dispose();
    super.dispose();
  }

  Future<void> _fetchProducts() async {
    try {
      final products = await ref.read(crmRepositoryProvider).getProducts();
      setState(() {
        _availableProducts = products;
        _isLoadingProducts = false;
      });
    } catch (_) {
      setState(() => _isLoadingProducts = false);
    }
  }

  void _handlePincodeChange(String val) async {
    if (val.length == 6) {
      setState(() => _isFetchingPincode = true);
      try {
        final address =
            await ref.read(crmRepositoryProvider).getAddressFromPincode(val);
        _cityController.text = address['city'] ?? '';
        _stateController.text = address['state'] ?? '';
        _areaController.text = address['area'] ?? '';
      } catch (_) {
        // Non-fatal: user can fill in manually
      } finally {
        setState(() => _isFetchingPincode = false);
      }
    }
  }

  void _recalculateTotal() {
    double total = 0.0;
    for (final item in _items) {
      final double price = item['price'] ?? 0.0;
      final int qty = item['quantity'] ?? 0;
      total += price * qty;
    }
    _invoiceAmountController.text = total.toStringAsFixed(2);
  }

  void _addProductSheet() {
    Map<String, dynamic>? selectedProduct;
    final qtyController = TextEditingController(text: '1');
    final priceController = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgDeep,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ADD PRODUCT TO SALE',
                        style: GoogleFonts.poppins(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textMuted),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<Map<String, dynamic>>(
                    dropdownColor: AppColors.bgCard,
                    decoration: const InputDecoration(
                      labelText: 'Select Product',
                      prefixIcon: Icon(Icons.shopping_bag_outlined),
                    ),
                    items: _availableProducts.map((p) {
                      return DropdownMenuItem<Map<String, dynamic>>(
                        value: p,
                        child: Text(
                          '${p['name']} (₹${p['price']})',
                          style: GoogleFonts.poppins(color: AppColors.textPrimary),
                        ),
                      );
                    }).toList(),
                    onChanged: (p) {
                      setSheetState(() {
                        selectedProduct = p;
                        if (p != null) {
                          priceController.text = p['price']?.toString() ?? '0.0';
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: qtyController,
                          keyboardType: TextInputType.number,
                          style: GoogleFonts.poppins(color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            labelText: 'Quantity',
                            prefixIcon: Icon(Icons.format_list_numbered),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: priceController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: GoogleFonts.poppins(color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            labelText: 'Selling Price (₹)',
                            prefixIcon: Icon(Icons.sell_outlined),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      if (selectedProduct == null) return;
                      final qty = int.tryParse(qtyController.text) ?? 1;
                      final price = double.tryParse(priceController.text) ??
                          (double.tryParse(selectedProduct!['price']?.toString() ?? '0.0') ?? 0.0);

                      setState(() {
                        _items.add({
                          'productId': selectedProduct!['id'],
                          'productName': selectedProduct!['name'],
                          'quantity': qty,
                          'price': price,
                        });
                        _recalculateTotal();
                      });
                      Navigator.pop(context);
                    },
                    child: Text(
                      'ADD TO INVOICE',
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please add at least one product',
            style: GoogleFonts.poppins(color: AppColors.textPrimary),
          ),
          backgroundColor: AppColors.statusRed,
        ),
      );
      return;
    }
    setState(() => _isSubmitting = true);

    try {
      final saleData = {
        'customerName': _customerNameController.text.trim(),
        'pincode': _pincodeController.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
        'area': _areaController.text.trim(),
        'addressLine1': _addressController.text.trim(),
        'invoiceAmount': _invoiceAmountController.text.trim(),
        'receivedAmount': _receivedAmountController.text.trim(),
        'items': _items.map((item) => {
          'productId': item['productId'],
          'quantity': item['quantity'],
          'isFree': false,
        }).toList(),
      };

      final syncRepo = await ref.read(syncRepositoryProvider.future);
      await syncRepo.queueAction('createSale', saleData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded,
                    color: AppColors.statusGreen),
                const SizedBox(width: 12),
                Text('Sale saved and queued for sync',
                    style: GoogleFonts.poppins(color: AppColors.textPrimary)),
              ],
            ),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e',
                style: GoogleFonts.poppins(color: AppColors.textPrimary)),
          ),
        );
      }
    }
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14, top: 10),
      child: Row(
        children: [
          Text(
            text,
            style: GoogleFonts.poppins(
              color: AppColors.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Container(height: 1, color: AppColors.border)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      appBar: AppBar(
        title: const Text('LOG NEW SALE'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            // ─── Customer & Location ──────────────────────────────────
            _sectionLabel('CUSTOMER & LOCATION'),

            _DarkField(
              controller: _customerNameController,
              label: 'Customer Name',
              icon: Icons.person_outline_rounded,
              validator: (v) => v!.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 14),

            _DarkField(
              controller: _pincodeController,
              label: 'Pincode',
              icon: Icons.pin_drop_outlined,
              keyboardType: TextInputType.number,
              onChanged: _handlePincodeChange,
              suffix: _isFetchingPincode
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary,
                      ),
                    )
                  : null,
              validator: (v) => v!.length != 6 ? 'Enter 6-digit pincode' : null,
            ),
            const SizedBox(height: 14),

            Row(
              children: [
                Expanded(
                  child: _DarkField(
                    controller: _cityController,
                    label: 'City',
                    icon: Icons.location_city_outlined,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: _DarkField(
                    controller: _stateController,
                    label: 'State',
                    icon: Icons.map_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            _DarkField(
              controller: _areaController,
              label: 'Area / Post Office',
              icon: Icons.landscape_outlined,
            ),
            const SizedBox(height: 14),

            _DarkField(
              controller: _addressController,
              label: 'Address Line',
              icon: Icons.home_outlined,
              maxLines: 2,
            ),
            const SizedBox(height: 28),

            // ─── Products & Items ─────────────────────────────────────
            _sectionLabel('PRODUCTS & ITEMS'),

            if (_items.isEmpty)
              Card(
                color: AppColors.bgCard,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: AppColors.border, width: 1),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      const Icon(Icons.shopping_bag_outlined,
                          size: 48, color: AppColors.textMuted),
                      const SizedBox(height: 12),
                      Text(
                        'No products added yet',
                        style: GoogleFonts.poppins(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Add items below to calculate invoice total dynamically',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                            color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _items.length,
                separatorBuilder: (c, i) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final item = _items[idx];
                  final double subtotal = item['price'] * item['quantity'];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['productName'],
                                style: GoogleFonts.poppins(
                                    color: AppColors.textPrimary,
                                    fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '₹${item['price'].toStringAsFixed(2)} × ${item['quantity']}',
                                style: GoogleFonts.poppins(
                                    color: AppColors.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '₹${subtotal.toStringAsFixed(2)}',
                          style: GoogleFonts.poppins(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded,
                              color: AppColors.statusRed, size: 20),
                          onPressed: () {
                            setState(() {
                              _items.removeAt(idx);
                              _recalculateTotal();
                            });
                          },
                        ),
                      ],
                    ),
                  );
                },
              ),

            const SizedBox(height: 12),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _isLoadingProducts ? null : _addProductSheet,
              icon: _isLoadingProducts
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 1.5, color: AppColors.primary))
                  : const Icon(Icons.add_shopping_cart,
                      size: 18, color: AppColors.primary),
              label: Text(
                _isLoadingProducts ? 'LOADING PRODUCTS...' : 'ADD PRODUCT',
                style: GoogleFonts.poppins(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1),
              ),
            ),

            const SizedBox(height: 28),

            // ─── Financials ───────────────────────────────────────────
            _sectionLabel('FINANCIALS'),

            _DarkField(
              controller: _invoiceAmountController,
              label: 'Invoice Amount (₹)',
              icon: Icons.receipt_long_outlined,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 14),

            _DarkField(
              controller: _receivedAmountController,
              label: 'Received Today (₹)',
              icon: Icons.payments_outlined,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),

            const SizedBox(height: 40),

            // ─── Submit button ────────────────────────────────────────
            Container(
              height: 58,
              decoration: BoxDecoration(
                gradient: _isSubmitting
                    ? null
                    : const LinearGradient(
                        colors: AppColors.gradientSales,
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                color: _isSubmitting ? AppColors.bgCard : null,
                borderRadius: BorderRadius.circular(16),
                boxShadow: _isSubmitting
                    ? []
                    : [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: _isSubmitting ? null : _submit,
                  child: Center(
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'SAVE SALE',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                            ),
                          ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

// ── Dark-styled text field ────────────────────────────────────────────────────
class _DarkField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final int maxLines;
  final TextInputType keyboardType;
  final ValueChanged<String>? onChanged;
  final Widget? suffix;
  final String? Function(String?)? validator;

  const _DarkField({
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
      style: GoogleFonts.poppins(color: AppColors.textPrimary, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        suffixIcon: suffix != null
            ? Padding(padding: const EdgeInsets.all(14), child: suffix)
            : null,
      ),
    );
  }
}
