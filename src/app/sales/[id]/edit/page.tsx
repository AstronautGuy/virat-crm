"use client";
import { env } from "@/env";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  WifiOff,
  Search,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileUploader } from "@/app/_components/ui/FileUploader";
import { MultiSelectInput } from "@/app/_components/ui/MultiSelectInput";

import { useParams } from "next/navigation";
import { usePincodeLookup } from "@/hooks/usePincodeLookup";

export default function EditSale() {
  const router = useRouter();
  const params = useParams();
  const saleId = parseInt(params.id as string);

  const { data: sale, isLoading: isFetchingSale } = api.sales.getSale.useQuery(
    { id: saleId },
    { enabled: !!saleId },
  );


  const [branchId, setBranchId] = useState("");
  const [success, setSuccess] = useState(false);
  const [newSaleId, setNewSaleId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [invDate, setInvDate] = useState("");
  
  const [cmrId, setCmrId] = useState("");
  const [tmNo, setTmNo] = useState("");
  const [docMonth, setDocMonth] = useState("");
  
  useEffect(() => {
    setDocMonth(new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-'));
  }, []);

  const [userIds, setUserIds] = useState<string[]>([]);
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [saleType, setSaleType] = useState("Direct to Customer from PU"); // Radio button
  const [oldAdvanceOrderNumber, setOldAdvanceOrderNumber] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Customer details
  const [villageSearch, setVillageSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [so, setSo] = useState("");
  const [village, setVillage] = useState("");
  const [mandal, setMandal] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [landMark, setLandMark] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [landLineNo, setLandLineNo] = useState("");
  const [dob, setDob] = useState("");
  const [marriageDate, setMarriageDate] = useState("");

  const { data: me } = api.users.getMe.useQuery();
  const isAdmin = me?.role === "Admin";
  
  const { data: branches = [] } = api.inventory.getBranches.useQuery();
  const { data: products = [] } = api.inventory.getProducts.useQuery();
  
  
  useEffect(() => {
    if (sale) {
      setBranchId(sale.branchId?.toString() ?? "");
      setOrderNumber(sale.orderNumber ?? "");
      setTransactionNumber(sale.transactionNumber ?? "");
      setCmrId(sale.cmrId ?? "");
      setTmNo(sale.tmNo ?? "");
      setSaleType(sale.saleType ?? "Direct to Customer from PU");
      setOldAdvanceOrderNumber(sale.oldAdvanceOrderNumber ?? "");
      setCustomerId(sale.customerId ?? "");
      setCustomerName(sale.customerName ?? "");
      if (sale.assignments) {
        setUserIds(sale.assignments.filter((a: any) => a.role === "Ecode").map((a: any) => a.userId));
        setManagerIds(sale.assignments.filter((a: any) => a.role === "FieldSupport").map((a: any) => a.userId));
      }
      setHouseNo(sale.customerAddress ?? "");
      setPin(sale.pincode ?? "");
      setMandal(sale.area ?? "");
      setDistrict(sale.city ?? "");
      setState(sale.state ?? "");
      setLandMark(sale.landmark ?? "");
      setInvoiceAmount(sale.invoiceAmount ?? "");

      if (sale.items) {
        const sItems = sale.items.filter(i => !i.isFree).map((item, idx) => ({
          id: item.id ?? idx,
          productId: item.productId?.toString() ?? "",
          quantity: item.quantity?.toString() ?? "1",
          rate: "",
          amount: "",
          ptsPerQty: item.ptsPerQty ?? "",
          totalPts: item.totalPts ?? "",
        }));
        if(sItems.length > 0) setSaleItems(sItems);

        const fItems = sale.items.filter(i => i.isFree).map((item, idx) => ({
          id: item.id ?? idx,
          productId: item.productId?.toString() ?? "",
          offerNumber: item.offerNumber ?? "",
          freeProduct: "",
          freeQty: item.quantity?.toString() ?? "1",
        }));
        if(fItems.length > 0) setFreeItems(fItems);
      }
    }
  }, [sale]);

  const { data: nextInvoiceId } = api.sales.getNextInvoiceId.useQuery();
  useEffect(() => {
    if (nextInvoiceId && !transactionNumber)
      setTransactionNumber(nextInvoiceId);
  }, [nextInvoiceId, transactionNumber]);

  const { data: customers = [], refetch: refetchCustomers } =
    api.crm.getBranchCustomers.useQuery();

  const { fetchedDistrict, fetchedState, villages: fetchedVillages, isLoading: isLoadingPincode } = usePincodeLookup(pin);

  useEffect(() => {
    if (fetchedDistrict) setDistrict(fetchedDistrict);
    if (fetchedState) setState(fetchedState);
    if (fetchedVillages.length > 0) {
      setVillage(fetchedVillages[0]);
    }
  }, [fetchedDistrict, fetchedState, fetchedVillages]);

  const { data: orgUsers = [] } = api.users.getUsersForDropdown.useQuery();
  const allUsersOptions = orgUsers.map((u) => ({
    id: u.id,
    label: u.employeeCode ? `${u.employeeCode} - ${u.firstName} ${u.lastName || ""}` : `${u.firstName} ${u.lastName || ""}`
  }));
  const managerOptions = orgUsers
    .filter((u) => u.role === "Manager")
    .map((u) => ({
      id: u.id,
      label: u.employeeCode ? `${u.employeeCode} - ${u.firstName} ${u.lastName || ""}` : `${u.firstName} ${u.lastName || ""}`
    }));

  // Populate customer fields on change
  useEffect(() => {
    if (customerId) {
      const c: any = customers.find(x => x.id === customerId);
      if (c) {
        setCustomerName(c.name || "");
        setMobileNo(c.mobile || "");
        setLandLineNo(c.landlineNo || "");
        setPin(c.pincode || "");
        setVillage(c.village || "");
        setDistrict(c.district || "");
        setState(c.state || "");
        setHouseNo(String(c.address || ""));
        setSo(String(c.fatherName || ""));
        if (c.dob) setDob(new Date(c.dob as string | number | Date).toISOString().split("T")[0] || "");
        if (c.marriageDate) setMarriageDate(new Date(c.marriageDate as string | number | Date).toISOString().split("T")[0] || "");
      }
    } else {
        setCustomerName("");
        setMobileNo("");
        setLandLineNo("");
        setPin("");
        setVillage("");
        setDistrict("");
        setState("");
        setHouseNo("");
        setDob("");
        setMarriageDate("");
    }
  }, [customerId, customers]);

  // Product grids
  const [saleItems, setSaleItems] = useState([
    { id: Date.now(), productId: "", quantity: "1", rate: "", amount: "", ptsPerQty: "", totalPts: "" },
  ]);

  const [freeItems, setFreeItems] = useState([
    { id: Date.now() + 1, productId: "", offerNumber: "", freeProduct: "", freeQty: "" },
  ]);

  const [invoiceAmount, setInvoiceAmount] = useState("");

  const updateSale = api.sales.updateSale.useMutation({
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
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    
    // Combine items
    const validSaleItems = saleItems.filter(i => i.productId && i.quantity).map(i => ({
      productId: parseInt(i.productId),
      quantity: parseInt(i.quantity),
      isFree: false,
      ptsPerQty: i.ptsPerQty,
      totalPts: i.totalPts,
    }));

    const validFreeItems = freeItems.filter(i => i.productId && i.freeQty).map(i => ({
      productId: parseInt(i.productId), // Note: using main product dropdown here, or free product if available
      quantity: parseInt(i.freeQty),
      isFree: true,
      offerNumber: i.offerNumber,
    }));

    const allItems = [...validSaleItems, ...validFreeItems];

    if (allItems.length === 0) {
      toast.error("Please select a product and quantity for at least one item");
      return;
    }

    if (!orderNumber?.trim()) {
      toast.error("Order No is required");
      return;
    }

    if (!customerName?.trim()) {
      toast.error("Customer Name is required");
      return;
    }

    if (!pin || !/^[1-9][0-9]{5}$/.test(pin)) {
      toast.error("Valid 6-digit Pincode is required");
      return;
    }
    
    if (!invoiceAmount || parseFloat(invoiceAmount) < 0) {
      toast.error("Valid Invoice Amount is required");
      return;
    }

    const saleData = {
      id: saleId,
      branchId: parseInt(branchId),
      pincode: pin === "" ? undefined : pin,
      addressLine1: houseNo === "" ? undefined : houseNo,
      landmark: landMark === "" ? undefined : landMark,
      area: mandal === "" ? undefined : mandal, // storing mandal as area
      city: district === "" ? undefined : district,
      state: state === "" ? undefined : state,
      cmrId: cmrId === "" ? undefined : cmrId,
      tmNo: tmNo === "" ? undefined : tmNo,
      saleType: saleType,
      oldAdvanceOrderNumber: saleType === "Free product against old advance" ? (oldAdvanceOrderNumber || undefined) : undefined,
      orderNumber: orderNumber,
      transactionNumber: transactionNumber === "" ? undefined : transactionNumber,
      customerName: customerName,
      customerAddress: houseNo,
      invoiceAmount: invoiceAmount === "" ? undefined : invoiceAmount,
      advancePaymentAmount: "0",
      receivedAmount: "0",
      registerType: "Sale" as const,
      tradeDiscount: "0",
      basicInvoiceValue: "0",
      cgst: "0",
      sgst: "0",
      igst: "0",
      userIds,
      managerIds,
      items: allItems,
    };

    if (!navigator.onLine) {
      const { addToOfflineQueue } = await import("@/lib/offline-db");
      await addToOfflineQueue({
        type: "updateSale",
        data: saleData,
        createdAt: Date.now(),
      });
      setSuccess(true);
      setNewSaleId(-1);
      return;
    }

    updateSale.mutate(saleData);
  };


  const deleteSale = api.sales.deleteSale.useMutation({
    onSuccess: () => {
      toast.success("Sale deleted successfully");
      router.push("/sales");
    },
    onError: (err) => toast.error(`Delete failed: ${err.message}`),
  });

  const clearForm = () => {
    setBranchId("");
    setOrderNumber("");
    setOrderDate("");
    setTransactionNumber("");
    setInvDate("");
    setCmrId("");
    setTmNo("");
    setDocMonth(new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-'));
    setUserIds([]);
    setManagerIds([]);
    setSaleType("Direct to Customer from PU");
    setCustomerId("");
    setCustomerSearch("");
    setVillageSearch("");
    setCustomerName("");
    setSo("");
    setVillage("");
    setMandal("");
    setDistrict("");
    setState("");
    setPin("");
    setHouseNo("");
    setLandMark("");
    setMobileNo("");
    setLandLineNo("");
    setDob("");
    setMarriageDate("");
    setSaleItems([{ id: Date.now(), productId: "", quantity: "1", rate: "", amount: "", ptsPerQty: "", totalPts: "" }]);
    setFreeItems([{ id: Date.now() + 1, productId: "", offerNumber: "", freeProduct: "", freeQty: "" }]);
    setInvoiceAmount("");
  };

  const mainQtyTotal = saleItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  const freeQtyTotal = freeItems.reduce((acc, item) => acc + (parseInt(item.freeQty) || 0), 0);
  const totalQty = mainQtyTotal + freeQtyTotal;

  const updateSaleItem = (id: number, field: string, value: string) => {
    setSaleItems(saleItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const updateFreeItem = (id: number, field: string, value: string) => {
    setFreeItems(freeItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="sales">
        {success && newSaleId ? (
          <div className="mx-auto flex max-w-4xl flex-col space-y-6">
            <Card className={cn("border-primary/20", newSaleId === -1 ? "border-orange-200 bg-orange-50" : "bg-primary/5")}>
              <CardContent className="pt-6 text-center">
                <div className={cn("mb-4 inline-flex rounded-full p-3", newSaleId === -1 ? "bg-orange-100" : "bg-primary/20")}>
                  {newSaleId === -1 ? <WifiOff className="h-10 w-10 text-orange-600" /> : <CheckCircle className="text-primary h-10 w-10" />}
                </div>
                <h2 className="text-2xl font-bold">{newSaleId === -1 ? "Sale Saved Locally!" : "Sale Logged Successfully!"}</h2>
                <p className="text-muted-foreground mt-2">{newSaleId === -1 ? "You are offline." : "Saved."}</p>
              </CardContent>
            </Card>

            {newSaleId !== -1 ? (
              <Card>
                <CardHeader><CardTitle className="text-muted-foreground text-sm font-semibold uppercase">Upload Invoice / Documents</CardTitle></CardHeader>
                <CardContent>
                  <FileUploader entityType="sale" entityId={newSaleId} maxFiles={3} onUploadComplete={() => undefined} />
                  <div className="mt-6 flex justify-center">
                    <Link href="/sales"><Button variant="outline">Skip & Finish</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-center"><Link href="/sales"><Button className="px-8">Return</Button></Link></div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-[1200px] border-2 border-slate-300 shadow bg-[#cde8e8] text-xs pb-4 font-sans">
            <div className="flex justify-between items-center bg-white px-2 py-1 border-b-2 border-slate-300">
              <div className="font-bold text-sm">PU Invoice :: B2C</div>
              <div className="flex gap-4 items-center">
                <div className="font-bold text-sm border px-2 py-0.5 bg-gray-100">Sales Invoice :: B2C</div>
                <Link href="/sales" className="flex items-center text-red-600 font-bold hover:underline"><X className="w-4 h-4 mr-1"/> Close</Link>
              </div>
            </div>

            <div className="p-2 space-y-2">
              {/* TOP METADATA BLOCK */}
              <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                {/* Column 1 */}
                <div className="col-span-1 text-right mt-1">Company</div>
                <div className="col-span-4">
                  <input type="text" value="SHIVASHAKTI AGRITEC LIMITED" readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-right mt-1">Tax Inv No</div>
                <div className="col-span-2">
                  <input type="text" value={transactionNumber} onChange={e=>setTransactionNumber(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                </div>
                <div className="col-span-3"></div>

                <div className="col-span-1 text-right mt-1">Branch</div>
                <div className="col-span-4">
                  <select value={branchId} onChange={e=>setBranchId(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs">
                    <option value="">Select Branch</option>
                    {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 text-right mt-1">DocMonth</div>
                <div className="col-span-1">
                  <input type="text" value={docMonth} onChange={e=>setDocMonth(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">CMR ID</div>
                <div className="col-span-2">
                  <input type="text" value={cmrId} onChange={e=>setCmrId(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-1 text-right mt-1">Order No</div>
                <div className="col-span-2">
                  <input type="text" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Order Date</div>
                <div className="col-span-1">
                  <input type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Ecode</div>
                <div className="col-span-4">
                  <MultiSelectInput options={allUsersOptions} selectedIds={userIds} onChange={setUserIds} placeholder="Select Ecode..." />
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-1 text-right mt-1">Tm No</div>
                <div className="col-span-2">
                  <input type="text" value={tmNo} onChange={e=>setTmNo(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Inv Date</div>
                <div className="col-span-1">
                  <input type="date" value={invDate} onChange={e=>setInvDate(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1 whitespace-nowrap">Field SupP By</div>
                <div className="col-span-4">
                  <MultiSelectInput options={managerOptions} selectedIds={managerIds} onChange={setManagerIds} placeholder="Select Field Support..." />
                </div>
                <div className="col-span-2"></div>
              </div>

              <div className="flex flex-col gap-1 mt-2 mb-2 bg-gray-100 p-2 border border-gray-300">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 font-semibold">
                    <input type="radio" name="saleType" value="Direct to Customer from PU" checked={saleType === "Direct to Customer from PU"} onChange={(e) => setSaleType(e.target.value)} /> Direct to Customer from PU
                  </label>
                  <label className="flex items-center gap-1 font-semibold">
                    <input type="radio" name="saleType" value="Free product against old advance" checked={saleType === "Free product against old advance"} onChange={(e) => setSaleType(e.target.value)} /> Free product against old advance
                  </label>
                </div>
                {saleType === "Free product against old advance" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-xs whitespace-nowrap">Old Advance Order No <span className="text-red-500">*</span></span>
                    <input type="text" value={oldAdvanceOrderNumber} onChange={(e) => setOldAdvanceOrderNumber(e.target.value)} className="w-48 border border-gray-400 px-1 py-0.5 bg-white text-xs" required />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                <div className="col-span-2 text-right mt-1">Village Search</div>
                <div className="col-span-2 flex">
                  <input type="text" value={villageSearch} onChange={e=>setVillageSearch(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                  <button type="button" className="bg-emerald-600 px-1.5 border border-gray-600 text-white"><Search className="w-3 h-3"/></button>
                </div>
                <div className="col-span-1 text-right mt-1 whitespace-nowrap">Customer Name</div>
                <div className="col-span-5">
                  <input 
                    type="text" 
                    list="edit-customers-list"
                    value={customerName} 
                    onChange={e => {
                      setCustomerName(e.target.value);
                      const existing = customers.find(c => c.name === e.target.value);
                      if (existing) {
                        setCustomerId(existing.id);
                      } else {
                        setCustomerId("");
                      }
                    }} 
                    placeholder="Type or select customer..." 
                    className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"
                  />
                  <datalist id="edit-customers-list">
                    {customers.filter(c => !villageSearch || (c.village && c.village.toLowerCase().includes(villageSearch.toLowerCase()))).map(c => (
                      <option key={c.id} value={c.name}>{c.mobile}</option>
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">Village</div>
                <div className="col-span-2 relative">
                  <input type="text" list="villages-list" value={village} onChange={e=>setVillage(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                  {isLoadingPincode && <div className="absolute right-1 top-1 text-[10px] text-gray-500">...</div>}
                  <datalist id="villages-list">
                    {fetchedVillages.map(v => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-1 text-right mt-1">
                  <select className="border border-gray-400 text-xs py-0.5"><option>S/O</option><option>W/O</option><option>D/O</option></select>
                </div>
                <div className="col-span-5">
                  <input type="text" value={so} onChange={e=>setSo(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">Mandal/Tahsil</div>
                <div className="col-span-2">
                  <input type="text" value={mandal} onChange={e=>setMandal(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">House No</div>
                <div className="col-span-2">
                  <input type="text" value={houseNo} onChange={e=>setHouseNo(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Land Mark</div>
                <div className="col-span-2">
                  <input type="text" value={landMark} onChange={e=>setLandMark(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">District</div>
                <div className="col-span-2">
                  <input type="text" value={district} onChange={e=>setDistrict(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Mobile No</div>
                <div className="col-span-2">
                  <input type="text" value={mobileNo} onChange={e=>setMobileNo(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Land Line No</div>
                <div className="col-span-2">
                  <input type="text" value={landLineNo} onChange={e=>setLandLineNo(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">State</div>
                <div className="col-span-1 flex gap-1 items-center">
                  <input type="text" value={state} onChange={e=>setState(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#fefce8] text-xs"/>
                  <span>Pin</span>
                </div>
                <div className="col-span-1">
                  <input type="text" value={pin} onChange={e=>setPin(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">DOB / Age</div>
                <div className="col-span-2">
                  <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-[#e0f2fe] text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Marriage Date</div>
                <div className="col-span-2">
                  <input type="date" value={marriageDate} onChange={e=>setMarriageDate(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>
                </div>
                <div className="col-span-2"></div>
              </div>

              {/* SALE PRODUCTS TAB/GRID */}
              <div className="mt-2 border border-gray-300 bg-white">
                <div className="flex justify-between items-center bg-gray-100 border-b border-gray-300 px-2 py-1">
                  <div className="font-semibold text-[11px]">Sale Products</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSaleItems([{ id: Date.now(), productId: "", quantity: "1", rate: "", amount: "", ptsPerQty: "", totalPts: "" }])} className="text-red-600 flex items-center gap-1 font-semibold text-[11px]"><X className="w-3 h-3"/> Clear Products</button>
                    <button type="button" onClick={() => setSaleItems([...saleItems, { id: Date.now(), productId: "", quantity: "1", rate: "", amount: "", ptsPerQty: "", totalPts: "" }])} className="text-green-600 flex items-center gap-1 font-semibold text-[11px]"><Plus className="w-3 h-3"/> Add Products</button>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="font-normal px-1 py-1 w-12 text-center">Sl.No</th>
                      <th className="font-normal px-1 py-1">Main Product</th>
                      <th className="font-normal px-1 py-1 w-24">Brand</th>
                      <th className="font-normal px-1 py-1 w-20">Unit</th>
                      <th className="font-normal px-1 py-1 w-24">Rate</th>
                      <th className="font-normal px-1 py-1 w-24">Amount</th>
                      <th className="font-normal px-1 py-1 w-24">TotalPts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-200 bg-[#e2e8f0]">
                        <td className="px-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-0.5">
                          <select value={item.productId} onChange={e=>updateSaleItem(item.id, "productId", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5">
                            <option value="">Select...</option>
                            {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-0.5"><input type="text" disabled className="w-full border-none bg-transparent px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="number" min="1" value={item.quantity} onChange={e=>updateSaleItem(item.id, "quantity", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5 text-right"/></td>
                        <td className="px-1 py-0.5"><input type="text" value={item.rate} onChange={e=>updateSaleItem(item.id, "rate", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5 text-right"/></td>
                        <td className="px-1 py-0.5"><input type="text" value={item.amount} onChange={e=>updateSaleItem(item.id, "amount", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5 text-right"/></td>
                        <td className="px-1 py-0.5"><input type="text" value={item.totalPts} onChange={e=>updateSaleItem(item.id, "totalPts", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5 text-right"/></td>
                      </tr>
                    ))}
                    {/* Padding rows */}
                    {Array.from({length: Math.max(0, 5 - saleItems.length)}).map((_, i) => (
                       <tr key={`pad-${i}`} className="border-b border-gray-200 bg-[#e2e8f0] h-6"><td colSpan={7}></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FREE PRODUCTS TAB/GRID */}
              <div className="mt-2 border border-gray-300 bg-white">
                <div className="flex justify-between items-center bg-gray-100 border-b border-gray-300 px-2 py-1">
                  <div className="font-semibold text-[11px]">Free Products</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFreeItems([{ id: Date.now() + 1, productId: "", offerNumber: "", freeProduct: "", freeQty: "" }])} className="text-red-600 flex items-center gap-1 font-semibold text-[11px]"><X className="w-3 h-3"/> Clear Products</button>
                    <button type="button" onClick={() => setFreeItems([...freeItems, { id: Date.now() + 1, productId: "", offerNumber: "", freeProduct: "", freeQty: "" }])} className="text-green-600 flex items-center gap-1 font-semibold text-[11px]"><Plus className="w-3 h-3"/> Add Products</button>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="font-normal px-1 py-1 w-12 text-center">Sl.No</th>
                      <th className="font-normal px-1 py-1">Main Product</th>
                      <th className="font-normal px-1 py-1 w-32">OfferNumber</th>
                      <th className="font-normal px-1 py-1 w-64">Free Product</th>
                      <th className="font-normal px-1 py-1 w-20">FreeUnit</th>
                      <th className="font-normal px-1 py-1 w-12">Edit</th>
                      <th className="font-normal px-1 py-1 w-12">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freeItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-200 bg-[#e2e8f0]">
                        <td className="px-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-0.5">
                          <select value={item.productId} onChange={e=>updateFreeItem(item.id, "productId", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5">
                            <option value="">Select...</option>
                            {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-0.5"><input type="text" value={item.offerNumber} onChange={e=>updateFreeItem(item.id, "offerNumber", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="text" value={item.freeProduct} onChange={e=>updateFreeItem(item.id, "freeProduct", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="number" min="1" value={item.freeQty} onChange={e=>updateFreeItem(item.id, "freeQty", e.target.value)} className="w-full border border-gray-300 bg-white px-1 py-0.5 text-right"/></td>
                        <td className="px-1 text-center text-blue-600 font-bold cursor-pointer">E</td>
                        <td className="px-1 text-center text-red-600 font-bold cursor-pointer" onClick={() => { if(freeItems.length > 1) setFreeItems(freeItems.filter(f=>f.id !== item.id))}}>X</td>
                      </tr>
                    ))}
                     {/* Padding rows */}
                     {Array.from({length: Math.max(0, 3 - freeItems.length)}).map((_, i) => (
                       <tr key={`pad-f-${i}`} className="border-b border-gray-200 bg-[#e2e8f0] h-6"><td colSpan={7}></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY SECTION */}
              <div className="flex gap-4 mt-4 items-end">
                <div className="flex gap-2 mb-1">
                  <div className="flex items-center gap-1"><span className="w-4 h-4 bg-[#c4b5fd] border border-gray-400 block"></span> Combi</div>
                  <div className="flex items-center gap-1"><span className="w-4 h-4 bg-[#86efac] border border-gray-400 block"></span> Free</div>
                </div>

                <div className="flex flex-col space-y-1 w-48 ml-auto">
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Main Unit:</span> <input type="text" readOnly value={mainQtyTotal} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Free Unit:</span> <input type="text" readOnly value={freeQtyTotal} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Total Unit:</span> <input type="text" readOnly value={totalQty} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                </div>

                <div className="flex flex-col space-y-1 w-64">
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Invoice Amt:</span> <input type="text" value={invoiceAmount} onChange={e=>setInvoiceAmount(e.target.value)} className="w-32 border border-gray-400 bg-white px-1 text-right"/></div>
                </div>
                
                <div className="flex flex-col ml-4 mr-4 w-32 justify-end mb-1">
                  <div className="text-center font-bold mb-1">Bal Amount</div>
                  <input type="text" disabled value={invoiceAmount || "0.00"} className="w-full border border-gray-400 bg-white px-1 py-1 h-6 text-right font-bold text-red-600"/>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-4 ml-2">
                <button type="submit" disabled={updateSale.isPending} className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50 flex items-center gap-1">
                  {updateSale.isPending && <Loader2 className="w-3 h-3 animate-spin"/>} Save
                </button>
                <button type="button" onClick={clearForm} className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Clear</button>
                <button type="button" onClick={() => { if(confirm("Are you sure?")) deleteSale.mutate({ id: saleId }) }} className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Delete</button>
                <Link href="/sales" className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50 flex items-center justify-center">Close</Link>
                <button type="button" className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Print</button>
              </div>
            </div>
            </form>
        )}
      </FeatureGate>
    </DashboardLayout>
  );
}
