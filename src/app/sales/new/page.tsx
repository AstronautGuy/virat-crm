"use client";
import { env } from "@/env";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";

import { DashboardLayout } from "../../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  WifiOff,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileUploader } from "@/app/_components/ui/FileUploader";

export default function NewSale() {
  const router = useRouter();

  const [branchId, setBranchId] = useState("");
  const [success, setSuccess] = useState(false);
  const [newSaleId, setNewSaleId] = useState<number | null>(null);
  const [pincode, setPincode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [debouncedOrderNumber, setDebouncedOrderNumber] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  
  const [cmrId, setCmrId] = useState("");
  const [tmNo, setTmNo] = useState("");
  const [saleType, setSaleType] = useState("Retail");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderNumber(orderNumber);
    }, 500);
    return () => clearTimeout(handler);
  }, [orderNumber]);

  const { data: orderNumberCheck } = api.sales.checkOrderNumber.useQuery(
    { orderNumber: debouncedOrderNumber },
    { enabled: debouncedOrderNumber.length > 0 }
  );
  const [customerId, setCustomerId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const { data: me } = api.users.getMe.useQuery();
  const isAdmin = me?.role === "Admin";
  const { data: allUsers = [] } = api.users.getAllUsers.useQuery(undefined, {
    enabled: isAdmin,
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    landlineNo: "",
    dob: undefined as Date | undefined,
    marriageDate: undefined as Date | undefined,
    pincode: "",
    village: "",
    district: "",
    state: "",
    address: "",
  });

  const { data: nextInvoiceId } = api.sales.getNextInvoiceId.useQuery();
  useEffect(() => {
    if (nextInvoiceId && !transactionNumber)
      setTransactionNumber(nextInvoiceId);
  }, [nextInvoiceId, transactionNumber]);

  const { data: customers = [], refetch: refetchCustomers } =
    api.crm.getBranchCustomers.useQuery();

  const addCustomerMutation = api.crm.createCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer created successfully");
      setIsCustomerModalOpen(false);
      void refetchCustomers();
    },
    onError: (err) => toast.error(err.message),
  });
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [tradeDiscount, setTradeDiscount] = useState("0");
  const [basicInvoiceValue, setBasicInvoiceValue] = useState("0");
  const [cgst, setCgst] = useState("0");
  const [sgst, setSgst] = useState("0");
  const [igst, setIgst] = useState("0");

  const pendingAmount =
    parseFloat(invoiceAmount || "0") - parseFloat(advancePaymentAmount || "0");

  const [items, setItems] = useState([
    { id: Date.now(), productId: "", quantity: "1", isFree: false, ptsPerQty: "", totalPts: "", offerNumber: "" },
  ]);

  const { data: branches = [] } = api.inventory.getBranches.useQuery();
  const { data: products = [] } = api.inventory.getProducts.useQuery();

  // Pincode Auto-fill Effect
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  useEffect(() => {
    if (pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode)) {
      const fetchDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(
            `${env.NEXT_PUBLIC_PINCODE_API_URL}/${pincode}`,
          );
          interface PincodeResponse {
            PostOffice: Array<{
              Name: string;
              District: string;
              State: string;
            }>;
            Status: string;
          }
          const data = (await res.json()) as PincodeResponse[];
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            if (postOffice) {
              setCity(postOffice.District ?? "");
              setState(postOffice.State ?? "");
              setArea(postOffice.Name ?? "");
            }
          }
        } catch (e) {
          console.error("Failed to fetch pincode details", e);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      void fetchDetails();
    }
  }, [pincode]);

  const { mutate: createSale, isPending } = api.sales.createSale.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSuccess(true);
        setNewSaleId(data.id);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    const missingItems = items.some(
      (item) => !item.productId || !item.quantity,
    );
    if (missingItems) {
      toast.error("Please select a product and quantity for all items");
      return;
    }
    if (!orderNumber?.trim()) {
      toast.error("Order ID is required");
      return;
    }
    if (orderNumberCheck?.exists) {
      toast.error("Order ID already exists. Please use a unique Order ID.");
      return;
    }
    if (!customerId) {
      toast.error("Customer selection is required");
      return;
    }

    if (
      isAdmin &&
      (selectedUserIds.length === 0 || selectedManagerIds.length === 0)
    ) {
      toast.error(
        "At least one Employee and Manager selection is required for Admins",
      );
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      toast.error("Valid 6-digit Pincode is required");
      return;
    }
    if (!city?.trim() || !state?.trim() || !addressLine1?.trim()) {
      toast.error("City, State, and Address Line 1 are required");
      return;
    }
    if (!invoiceAmount || parseFloat(invoiceAmount) < 0) {
      toast.error("Valid Invoice Amount is required");
      return;
    }

    const saleData = {
      branchId: parseInt(branchId),
      pincode: pincode === "" ? undefined : pincode,
      addressLine1: addressLine1 === "" ? undefined : addressLine1,
      landmark: landmark === "" ? undefined : landmark,
      area: area === "" ? undefined : area,
      city: city === "" ? undefined : city,
      state: state === "" ? undefined : state,
      cmrId: cmrId === "" ? undefined : cmrId,
      tmNo: tmNo === "" ? undefined : tmNo,
      saleType: saleType,
      orderNumber: orderNumber,
      transactionNumber:
        transactionNumber === "" ? undefined : transactionNumber,
      userIds:
        isAdmin && selectedUserIds.length > 0 ? selectedUserIds : undefined,
      managerIds:
        isAdmin && selectedManagerIds.length > 0
          ? selectedManagerIds
          : undefined,
      customerName: selectedCustomer?.name,
      customerAddress: selectedCustomer?.address,
      invoiceAmount: invoiceAmount === "" ? undefined : invoiceAmount,
      advancePaymentAmount:
        advancePaymentAmount === "" ? undefined : advancePaymentAmount,
      receivedAmount: "0",
      tradeDiscount,
      basicInvoiceValue,
      cgst,
      sgst,
      igst,
      items: items.map((item) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        isFree: item.isFree,
        ptsPerQty: item.ptsPerQty === "" ? undefined : item.ptsPerQty,
        totalPts: item.totalPts === "" ? undefined : item.totalPts,
        offerNumber: item.offerNumber === "" ? undefined : item.offerNumber,
      })),
    };

    if (!navigator.onLine) {
      const { addToOfflineQueue } = await import("@/lib/offline-db");
      await addToOfflineQueue({
        type: "createSale",
        data: saleData,
        createdAt: Date.now(),
      });
      setSuccess(true);
      setNewSaleId(-1); // Indicator for offline
      return;
    }

    createSale(saleData);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), productId: "", quantity: "1", isFree: false, ptsPerQty: "", totalPts: "", offerNumber: "" },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | boolean) => {
    if (field === "productId") {
      const isDuplicate = items.some(
        (item) => item.id !== id && item.productId === value,
      );
      if (isDuplicate) {
        alert("This product is already added to the sale.");
        return;
      }
    }
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="sales">
        <div className="mx-auto flex max-w-4xl flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Link href="/sales">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Log Sale</h1>
          </div>

          {success && newSaleId ? (
            <div className="space-y-6">
              <Card
                className={cn(
                  "border-primary/20",
                  newSaleId === -1
                    ? "border-orange-200 bg-orange-50"
                    : "bg-primary/5",
                )}
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className={cn(
                      "mb-4 inline-flex rounded-full p-3",
                      newSaleId === -1 ? "bg-orange-100" : "bg-primary/20",
                    )}
                  >
                    {newSaleId === -1 ? (
                      <WifiOff className="h-10 w-10 text-orange-600" />
                    ) : (
                      <CheckCircle className="text-primary h-10 w-10" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {newSaleId === -1
                      ? "Sale Saved Locally!"
                      : "Sale Logged Successfully!"}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {newSaleId === -1
                      ? "You are currently offline. This sale has been saved to your device and will sync automatically once you regain connection."
                      : "Your sale record has been created. You can now upload the invoice or relevant documents below."}
                  </p>
                </CardContent>
              </Card>

              {newSaleId !== -1 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-muted-foreground text-sm font-semibold uppercase">
                      Upload Invoice / Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploader
                      entityType="sale"
                      entityId={newSaleId}
                      maxFiles={3}
                      onUploadComplete={() => undefined}
                    />
                    <div className="mt-6 flex justify-center">
                      <Link href="/sales">
                        <Button variant="outline">Skip & Finish</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex justify-center">
                  <Link href="/sales">
                    <Button className="px-8">Return to Sales</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pb-6">
              {/* TOP SECTION */}
              <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 shadow-sm">
                <div className="grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">CMR ID</Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={cmrId} onChange={e => setCmrId(e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">TM NO.</Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={tmNo} onChange={e => setTmNo(e.target.value)} />
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Type of Sale</Label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5">
                      {["Retail", "Stockist", "Inter Branch", "Institution", "Distributor", "Wholesale"].map(type => (
                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="saleType" value={type} checked={saleType === type} onChange={e => setSaleType(e.target.value)} className="accent-emerald-600" />
                          <span className="text-[10px] leading-none">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Order No / Date <span className="text-red-500">*</span></Label>
                    <Input className={cn("h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500 bg-white", orderNumberCheck?.exists && "border-red-500")} value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="ORD-XXXX" />
                    {orderNumberCheck?.exists && <p className="text-[10px] text-red-500 mt-0.5">Order ID exists.</p>}
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Invoice No & Date</Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={transactionNumber} onChange={e => setTransactionNumber(e.target.value)} />
                  </div>
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-12 gap-2 mt-2 pt-2 border-t border-emerald-200 text-xs">
                    <div className="col-span-6 space-y-1">
                      <Label className="text-[10px] font-bold text-emerald-900 uppercase flex items-center justify-between">
                        <span>Employee <span className="text-red-500">*</span></span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px] text-emerald-700 hover:text-emerald-900">+ Add</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search employee..." className="h-8 text-xs" />
                              <CommandList>
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup>
                                  {allUsers
                                    .filter((u) => u.role === "Employee" || u.role === "Manager")
                                    .map((u) => (
                                      <CommandItem
                                        key={u.id}
                                        value={`${u.firstName} ${u.lastName} ${u.employeeCode}`}
                                        onSelect={() => {
                                          setSelectedUserIds((prev) =>
                                            prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id],
                                          );
                                        }}
                                      >
                                        {u.firstName} {u.lastName} ({u.employeeCode})
                                        <Check className={cn("ml-auto h-3 w-3", selectedUserIds.includes(u.id) ? "opacity-100" : "opacity-0")} />
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedUserIds.length > 0 ? (
                          selectedUserIds.map((id) => {
                            const u = allUsers.find((user) => user.id === id);
                            return (
                              <div key={id} className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                                {u?.firstName} {u?.lastName}
                                <button type="button" onClick={() => setSelectedUserIds((prev) => prev.filter((i) => i !== id))}><X className="h-3 w-3 hover:text-red-500" /></button>
                              </div>
                            );
                          })
                        ) : <div className="text-[10px] text-muted-foreground">None</div>}
                      </div>
                    </div>
                    <div className="col-span-6 space-y-1">
                      <Label className="text-[10px] font-bold text-emerald-900 uppercase flex items-center justify-between">
                        <span>Manager <span className="text-red-500">*</span></span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px] text-emerald-700 hover:text-emerald-900">+ Add</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search manager..." className="h-8 text-xs" />
                              <CommandList>
                                <CommandEmpty>No manager found.</CommandEmpty>
                                <CommandGroup>
                                  {allUsers
                                    .filter((u) => u.role === "Manager" || u.role === "Admin")
                                    .map((u) => (
                                      <CommandItem
                                        key={u.id}
                                        value={`${u.firstName} ${u.lastName} ${u.employeeCode}`}
                                        onSelect={() => {
                                          setSelectedManagerIds((prev) =>
                                            prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id],
                                          );
                                        }}
                                      >
                                        {u.firstName} {u.lastName} ({u.employeeCode})
                                        <Check className={cn("ml-auto h-3 w-3", selectedManagerIds.includes(u.id) ? "opacity-100" : "opacity-0")} />
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedManagerIds.length > 0 ? (
                          selectedManagerIds.map((id) => {
                            const u = allUsers.find((user) => user.id === id);
                            return (
                              <div key={id} className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                                {u?.firstName} {u?.lastName}
                                <button type="button" onClick={() => setSelectedManagerIds((prev) => prev.filter((i) => i !== id))}><X className="h-3 w-3 hover:text-red-500" /></button>
                              </div>
                            );
                          })
                        ) : <div className="text-[10px] text-muted-foreground">None</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CUSTOMER DETAILS */}
              <div className="rounded-md border border-emerald-200 bg-white p-3 shadow-sm">
                <div className="grid grid-cols-12 gap-x-3 gap-y-2 text-xs">
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Customer Name <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between h-7 text-xs border-emerald-200", !customerId && "text-muted-foreground")}>
                          <span className="truncate">{customerId ? customers.find((c) => c.id === customerId)?.name : "Select..."}</span>
                          <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search customer..." className="h-8 text-xs" />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem key={customer.id} value={customer.name} onSelect={() => setCustomerId(customer.id)}>
                                  {customer.name} - {customer.mobile}
                                  <Check className={cn("ml-auto h-3 w-3", customerId === customer.id ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <div className="p-1 border-t border-border">
                              <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-emerald-700" onClick={() => setIsCustomerModalOpen(true)}>
                                <Plus className="mr-1 h-3 w-3" /> Add New
                              </Button>
                            </div>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Branch <span className="text-red-500">*</span></Label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger className="h-7 text-xs border-emerald-200"><SelectValue placeholder="Branch" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()} className="text-xs">{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase flex justify-between">
                      <span>Pincode <span className="text-red-500">*</span></span>
                      {isFetchingPincode && <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />}
                    </Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">City <span className="text-red-500">*</span></Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">State <span className="text-red-500">*</span></Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={state} onChange={e => setState(e.target.value)} />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Area / Post Office</Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={area} onChange={e => setArea(e.target.value)} />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Address Line 1 <span className="text-red-500">*</span></Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900 uppercase">Landmark</Label>
                    <Input className="h-7 text-xs border-emerald-200 focus-visible:ring-emerald-500" value={landmark} onChange={e => setLandmark(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* PRODUCTS TABLE */}
              <div className="rounded-md border border-emerald-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-emerald-600 px-3 py-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Products Grid</h3>
                  <Button type="button" variant="secondary" size="sm" className="h-6 text-[10px] px-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" /> Add Row
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-emerald-50 text-emerald-900 border-b border-emerald-200">
                      <tr>
                        <th className="px-2 py-1.5 font-bold w-8 text-center border-r border-emerald-200">S.No</th>
                        <th className="px-2 py-1.5 font-bold border-r border-emerald-200 min-w-[200px]">Product Name <span className="text-red-500">*</span></th>
                        <th className="px-2 py-1.5 font-bold w-20 text-center border-r border-emerald-200">Main/Free</th>
                        <th className="px-2 py-1.5 font-bold w-20 text-right border-r border-emerald-200">Qty <span className="text-red-500">*</span></th>
                        <th className="px-2 py-1.5 font-bold w-24 text-right border-r border-emerald-200">Pts/Qty</th>
                        <th className="px-2 py-1.5 font-bold w-24 text-right border-r border-emerald-200">Total Pts</th>
                        <th className="px-2 py-1.5 font-bold w-32 border-r border-emerald-200">Offer No.</th>
                        <th className="px-2 py-1.5 font-bold w-10 text-center">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-emerald-50/50">
                          <td className="px-2 py-1 text-center border-r border-emerald-100 text-emerald-600 font-medium">{index + 1}</td>
                          <td className="px-2 py-1 border-r border-emerald-100">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className={cn("w-full justify-between h-6 px-2 text-[10px] border-emerald-200 bg-white", !item.productId && "text-muted-foreground")}>
                                  <span className="truncate">{item.productId ? products.find((p) => p.id.toString() === item.productId)?.name : "Select..."}</span>
                                  <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search product..." className="h-8 text-xs" />
                                  <CommandList>
                                    <CommandEmpty>No product found.</CommandEmpty>
                                    <CommandGroup>
                                      {products.map((product) => (
                                        <CommandItem key={product.id} value={product.name} onSelect={() => updateItem(item.id, "productId", product.id.toString())}>
                                          {product.name}
                                          <Check className={cn("ml-auto h-3 w-3", item.productId === product.id.toString() ? "opacity-100" : "opacity-0")} />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-2 py-1 text-center border-r border-emerald-100">
                            <select
                              value={item.isFree ? "Free" : "Main"}
                              onChange={(e) => updateItem(item.id, "isFree", e.target.value === "Free")}
                              className="h-6 w-full rounded border border-emerald-200 bg-white px-1 text-[10px] outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Main">Main</option>
                              <option value="Free">Free</option>
                            </select>
                          </td>
                          <td className="px-2 py-1 border-r border-emerald-100">
                            <Input type="number" min="1" className="h-6 px-2 text-[10px] text-right border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={item.quantity} onChange={e => updateItem(item.id, "quantity", e.target.value)} />
                          </td>
                          <td className="px-2 py-1 border-r border-emerald-100">
                            <Input type="number" step="0.01" className="h-6 px-2 text-[10px] text-right border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={item.ptsPerQty} onChange={e => updateItem(item.id, "ptsPerQty", e.target.value)} />
                          </td>
                          <td className="px-2 py-1 border-r border-emerald-100">
                            <Input type="number" step="0.01" className="h-6 px-2 text-[10px] text-right border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={item.totalPts} onChange={e => updateItem(item.id, "totalPts", e.target.value)} />
                          </td>
                          <td className="px-2 py-1 border-r border-emerald-100">
                            <Input className="h-6 px-2 text-[10px] border-emerald-200 focus-visible:ring-emerald-500 bg-white" value={item.offerNumber} onChange={e => updateItem(item.id, "offerNumber", e.target.value)} />
                          </td>
                          <td className="px-2 py-1 text-center">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FINANCIALS */}
              <div className="rounded-md border border-emerald-200 bg-emerald-50/30 p-3 shadow-sm">
                <h3 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-2 border-b border-emerald-200 pb-1">Financial Details</h3>
                <div className="grid grid-cols-12 gap-3 text-xs">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">Total Invoice Amt <span className="text-red-500">*</span></Label>
                    <Input className="h-7 text-xs border-emerald-300 font-bold bg-white" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} type="number" step="0.01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">Advance Amt</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={advancePaymentAmount} onChange={e => setAdvancePaymentAmount(parseFloat(e.target.value) > parseFloat(invoiceAmount || "0") ? advancePaymentAmount : e.target.value)} type="number" step="0.01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">Pending Amt</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-emerald-100/50 font-bold" value={pendingAmount > 0 ? pendingAmount : 0} readOnly disabled type="number" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">Trade Discount</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={tradeDiscount} onChange={e => setTradeDiscount(e.target.value)} type="number" step="0.01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">Basic Invoice Val</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={basicInvoiceValue} onChange={e => setBasicInvoiceValue(e.target.value)} type="number" step="0.01" />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-3 mt-2 text-xs">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">CGST</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={cgst} onChange={e => setCgst(e.target.value)} type="number" step="0.01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">SGST</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={sgst} onChange={e => setSgst(e.target.value)} type="number" step="0.01" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] font-bold text-emerald-900">IGST</Label>
                    <Input className="h-7 text-xs border-emerald-200 bg-white" value={igst} onChange={e => setIgst(e.target.value)} type="number" step="0.01" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  LOG SALE
                </Button>
              </div>
            </form>

          )}
        </div>
      </FeatureGate>

      {/* Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl duration-200 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Add New Customer
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Mobile *
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.mobile}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, mobile: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.pincode}
                    maxLength={6}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        pincode: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Area / Post Office
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.village}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        village: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    City *
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.district}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        district: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    State *
                  </label>
                  <input
                    type="text"
                    className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                    value={newCustomer.state}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, state: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Address & Landmark *
                </label>
                <Textarea
                  className="focus:ring-primary/20 focus:border-primary min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-all outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    !newCustomer.name ||
                    !newCustomer.mobile ||
                    !newCustomer.pincode
                  ) {
                    toast.error("Please fill Name, Mobile, and Pincode");
                    return;
                  }
                  addCustomerMutation.mutate({
                    name: newCustomer.name,
                    mobile: newCustomer.mobile,
                    pincode: newCustomer.pincode,
                    landlineNo: newCustomer.landlineNo || undefined,
                    dob: newCustomer.dob || undefined,
                    marriageDate: newCustomer.marriageDate || undefined,
                    village: newCustomer.village || "Unknown",
                    district: newCustomer.district || "Unknown",
                    state: newCustomer.state || "Unknown",
                    address: newCustomer.address || "Unknown",
                    branchId: parseInt(branchId) || undefined,
                  });
                }}
                disabled={addCustomerMutation.isPending}
                className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-[0_1px_3px_rgba(37,99,235,0.2)] transition-all hover:opacity-90 disabled:opacity-50"
              >
                {addCustomerMutation.isPending ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
