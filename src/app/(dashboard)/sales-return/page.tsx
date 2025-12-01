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
import { Plus, Search, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface SalesReturn {
    id: number
    date: string
    billId: number
    customer: { name: string } | null
    totalAmount: number
}

export default function SalesReturnPage() {
    const [returns, setReturns] = useState<SalesReturn[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetch("/api/sales-return")
            .then(res => res.json())
            .then(data => setReturns(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const filteredReturns = returns.filter(r =>
        r.id.toString().includes(search) ||
        r.billId?.toString().includes(search) ||
        r.customer?.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Returns</h1>
                    <p className="text-muted-foreground">Manage product returns and refunds.</p>
                </div>
                <Link href="/sales-return/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Return
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search returns..."
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
                            <TableHead>Return ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Bill Ref</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredReturns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No returns found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredReturns.map((ret) => (
                                <TableRow key={ret.id}>
                                    <TableCell className="font-medium">#{ret.id}</TableCell>
                                    <TableCell>{format(new Date(ret.date), "dd MMM yyyy")}</TableCell>
                                    <TableCell>
                                        {ret.billId ? (
                                            <Link href={`/bills/${ret.billId}`} className="text-primary hover:underline">
                                                Bill #{ret.billId}
                                            </Link>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>{ret.customer?.name || "Walk-in"}</TableCell>
                                    <TableCell className="text-right font-bold text-destructive">
                                        ₹ {ret.totalAmount.toFixed(2)}
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
