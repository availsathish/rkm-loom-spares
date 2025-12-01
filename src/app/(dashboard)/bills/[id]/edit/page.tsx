"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Customer {
    id: string
    name: string
    mobile: string
}

interface Bill {
    id: number
    customerId: string | null
    customerName: string
    paymentMode: string
    date: string
    totalAmount: number
}

export default function EditBillPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [bill, setBill] = useState<Bill | null>(null)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        customerId: "",
        paymentMode: "",
        date: "",
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [billRes, customersRes] = await Promise.all([
                fetch(`/api/bills/${id}`), // We need a GET endpoint for single bill
                fetch("/api/customers"),
            ])

            if (!billRes.ok) throw new Error("Failed to fetch bill")

            const billData = await billRes.json()
            const customersData = await customersRes.json()

            setBill(billData)
            setCustomers(customersData)
            setFormData({
                customerId: billData.customerId || "walk-in",
                paymentMode: billData.paymentMode,
                date: format(new Date(billData.date), "yyyy-MM-dd"),
            })
        } catch (error) {
            toast.error("Failed to load data")
            router.push("/bills")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch(`/api/bills/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: formData.customerId === "walk-in" ? null : formData.customerId,
                    paymentMode: formData.paymentMode,
                    date: formData.date,
                }),
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success("Bill updated successfully")
            router.push("/bills")
            router.refresh()
        } catch (error) {
            toast.error("Failed to update bill")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!bill) return <div className="p-8 text-center">Bill not found</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/bills">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Edit Bill #{bill.id}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select
                                value={formData.customerId}
                                onValueChange={(val) => setFormData({ ...formData, customerId: val })}
                            >
                                <SelectTrigger>
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

                        <div className="space-y-2">
                            <Label>Payment Mode</Label>
                            <Select
                                value={formData.paymentMode}
                                onValueChange={(val) => setFormData({ ...formData, paymentMode: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CREDIT">Credit</SelectItem>
                                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button type="submit" disabled={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Link href="/bills">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Note:</strong> To edit items (products, quantities, prices), please delete this bill and create a new one.
                This ensures stock levels remain accurate.
            </div>
        </div>
    )
}
