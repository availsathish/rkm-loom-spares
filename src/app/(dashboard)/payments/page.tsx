"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Search, IndianRupee } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

interface Payment {
    id: string
    date: string
    customer: { name: string; mobile: string }
    amount: number
    mode: string
    notes: string
}

interface Customer {
    id: string
    name: string
    mobile: string
    balance: number
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState({
        customerId: "",
        amount: "",
        mode: "CASH",
        notes: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [paymentsRes, customersRes] = await Promise.all([
                fetch("/api/payments"),
                fetch("/api/customers")
            ])

            if (paymentsRes.ok) setPayments(await paymentsRes.json())
            if (customersRes.ok) setCustomers(await customersRes.json())
        } catch (error) {
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customerId || !formData.amount) return toast.error("Please fill required fields")

        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: formData.customerId,
                    amount: parseFloat(formData.amount),
                    mode: formData.mode,
                    notes: formData.notes
                })
            })

            if (!res.ok) throw new Error("Failed to save payment")

            toast.success("Payment recorded successfully")
            setIsAddOpen(false)
            setFormData({ customerId: "", amount: "", mode: "CASH", notes: "" })
            fetchData() // Reload data
            router.refresh()
        } catch (error) {
            toast.error("Failed to record payment")
        }
    }

    const filteredPayments = payments.filter(p =>
        p.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        p.notes?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payments (In)</h1>
                    <p className="text-muted-foreground">Record payments received from customers.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Record Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Payment Received</DialogTitle>
                        </DialogHeader>
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
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} (Bal: ₹{c.balance})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Mode</Label>
                                <Select
                                    value={formData.mode}
                                    onValueChange={(val) => setFormData({ ...formData, mode: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional notes..."
                                />
                            </div>
                            <Button type="submit" className="w-full">Save Payment</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search payments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Mode</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No payments found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(new Date(payment.date), "dd MMM yyyy")}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{payment.customer.name}</div>
                                        <div className="text-xs text-muted-foreground">{payment.customer.mobile}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            {payment.mode}
                                        </span>
                                    </TableCell>
                                    <TableCell>{payment.notes || "-"}</TableCell>
                                    <TableCell className="text-right font-bold text-green-600">
                                        ₹ {payment.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
