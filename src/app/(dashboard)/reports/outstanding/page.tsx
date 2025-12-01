import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function OutstandingReportPage() {
    const customers = await prisma.customer.findMany({
        where: {
            balance: {
                gt: 0,
            },
        },
        orderBy: {
            balance: "desc",
        },
    })

    const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0)
    const totalCustomers = customers.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Outstanding Credit Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">₹ {totalOutstanding.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Customers with Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Balance Due</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.mobile}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{customer.address || "-"}</TableCell>
                                <TableCell className="text-right font-bold text-destructive">
                                    ₹ {customer.balance.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/customers`}>
                                        <Button variant="ghost" size="sm">
                                            <FileText className="mr-2 h-4 w-4" /> View Ledger
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No outstanding credits found. Great job!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
