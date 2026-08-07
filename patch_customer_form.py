with open('src/app/_components/crm/CustomerForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Props
content = content.replace('interface CustomerFormProps {\\n  onSuccess?: () => void;\\n  isManager?: boolean;\\n}', 'interface CustomerFormProps {\\n  initialData?: any;\\n  onSuccess?: () => void;\\n  isManager?: boolean;\\n}')

# 2. Add initialData to component parameters
content = content.replace('export function CustomerForm({\\n  onSuccess,\\n  isManager = false,\\n}: CustomerFormProps) {', 'export function CustomerForm({\\n  initialData,\\n  onSuccess,\\n  isManager = false,\\n}: CustomerFormProps) {')

# 3. Update default values
new_default_values = """    defaultValues: initialData ? {
      firstName: initialData.name?.split(" ")[0] || "",
      middleName: "",
      lastName: initialData.name?.split(" ").slice(1).join(" ") || "",
      fatherName: initialData.fatherName || "",
      mobile: initialData.mobile || "",
      dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "",
      pincode: initialData.pincode || "",
      village: initialData.village || "",
      district: initialData.district || "",
      state: initialData.state || "",
      address: initialData.address || "",
      branchId: initialData.branchId?.toString() || "",
    } : {
      firstName: "",
      middleName: "",
      lastName: "",
      fatherName: "",
      mobile: "",
      dob: "",
      pincode: "",
      village: "",
      district: "",
      state: "",
      address: "",
      branchId: "",
    },"""

old_default_values = """    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      fatherName: "",
      mobile: "",
      dob: "",
      pincode: "",
      village: "",
      district: "",
      state: "",
      address: "",
      branchId: "",
    },"""
content = content.replace(old_default_values, new_default_values)

# 4. Add updateMutation
update_mutation = """  const updateMutation = api.crm.updateCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer updated successfully");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message),
  });"""
content = content.replace('  const proposeMutation = api.crm.proposeCustomer.useMutation({', update_mutation + '\\n\\n  const proposeMutation = api.crm.proposeCustomer.useMutation({')

# 5. Handle submit
submit_logic = """    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...formattedValues });
    } else if (isManager) {
      createMutation.mutate(formattedValues);
    } else {
      proposeMutation.mutate(formattedValues);
    }"""
content = content.replace('    if (isManager) {\\n      createMutation.mutate(formattedValues);\\n    } else {\\n      proposeMutation.mutate(formattedValues);\\n    }', submit_logic)

# 6. Button text
content = content.replace('isManager ? "Create Customer" : "Propose Customer"', 'initialData ? "Update Customer" : (isManager ? "Create Customer" : "Propose Customer")')
content = content.replace('isManager ? "Add Approved Customer" : "Propose New Customer"', 'initialData ? "Edit Customer" : (isManager ? "Add Approved Customer" : "Propose New Customer")')
content = content.replace('disabled={proposeMutation.isPending || createMutation.isPending}', 'disabled={proposeMutation.isPending || createMutation.isPending || updateMutation.isPending}')
content = content.replace('(proposeMutation.isPending || createMutation.isPending) &&', '(proposeMutation.isPending || createMutation.isPending || updateMutation.isPending) &&')

with open('src/app/_components/crm/CustomerForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
