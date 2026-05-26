"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PageWrapper } from "@/app/_components/layout/PageWrapper";

export default function EditSale() {
  const router = useRouter();
  const params = useParams();
  const saleId = parseInt(params.id as string);

  const { data: sale, isLoading: isFetchingSale } = api.sales.getSale.useQuery({ id: saleId }, { enabled: !!saleId });
  const { data: products = [] } = api.inventory.getProducts.useQuery();

  const [success, setSuccess] = useState(false);
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

  const pendingAmount =
    parseFloat(invoiceAmount || "0") - parseFloat(advancePaymentAmount || "0");

  const [items, setItems] = useState<
    { id: number; productId: string; quantity: string; isFree: boolean }[]
  >([]);

  useEffect(() => {
    if (sale) {
      setPincode(sale.pincode ?? "");
      setAddressLine1(sale.addressLine1 ?? "");
      setLandmark(sale.landmark ?? "");
      setArea(sale.area ?? "");
      setCity(sale.city ?? "");
      setState(sale.state ?? "");
      setCustomerName(sale.customerName ?? "");
      setCustomerAddress(sale.customerAddress ?? "");
      setInvoiceAmount(sale.invoiceAmount ?? "");
      setAdvancePaymentAmount(sale.advancePaymentAmount ?? "");
      
      if (sale.items) {
        setItems(sale.items.map((item, idx) => ({
          id: item.id ?? idx,
          productId: item.productId.toString(),
          quantity: item.quantity.toString(),
          isFree: item.isFree ?? false,
        })));
      }
    }
  }, [sale]);

  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  useEffect(() => {
    if (pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode) && sale && pincode !== sale.pincode) {
      const fetchDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = (await res.json()) as any[];
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
  }, [pincode, sale]);

  const { mutate: updateSale, isPending } = api.sales.updateSale.useMutation({
    onSuccess: () => {
      setSuccess(true);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation
    const missingItems = items.some((item) => !item.productId || !item.quantity);
    if (missingItems) {
      toast.error("Please select a product and quantity for all items");
      return;
    }
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      toast.error("Invalid Pincode format. Must be 6 digits.");
      return;
    }
    if (invoiceAmount && parseFloat(invoiceAmount) < 0) {
      toast.error("Invoice Amount cannot be negative");
      return;
    }
    
    updateSale({
      id: saleId,
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
      receivedAmount: "0",
      items: items.map((item) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        isFree: item.isFree,
      })),
    });
  };

  const addItem = () => setItems([...items, { id: Date.now(), productId: "", quantity: "1", isFree: false }]);
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
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="sales">
        <PageWrapper isLoading={isFetchingSale}>
          <div className="mx-auto flex max-w-2xl flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Link href="/sales">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold tracking-tight">Edit Sale</h1>
            </div>

            {success ? (
              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 inline-flex rounded-full p-3 bg-primary/20">
                      <CheckCircle className="text-primary h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold">Sale Updated Successfully!</h2>
                  </CardContent>
                </Card>
                <div className="flex justify-center">
                  <Link href="/sales">
                    <Button className="px-8">Return to Sales</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-semibold uppercase">Customer & Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="pincode" className="flex items-center justify-between text-xs">
                          Pincode
                          {isFetchingPincode && <Loader2 className="text-primary h-3 w-3 animate-spin" />}
                        </Label>
                        <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="city" className="text-xs">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="state" className="text-xs">State</Label>
                        <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="area" className="text-xs">Area / Post Office</Label>
                        <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="addressLine1" className="text-xs">Address Line 1</Label>
                      <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="landmark" className="text-xs">Landmark</Label>
                      <Input id="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="text-xs">Customer Name</Label>
                      <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-semibold uppercase">Products</CardTitle>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
                      <Plus className="mr-1 h-3 w-3" /> Add Item
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-end gap-2 border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Product <span className="text-destructive">*</span></Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !item.productId && "text-muted-foreground"
                                )}
                              >
                                {item.productId
                                  ? products.find((p) => p.id.toString() === item.productId)?.name
                                  : "Select product..."}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search product..." />
                                <CommandList>
                                  <CommandEmpty>No product found.</CommandEmpty>
                                  <CommandGroup>
                                    {products.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={product.name}
                                        onSelect={() => updateItem(item.id, "productId", product.id.toString())}
                                      >
                                        {product.name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            item.productId === product.id.toString() ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Qty <span className="text-destructive">*</span></Label>
                          <Input value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} type="number" min="1" />
                        </div>
                        <div className="flex h-10 items-center space-x-2 rounded-md border px-2">
                          <input type="checkbox" id={`free-${item.id}`} checked={item.isFree} onChange={(e) => updateItem(item.id, "isFree", e.target.checked)} className="accent-primary h-4 w-4" />
                          <label htmlFor={`free-${item.id}`} className="cursor-pointer text-xs">Free</label>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-semibold uppercase">Financials (₹)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="invoiceAmount" className="text-xs">Invoice Amount</Label>
                      <Input id="invoiceAmount" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} type="number" step="0.01" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="advancePaymentAmount" className="text-xs">Advance Amount</Label>
                        <Input 
                          id="advancePaymentAmount" 
                          value={advancePaymentAmount} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (parseFloat(val) > parseFloat(invoiceAmount || "0")) return;
                            setAdvancePaymentAmount(val);
                          }} 
                          type="number" step="0.01" 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pendingAmount" className="text-xs text-muted-foreground">Pending Amount</Label>
                        <Input 
                          id="pendingAmount" 
                          value={pendingAmount > 0 ? pendingAmount : 0} 
                          readOnly 
                          disabled 
                          type="number" 
                          className="bg-muted/50" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Sale
                </Button>
              </form>
            )}
          </div>
        </PageWrapper>
      </FeatureGate>
    </DashboardLayout>
  );
}
