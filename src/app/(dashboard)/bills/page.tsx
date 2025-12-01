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
import { Search, Eye, Trash2, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Bill {
    id: number
    customerName: string
    customerMobile: string
    totalAmount: number
    paymentMode: string
    date: string
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchBills()
    }, [])

    const fetchBills = async () => {
        try {
            const res = await fetch("/api/bills")
            const data = await res.json()
            setBills(data)
        } catch (error) {
            toast.error("Failed to fetch bills")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this bill? Stock will be restored.")) return

        try {
            const res = await fetch(`/api/bills/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Bill deleted successfully")
            fetchBills() // Refresh list
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete bill")
        }
    }

    const filteredBills = bills.filter(
        (bill) =>
            bill.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            bill.id.toString().includes(search)
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-800">Delivery Notes / Bills</h2>
                    <p className="text-muted-foreground">Manage and view all generated bills.</p>
                </div>
                <Link href="/pos">
                    <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> New Bill
                    </Button>
                </Link>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold text-gray-600">Bill #</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Customer</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Payment</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-600">Amount</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Loading bills...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBills.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No bills found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBills.map((bill) => (
                                        <TableRow key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium text-primary">#{bill.id}</TableCell>
                                            <TableCell className="text-gray-600">
                                                {format(new Date(bill.date), "dd MMM yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-800">{bill.customerName || "Walk-in Customer"}</div>
                                                <div className="text-xs text-gray-500">{bill.customerMobile}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    bill.paymentMode === "CASH" && "bg-green-100 text-green-700",
                                                    bill.paymentMode === "CREDIT" && "bg-orange-100 text-orange-700",
                                                    bill.paymentMode === "UPI" && "bg-blue-100 text-blue-700",
                                                    bill.paymentMode === "BANK" && "bg-purple-100 text-purple-700",
                                                )}>
                                                    {bill.paymentMode}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-800">
                                                ₹ {bill.totalAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/bills/${bill.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/bills/${bill.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(bill.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
