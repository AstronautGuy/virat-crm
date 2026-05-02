"use client";

import { DashboardLayout } from "../../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewSale() {
  const router = useRouter();
  
  const [branchId, setBranchId] = useState("1");
  const [pincode, setPincode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  
  const [items, setItems] = useState([{ id: Date.now(), productId: "1", quantity: "1", isFree: false }]);

  // Pincode Auto-fill Effect
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  useEffect(() => {
    if (pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode)) {
      const fetchDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            if (postOffice) {
              setCity(postOffice.District || "");
              setState(postOffice.State || "");
              setArea(postOffice.Name || "");
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
    onSuccess: () => {
      router.push("/sales");
      router.refresh();
    },
    onError: (error) => {
      alert(`Error creating sale: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSale({
      branchId: parseInt(branchId),
      pincode: pincode === "" ? undefined : pincode,
      addressLine1: addressLine1 === "" ? undefined : addressLine1,
      landmark: landmark === "" ? undefined : landmark,
      area: area === "" ? undefined : area,
      city: city === "" ? undefined : city,
      state: state === "" ? undefined : state,
      customerName: customerName === "" ? undefined : customerName,
      customerAddress: customerAddress === "" ? undefined : customerAddress,
      invoiceAmount: invoiceAmount === "" ? undefined : invoiceAmount,
      advancePaymentAmount: advancePaymentAmount === "" ? undefined : advancePaymentAmount,
      receivedAmount: receivedAmount === "" ? undefined : receivedAmount,
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        isFree: item.isFree
      }))
    });
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: "1", quantity: "1", isFree: false }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link href="/sales">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Log Sale</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Customer & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="branchId" className="text-xs">Branch ID</Label>
                  <Input id="branchId" value={branchId} onChange={e => setBranchId(e.target.value)} required type="number" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pincode" className="text-xs flex items-center justify-between">
                    Pincode
                    {isFetchingPincode && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </Label>
                  <Input id="pincode" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 110001" maxLength={6} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs">State</Label>
                  <Input id="state" value={state} onChange={e => setState(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="area" className="text-xs">Area / Post Office</Label>
                <Input id="area" value={area} onChange={e => setArea(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="addressLine1" className="text-xs">Address Line 1</Label>
                <Input id="addressLine1" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="House No, Street, etc." />
              </div>

              <div className="space-y-1">
                <Label htmlFor="landmark" className="text-xs">Landmark</Label>
                <Input id="landmark" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Near XYZ..." />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-xs">Customer Name</Label>
                <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Products</CardTitle>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-end border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Product ID</Label>
                    <Input value={item.productId} onChange={e => updateItem(item.id, "productId", e.target.value)} type="number" required />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input value={item.quantity} onChange={e => updateItem(item.id, "quantity", e.target.value)} type="number" min="1" required />
                  </div>
                  <div className="flex items-center space-x-2 h-10 px-2 border rounded-md">
                    <input 
                      type="checkbox" 
                      id={`free-${item.id}`} 
                      checked={item.isFree}
                      onChange={e => updateItem(item.id, "isFree", e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor={`free-${item.id}`} className="text-xs cursor-pointer">Free</label>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Financials (₹)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="invoiceAmount" className="text-xs">Invoice Amount</Label>
                <Input id="invoiceAmount" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} type="number" step="0.01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="advancePaymentAmount" className="text-xs">Advance Amount</Label>
                  <Input id="advancePaymentAmount" value={advancePaymentAmount} onChange={e => setAdvancePaymentAmount(e.target.value)} type="number" step="0.01" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="receivedAmount" className="text-xs">Received Today</Label>
                  <Input id="receivedAmount" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} type="number" step="0.01" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log Sale
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
