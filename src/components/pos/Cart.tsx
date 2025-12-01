"use client"

import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, User, ShoppingCart } from "lucide-react"
import Image from "next/image"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Customer {
    id: string
    name: string
    mobile: string
    balance: number
}

export function Cart({ customers }: { customers: any[] }) {
    const router = useRouter()
    const {
        items,
        customer,
        discount,
        transportCharge,
        removeFromCart,
        updateQty,
        setCustomer,
        setDiscount,
        setTransportCharge,
        totalAmount,
        clearCart,
    } = useCartStore()

    const [loading, setLoading] = useState(false)
    const [paymentMode, setPaymentMode] = useState("CASH")

    const handleCheckout = async () => {
        if (items.length === 0) return toast.error("Cart is empty")
        if (paymentMode === "CREDIT" && !customer) return toast.error("Select a customer for credit bill")

        setLoading(true)
        try {
            const res = await fetch("/api/bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: customer?.id,
                    customerName: customer?.name,
                    customerMobile: customer?.mobile,
                    items: items.map((i) => ({
                        productId: i.productId,
                        qty: i.qty,
                        price: i.price,
                    })),
                    discount,
                    transportCharge,
                    paymentMode,
                }),
            })

            if (!res.ok) throw new Error("Checkout failed")

            const data = await res.json()
            toast.success("Bill created successfully")
            clearCart()
            // Open print window
            window.open(`/bills/${data.id}`, "_blank")
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Current Order
                </h2>
                <div className="mt-4">
                    <Select
                        value={customer?.id || "walk-in"}
                        onValueChange={(val) => {
                            if (val === "walk-in") setCustomer(null)
                            else setCustomer(customers.find((c) => c.id === val))
                        }}
                    >
                        <SelectTrigger className="w-full bg-white border-gray-200">
                            <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name} ({c.mobile})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
                        <ShoppingCart className="h-12 w-12" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-primary/20 transition-colors">
                            <div className="h-16 w-16 bg-white rounded-md border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                {item.product?.imageUrl ? (
                                    <Image src={item.product.imageUrl} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1" title={item.name}>{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-destructive transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 p-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-sm hover:bg-gray-100"
                                            onClick={() => updateQty(item.productId, item.qty - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-sm hover:bg-gray-100"
                                            onClick={() => updateQty(item.productId, item.qty + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="font-bold text-sm text-gray-900">
                                        ₹ {(item.price * item.qty).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Discount</label>
                        <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="h-8 bg-white"
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Transport</label>
                        <Input
                            type="number"
                            value={transportCharge}
                            onChange={(e) => setTransportCharge(parseFloat(e.target.value) || 0)}
                            className="h-8 bg-white"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Payment Mode</label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger className="h-9 bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="CREDIT">Credit</SelectItem>
                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-base font-semibold text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹ {totalAmount().toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                        onClick={handleCheckout}
                        disabled={loading || items.length === 0}
                    >
                        {loading ? "Processing..." : "Complete Order"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
