"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface BillItem {
    id: string
    productId: string
    product: { name: string; code: string }
    qty: number
    price: number
}

interface Bill {
    id: number
    customer: { id: string; name: string } | null
    items: BillItem[]
}

export default function NewSalesReturnPage() {
    const [billId, setBillId] = useState("")
    const [bill, setBill] = useState<Bill | null>(null)
    const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({}) // productId -> qty
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const fetchBill = async () => {
        if (!billId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/bills/${billId}`)
            if (!res.ok) throw new Error("Bill not found")
            const data = await res.json()
            setBill(data)
            setReturnItems({})
        } catch (error) {
            toast.error("Bill not found")
            setBill(null)
        } finally {
            setLoading(false)
        }
    }

    const handleQtyChange = (productId: string, maxQty: number, val: string) => {
        const qty = parseInt(val) || 0
        if (qty < 0) return
        if (qty > maxQty) {
            toast.error(`Cannot return more than purchased (${maxQty})`)
            return
        }
        setReturnItems(prev => ({ ...prev, [productId]: qty }))
    }

    const calculateTotal = () => {
        if (!bill) return 0
        return bill.items.reduce((sum, item) => {
            const qty = returnItems[item.productId] || 0
            return sum + (qty * item.price)
        }, 0)
    }

    const handleSubmit = async () => {
        if (!bill) return
        const itemsToReturn = Object.entries(returnItems)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => {
                const item = bill.items.find(i => i.productId === productId)
                return {
                    productId,
                    qty,
                    price: item?.price || 0
                }
            })

        if (itemsToReturn.length === 0) return toast.error("No items selected for return")

        setLoading(true)
        try {
            const res = await fetch("/api/sales-return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    billId: bill.id,
                    customerId: bill.customer?.id,
                    items: itemsToReturn
                })
            })

            if (!res.ok) throw new Error("Failed to create return")

            toast.success("Sales return processed")
            router.push("/sales-return")
        } catch (error) {
            toast.error("Failed to process return")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/sales-return">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">New Sales Return</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Find Bill</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Bill ID (e.g. 1001)"
                            value={billId}
                            onChange={(e) => setBillId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchBill()}
                        />
                        <Button onClick={fetchBill} disabled={loading}>
                            <Search className="mr-2 h-4 w-4" /> Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {bill && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bill #{bill.id} - Items</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Customer: {bill.customer?.name || "Walk-in"}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Purchased Qty</TableHead>
                                    <TableHead>Return Qty</TableHead>
                                    <TableHead className="text-right">Refund Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bill.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.product.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.product.code}</div>
                                        </TableCell>
                                        <TableCell>₹ {item.price}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24 h-8"
                                                min="0"
                                                max={item.qty}
                                                value={returnItems[item.productId] || ""}
                                                onChange={(e) => handleQtyChange(item.productId, item.qty, e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₹ {((returnItems[item.productId] || 0) * item.price).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-lg font-semibold">
                                Total Refund: <span className="text-destructive">₹ {calculateTotal().toFixed(2)}</span>
                            </div>
                            <Button onClick={handleSubmit} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                                <Save className="mr-2 h-4 w-4" /> Process Return
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
