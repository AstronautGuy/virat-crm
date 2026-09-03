"use client";
import { env } from "@/env";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { DashboardLayout } from "../../_components/layout/DashboardLayout";
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

export default function NewReplacement() {
  const router = useRouter();

  const [branchId, setBranchId] = useState("");
  const [success, setSuccess] = useState(false);
  const [newReplacementId, setNewReplacementId] = useState<number | null>(null);
  
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [invDate, setInvDate] = useState("");
  
  const [cmrId, setCmrId] = useState("");
  const [tmNo, setTmNo] = useState("");
  const [docMonth, setDocMonth] = useState("");
  
  const [replacementType, setReplacementType] = useState("First Replacement");
  const [reason, setReason] = useState("");

  const [originalSaleId, setOriginalSaleId] = useState<number | null>(null);
  
  useEffect(() => {
    setDocMonth(new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-'));
  }, []);

  const [userIds, setUserIds] = useState<string[]>([]);
  const [managerIds, setManagerIds] = useState<string[]>([]);

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
  
  const { data: customers = [] } = api.crm.getBranchCustomers.useQuery();
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

  const { data: fetchedSale, isLoading: isFetchingSale } = api.sales.getSaleByOrderNumber.useQuery(
    { orderNumber },
    { enabled: orderNumber.length > 3 } // Only fetch when there's some input
  );

  useEffect(() => {
    if (fetchedSale) {
      setOriginalSaleId(fetchedSale.id);
      setBranchId(fetchedSale.branchId?.toString() || "");
      setTransactionNumber(fetchedSale.transactionNumber || "");
      if (fetchedSale.orderDate) setOrderDate(new Date(fetchedSale.orderDate as any).toISOString().split("T")[0]);
      if (fetchedSale.invoiceDate) setInvDate(new Date(fetchedSale.invoiceDate as any).toISOString().split("T")[0]);
      setCmrId(fetchedSale.cmrId || "");
      setTmNo(fetchedSale.tmNo || "");
      setCustomerName(fetchedSale.customerName || "");
      setHouseNo(fetchedSale.customerAddress || "");
      setPin(fetchedSale.pincode || "");
      setMandal(fetchedSale.area || "");
      setDistrict(fetchedSale.city || "");
      setState(fetchedSale.state || "");
      setLandMark(fetchedSale.landmark || "");

      if (fetchedSale.assignments) {
        setUserIds(fetchedSale.assignments.filter((a: any) => a.role === "Ecode").map((a: any) => a.userId));
        setManagerIds(fetchedSale.assignments.filter((a: any) => a.role === "FieldSupport").map((a: any) => a.userId));
      }

      if (fetchedSale.items) {
         const mainItems = fetchedSale.items.filter(i => !i.isFree).map((item, idx) => ({
           id: idx,
           productId: item.productId.toString(),
           originalQuantity: item.quantity,
           quantity: "0",
           rate: item.rate || "0",
           amount: "0",
           ptsPerQty: item.ptsPerQty || "0",
           totalPts: "0",
         }));
         
         const free = fetchedSale.items.filter(i => i.isFree).map((item, idx) => ({
           id: idx + 1000,
           productId: item.productId.toString(),
           originalQuantity: item.quantity,
           freeQty: "0",
           offerNumber: item.offerNumber || "",
           freeProduct: "", 
         }));

         setSaleItems(mainItems.length > 0 ? mainItems : [{ id: Date.now(), productId: "", originalQuantity: 0, quantity: "0", rate: "", amount: "", ptsPerQty: "", totalPts: "" }]);
         setFreeItems(free.length > 0 ? free : [{ id: Date.now() + 1, productId: "", originalQuantity: 0, offerNumber: "", freeProduct: "", freeQty: "0" }]);
      }
    }
  }, [fetchedSale]);


  // Product grids
  const [saleItems, setSaleItems] = useState([
    { id: Date.now(), productId: "", originalQuantity: 0, quantity: "0", rate: "", amount: "", ptsPerQty: "", totalPts: "" },
  ]);

  const [freeItems, setFreeItems] = useState([
    { id: Date.now() + 1, productId: "", originalQuantity: 0, offerNumber: "", freeProduct: "", freeQty: "0" },
  ]);

  const [invoiceAmount, setInvoiceAmount] = useState("");
  
  useEffect(() => {
    const total = saleItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    setInvoiceAmount(total > 0 ? total.toFixed(2) : "");
  }, [saleItems]);

  const createReplacement = api.replacements.createReplacement.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSuccess(true);
        setNewReplacementId(data.id);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalSaleId) {
      toast.error("Please enter a valid Order No to fetch original sale");
      return;
    }
    
    // Combine items
    const validSaleItems = saleItems.filter(i => i.productId && parseInt(i.quantity) > 0).map(i => ({
      productId: parseInt(i.productId),
      quantity: parseInt(i.quantity),
    }));

    const validFreeItems = freeItems.filter(i => i.productId && parseInt(i.freeQty) > 0).map(i => ({
      productId: parseInt(i.productId), 
      quantity: parseInt(i.freeQty),
    }));

    const allItems = [...validSaleItems, ...validFreeItems];

    if (allItems.length === 0) {
      toast.error("Please specify a replacement quantity for at least one product.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    createReplacement.mutate({
      originalSaleId,
      reason,
      replacementType,
      items: allItems,
    });
  };

  const mainQtyTotal = saleItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  const freeQtyTotal = freeItems.reduce((acc, item) => acc + (parseInt(item.freeQty) || 0), 0);
  const totalQty = mainQtyTotal + freeQtyTotal;

  const clearForm = () => {
    setOrderNumber("");
    setOriginalSaleId(null);
    setBranchId("");
    setOrderDate("");
    setTransactionNumber("");
    setInvDate("");
    setCmrId("");
    setTmNo("");
    setUserIds([]);
    setManagerIds([]);
    setCustomerId("");
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
    setReason("");
    setSaleItems([{ id: Date.now(), productId: "", originalQuantity: 0, quantity: "0", rate: "", amount: "", ptsPerQty: "", totalPts: "" }]);
    setFreeItems([{ id: Date.now() + 1, productId: "", originalQuantity: 0, offerNumber: "", freeProduct: "", freeQty: "0" }]);
    setInvoiceAmount("");
  };

  const updateSaleItem = (id: number, field: string, value: string) => {
    setSaleItems(saleItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      if (field === "quantity") {
        if (parseInt(value) > item.originalQuantity) {
          toast.error("Cannot replace more than originally sold.");
          updated.quantity = item.originalQuantity.toString();
        }
      }
      
      const qty = parseFloat(updated.quantity) || 0;
      const rate = parseFloat(updated.rate) || 0;
      const pts = parseFloat(updated.ptsPerQty) || 0;
      
      if (field === "quantity" || field === "rate" || field === "productId") {
        updated.amount = (qty * rate).toFixed(2);
      }
      if (field === "quantity" || field === "ptsPerQty" || field === "productId") {
        updated.totalPts = (qty * pts).toFixed(2);
      }
      
      return updated;
    }));
  };
  const updateFreeItem = (id: number, field: string, value: string) => {
    setFreeItems(freeItems.map((item) => {
       if (item.id !== id) return item;
       const updated = { ...item, [field]: value };
       if (field === "freeQty" && parseInt(value) > item.originalQuantity) {
         toast.error("Cannot replace more than originally sold.");
         updated.freeQty = item.originalQuantity.toString();
       }
       return updated;
    }));
  };

  const parsedInvoice = parseFloat(invoiceAmount) || 0;
  const balanceAmount = parsedInvoice.toFixed(2);

  return (
    <DashboardLayout>
      <FeatureGate featureKey="sales">
        {success && newReplacementId ? (
          <div className="mx-auto flex max-w-4xl flex-col space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 inline-flex rounded-full p-3 bg-primary/20">
                  <CheckCircle className="text-primary h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold">Replacement Logged Successfully!</h2>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-muted-foreground text-sm font-semibold uppercase">Upload Invoice / Documents</CardTitle></CardHeader>
              <CardContent>
                <FileUploader entityType="replacement" entityId={newReplacementId} maxFiles={3} onUploadComplete={() => undefined} />
                <div className="mt-6 flex justify-center">
                  <Link href="/replacements"><Button variant="outline">Skip & Finish</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-[1200px] border-2 border-slate-300 shadow bg-[#cde8e8] text-xs pb-4 font-sans">
            <div className="flex justify-between items-center bg-white px-2 py-1 border-b-2 border-slate-300">
              <div className="font-bold text-sm">Replacement Register</div>
              <div className="flex gap-4 items-center">
                <Link href="/replacements" className="flex items-center text-red-600 font-bold hover:underline"><X className="w-4 h-4 mr-1"/> Close</Link>
              </div>
            </div>

            <div className="p-2 space-y-2">
              {/* TOP METADATA BLOCK */}
              <div className="grid grid-cols-12 gap-x-2 gap-y-1">
                <div className="col-span-1 text-right mt-1">Company</div>
                <div className="col-span-4">
                  <input type="text" value="SHIVASHAKTI AGRITEC LIMITED" readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-right mt-1">Tax Inv No</div>
                <div className="col-span-2">
                  <input type="text" readOnly value={transactionNumber} className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-3"></div>

                <div className="col-span-1 text-right mt-1">Branch</div>
                <div className="col-span-4">
                  <select value={branchId} disabled className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs">
                    <option value="">Select Branch</option>
                    {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 text-right mt-1">DocMonth</div>
                <div className="col-span-1">
                  <input type="text" value={docMonth} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">CMR ID</div>
                <div className="col-span-2">
                  <input type="text" value={cmrId} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-1 text-right mt-1 font-bold text-red-600">Order No *</div>
                <div className="col-span-2 relative">
                  <input type="text" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder="Type Order No..." className="w-full border border-blue-500 px-1 py-0.5 bg-white text-xs font-bold"/>
                  {isFetchingSale && <Loader2 className="absolute right-1 top-1 w-3 h-3 animate-spin text-gray-500"/>}
                </div>
                <div className="col-span-1 text-right mt-1">Order Date</div>
                <div className="col-span-1">
                  <input type="date" value={orderDate} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Ecode</div>
                <div className="col-span-4 pointer-events-none opacity-80">
                  <MultiSelectInput options={allUsersOptions} selectedIds={userIds} onChange={()=>{}} placeholder="Auto-populated..." />
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-1 text-right mt-1">Tm No</div>
                <div className="col-span-2">
                  <input type="text" value={tmNo} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Inv Date</div>
                <div className="col-span-1">
                  <input type="date" value={invDate} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1 whitespace-nowrap">Field SupP By</div>
                <div className="col-span-4 pointer-events-none opacity-80">
                  <MultiSelectInput options={managerOptions} selectedIds={managerIds} onChange={()=>{}} placeholder="Auto-populated..." />
                </div>
                <div className="col-span-2"></div>
              </div>

              {/* REPLACEMENT TYPE RADIO BUTTONS */}
              <div className="flex gap-12 ml-16 py-2 border-y border-gray-300 my-2">
                <label className="flex items-center gap-1 font-bold">
                  <input type="radio" className="w-3 h-3" name="replacementType" checked={replacementType === "First Replacement"} onChange={() => setReplacementType("First Replacement")} />
                  First Replacement
                </label>
                <label className="flex items-center gap-1 font-bold">
                  <input type="radio" className="w-3 h-3" name="replacementType" checked={replacementType === "Second Replacement"} onChange={() => setReplacementType("Second Replacement")} />
                  Second Replacement
                </label>
              </div>

              {/* CUSTOMER SECTION */}
              <div className="grid grid-cols-12 gap-x-2 gap-y-1 opacity-90 pointer-events-none">
                <div className="col-span-2 text-right mt-1">Village Search</div>
                <div className="col-span-2 flex">
                  <input type="text" value={villageSearch} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                  <button type="button" className="bg-emerald-600 px-1.5 border border-gray-600 text-white"><Search className="w-3 h-3"/></button>
                </div>
                <div className="col-span-1 text-right mt-1 whitespace-nowrap">Customer Name</div>
                <div className="col-span-5">
                  <input type="text" value={customerName} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs" />
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">Village</div>
                <div className="col-span-2">
                  <input type="text" value={village} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">
                  <select disabled className="border border-gray-400 text-xs py-0.5"><option>S/O</option><option>W/O</option><option>D/O</option></select>
                </div>
                <div className="col-span-5">
                  <input type="text" value={so} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">Mandal/Tahsil</div>
                <div className="col-span-2">
                  <input type="text" value={mandal} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">House No</div>
                <div className="col-span-2">
                  <input type="text" value={houseNo} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Land Mark</div>
                <div className="col-span-2">
                  <input type="text" value={landMark} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">District</div>
                <div className="col-span-2">
                  <input type="text" value={district} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Mobile No</div>
                <div className="col-span-2">
                  <input type="text" value={mobileNo} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Land Line No</div>
                <div className="col-span-2">
                  <input type="text" value={landLineNo} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-2"></div>

                <div className="col-span-2 text-right mt-1">State</div>
                <div className="col-span-1 flex gap-1 items-center">
                  <input type="text" value={state} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                  <span>Pin</span>
                </div>
                <div className="col-span-1">
                  <input type="text" value={pin} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">DOB / Age</div>
                <div className="col-span-2">
                  <input type="date" value={dob} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-1 text-right mt-1">Marriage Date</div>
                <div className="col-span-2">
                  <input type="date" value={marriageDate} readOnly className="w-full border border-gray-400 px-1 py-0.5 bg-gray-200 text-xs"/>
                </div>
                <div className="col-span-2"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-x-2 gap-y-1 mt-2">
                 <div className="col-span-2 text-right mt-1 font-bold text-red-600">Reason *</div>
                 <div className="col-span-10">
                   <input type="text" placeholder="Reason for replacement" value={reason} onChange={e=>setReason(e.target.value)} className="w-full border border-blue-400 px-1 py-1 bg-white text-xs"/>
                 </div>
              </div>

              {/* SALE PRODUCTS TAB/GRID */}
              <div className="mt-2 border border-gray-300 bg-white">
                <div className="flex justify-between items-center bg-gray-100 border-b border-gray-300 px-2 py-1">
                  <div className="font-semibold text-[11px]">Replacement Products (Adjust Quantities)</div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="font-normal px-1 py-1 w-12 text-center">Sl.No</th>
                      <th className="font-normal px-1 py-1">Main Product (Original)</th>
                      <th className="font-normal px-1 py-1 w-24">Brand</th>
                      <th className="font-normal px-1 py-1 w-20 text-red-600 font-bold">Replace Qty</th>
                      <th className="font-normal px-1 py-1 w-24 text-gray-500">Original Qty</th>
                      <th className="font-normal px-1 py-1 w-24">Rate</th>
                      <th className="font-normal px-1 py-1 w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-200 bg-[#e2e8f0]">
                        <td className="px-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-0.5">
                          <select value={item.productId} disabled className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5">
                            <option value="">Select...</option>
                            {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-0.5"><input type="text" disabled className="w-full border-none bg-transparent px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="number" min="0" max={item.originalQuantity} value={item.quantity} onChange={e=>updateSaleItem(item.id, "quantity", e.target.value)} className="w-full border-2 border-red-400 bg-white px-1 py-0.5 text-right font-bold"/></td>
                        <td className="px-1 py-0.5 text-center text-gray-500 text-[10px]">{item.originalQuantity}</td>
                        <td className="px-1 py-0.5"><input type="text" readOnly value={item.rate} className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5 text-right"/></td>
                        <td className="px-1 py-0.5"><input type="text" readOnly value={item.amount} className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5 text-right"/></td>
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
                  <div className="font-semibold text-[11px]">Free Products (Adjust Quantities)</div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="font-normal px-1 py-1 w-12 text-center">Sl.No</th>
                      <th className="font-normal px-1 py-1">Main Product</th>
                      <th className="font-normal px-1 py-1 w-32">OfferNumber</th>
                      <th className="font-normal px-1 py-1 w-64">Free Product</th>
                      <th className="font-normal px-1 py-1 w-24 text-red-600 font-bold">Replace Qty</th>
                      <th className="font-normal px-1 py-1 w-24 text-gray-500">Original Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freeItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-200 bg-[#e2e8f0]">
                        <td className="px-1 text-center">{idx + 1}</td>
                        <td className="px-1 py-0.5">
                          <select value={item.productId} disabled className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5">
                            <option value="">Select...</option>
                            {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-0.5"><input type="text" readOnly value={item.offerNumber} className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="text" readOnly value={item.freeProduct} className="w-full border border-gray-300 bg-gray-200 px-1 py-0.5"/></td>
                        <td className="px-1 py-0.5"><input type="number" min="0" max={item.originalQuantity} value={item.freeQty} onChange={e=>updateFreeItem(item.id, "freeQty", e.target.value)} className="w-full border-2 border-red-400 bg-white px-1 py-0.5 text-right font-bold"/></td>
                        <td className="px-1 py-0.5 text-center text-gray-500 text-[10px]">{item.originalQuantity}</td>
                      </tr>
                    ))}
                     {/* Padding rows */}
                     {Array.from({length: Math.max(0, 3 - freeItems.length)}).map((_, i) => (
                       <tr key={`pad-f-${i}`} className="border-b border-gray-200 bg-[#e2e8f0] h-6"><td colSpan={6}></td></tr>
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
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Rep Unit:</span> <input type="text" readOnly value={mainQtyTotal} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Free Rep:</span> <input type="text" readOnly value={freeQtyTotal} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Total Rep:</span> <input type="text" readOnly value={totalQty} className="w-24 border border-gray-400 bg-gray-100 px-1 text-right font-semibold"/></div>
                </div>

                <div className="flex flex-col space-y-1 w-64">
                  <div className="flex justify-between items-center"><span className="text-right flex-1 mr-2">Rep Amt:</span> <input type="text" value={invoiceAmount} readOnly className="w-32 border border-gray-400 bg-gray-100 px-1 font-semibold text-right"/></div>
                </div>
                
                <div className="flex flex-col ml-4 mr-4 w-32 justify-end mb-1">
                  <div className="text-center font-bold mb-1">Bal Amount</div>
                  <input type="text" value={balanceAmount} readOnly className="w-full border border-gray-400 bg-gray-100 px-1 py-1 h-6 text-right font-bold text-red-600"/>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-4 ml-2">
                <button type="submit" disabled={createReplacement.isPending} className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50 flex items-center gap-1">
                  {createReplacement.isPending && <Loader2 className="w-3 h-3 animate-spin"/>} Save
                </button>
                <button type="button" onClick={clearForm} className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Clear</button>
                <button type="button" className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Delete</button>
                <Link href="/replacements" className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50 flex items-center justify-center">Close</Link>
                <button type="button" className="bg-white border border-gray-400 px-6 py-1 hover:bg-gray-50">Print</button>
              </div>
            </div>
            </form>
        )}
      </FeatureGate>
    </DashboardLayout>
  );
}
