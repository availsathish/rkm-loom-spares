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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format, startOfDay, endOfDay, parseISO } from "date-fns"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SalesReportPage(props: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const searchParams = await props.searchParams;
    const from = searchParams.from ? parseISO(searchParams.from) : startOfDay(new Date())
    const to = searchParams.to ? endOfDay(parseISO(searchParams.to)) : endOfDay(new Date())

    const bills = await prisma.bill.findMany({
        where: {
            date: {
                gte: from,
                lte: to,
            },
        },
        orderBy: {
            date: "desc",
        },
        include: {
            customer: true,
        },
    })

    const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const totalBills = bills.length

    async function filter(formData: FormData) {
        "use server"
        const fromDate = formData.get("from") as string
        const toDate = formData.get("to") as string
        redirect(`/reports/sales?from=${fromDate}&to=${toDate}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Sales Report</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={filter} className="flex gap-4 items-end">
                        <div className="grid gap-2">
                            <label htmlFor="from" className="text-sm font-medium">From Date</label>
                            <Input
                                type="date"
                                name="from"
                                id="from"
                                defaultValue={searchParams.from || format(new Date(), "yyyy-MM-dd")}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="to" className="text-sm font-medium">To Date</label>
                            <Input
                                type="date"
                                name="to"
                                id="to"
                                defaultValue={searchParams.to || format(new Date(), "yyyy-MM-dd")}
                                required
                            />
                        </div>
                        <Button type="submit">Apply Filter</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBills}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bill No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills.map((bill) => (
                            <TableRow key={bill.id}>
                                <TableCell className="font-medium">#{bill.id}</TableCell>
                                <TableCell>{format(new Date(bill.date), "dd/MM/yyyy hh:mm a")}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{bill.customerName || "Guest"}</div>
                                    <div className="text-xs text-muted-foreground">{bill.customerMobile}</div>
                                </TableCell>
                                <TableCell>{bill.paymentMode}</TableCell>
                                <TableCell className="text-right font-bold">₹ {bill.totalAmount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/bills/${bill.id}`}>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {bills.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No sales found for the selected period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
