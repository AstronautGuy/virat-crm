import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:virat_mobile/core/theme.dart';
import 'package:virat_mobile/presentation/providers/repository_provider.dart';

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({super.key});

  @override
  ConsumerState<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      appBar: AppBar(
        title: const Text('CUSTOMERS'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: TextField(
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Search by name or mobile...',
                prefixIcon: const Icon(Icons.search_rounded),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          // Customer list
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: ref
                  .watch(crmRepositoryProvider)
                  .getCustomers(search: _searchQuery),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                    ),
                  );
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.wifi_off_rounded,
                            color: AppColors.textMuted, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          'Could not load customers',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${snapshot.error}',
                          style: GoogleFonts.poppins(
                              color: AppColors.textMuted, fontSize: 12),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                }

                final customers = snapshot.data ?? [];
                if (customers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.person_search_rounded,
                            color: AppColors.textMuted, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          'No customers found',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                  itemCount: customers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final customer = customers[index];
                    final name = customer['name'] as String? ?? '?';
                    final mobile = customer['mobile'] as String? ?? '';
                    final pending = customer['totalPending'];

                    return Container(
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        leading: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: AppColors.gradientCustomers,
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              name[0].toUpperCase(),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        title: Text(
                          name,
                          style: GoogleFonts.poppins(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        subtitle: Text(
                          mobile,
                          style: GoogleFonts.poppins(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                        ),
                        trailing: pending != null
                            ? Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.statusRed.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: AppColors.statusRed.withOpacity(0.3),
                                  ),
                                ),
                                child: Text(
                                  '₹$pending',
                                  style: GoogleFonts.poppins(
                                    color: AppColors.statusRed,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                              )
                            : null,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: AppColors.gradientCustomers,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF3B82F6).withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          backgroundColor: Colors.transparent,
          elevation: 0,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NewCustomerScreen()),
            );
          },
          label: Text(
            'ADD CUSTOMER',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
          icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        ),
      ),
    );
  }
}

class NewCustomerScreen extends ConsumerStatefulWidget {
  const NewCustomerScreen({super.key});

  @override
  ConsumerState<NewCustomerScreen> createState() => _NewCustomerScreenState();
}

class _NewCustomerScreenState extends ConsumerState<NewCustomerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _villageController = TextEditingController();
  final _districtController = TextEditingController();
  final _stateController = TextEditingController();
  final _addressController = TextEditingController();

  bool _isFetchingPincode = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _pincodeController.dispose();
    _villageController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _handlePincodeChange(String val) async {
    if (val.length == 6) {
      setState(() => _isFetchingPincode = true);
      try {
        final address =
            await ref.read(crmRepositoryProvider).getAddressFromPincode(val);
        _districtController.text = address['city'] ?? '';
        _stateController.text = address['state'] ?? '';
        _villageController.text = address['area'] ?? '';
      } catch (_) {
        // Non-fatal
      } finally {
        setState(() => _isFetchingPincode = false);
      }
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      final customerData = {
        'name': _nameController.text.trim(),
        'mobile': _mobileController.text.trim(),
        'pincode': _pincodeController.text.trim(),
        'village': _villageController.text.trim(),
        'district': _districtController.text.trim(),
        'state': _stateController.text.trim(),
        'address': _addressController.text.trim(),
      };

      final syncRepo = await ref.read(syncRepositoryProvider.future);
      await syncRepo.queueAction('proposeCustomer', customerData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded,
                    color: AppColors.statusGreen),
                const SizedBox(width: 12),
                Text('Customer proposal queued for sync',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDeep,
      appBar: AppBar(
        title: const Text('NEW CUSTOMER'),
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
            // Section header
            Text(
              'CUSTOMER DETAILS',
              style: GoogleFonts.poppins(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _nameController,
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person_outline_rounded),
              ),
              validator: (v) => v!.trim().isEmpty ? 'Name is required' : null,
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _mobileController,
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Mobile Number',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              validator: (v) =>
                  v!.length < 10 ? 'Enter a valid 10-digit mobile' : null,
            ),
            const SizedBox(height: 24),

            Text(
              'LOCATION DETAILS',
              style: GoogleFonts.poppins(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _pincodeController,
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              keyboardType: TextInputType.number,
              onChanged: _handlePincodeChange,
              decoration: InputDecoration(
                labelText: 'Pincode',
                prefixIcon: const Icon(Icons.pin_drop_outlined),
                suffixIcon: _isFetchingPincode
                    ? const Padding(
                        padding: EdgeInsets.all(14),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        ),
                      )
                    : null,
              ),
              validator: (v) => v!.length != 6 ? 'Enter a 6-digit pincode' : null,
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _districtController,
                    style: GoogleFonts.poppins(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'District',
                      prefixIcon: Icon(Icons.location_city_outlined),
                    ),
                    validator: (v) => v!.trim().isEmpty ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _stateController,
                    style: GoogleFonts.poppins(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: 'State',
                      prefixIcon: Icon(Icons.map_outlined),
                    ),
                    validator: (v) => v!.trim().isEmpty ? 'Required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _villageController,
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                labelText: 'Village / Area / Post Office',
                prefixIcon: Icon(Icons.landscape_outlined),
              ),
              validator: (v) => v!.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _addressController,
              style: GoogleFonts.poppins(color: AppColors.textPrimary),
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Address Details',
                prefixIcon: Icon(Icons.location_on_outlined),
                alignLabelWithHint: true,
              ),
              validator: (v) => v!.trim().isEmpty ? 'Required' : null,
            ),

            const SizedBox(height: 40),

            // Submit button
            Container(
              height: 58,
              decoration: BoxDecoration(
                gradient: _isSubmitting
                    ? null
                    : const LinearGradient(
                        colors: AppColors.gradientCustomers,
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                color: _isSubmitting ? AppColors.bgCard : null,
                borderRadius: BorderRadius.circular(16),
                boxShadow: _isSubmitting
                    ? []
                    : [
                        BoxShadow(
                          color: const Color(0xFF3B82F6).withOpacity(0.4),
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
                            'SUBMIT PROPOSAL',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.5,
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
