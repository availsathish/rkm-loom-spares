import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { PrintButton } from "@/components/common/PrintButton"

export const dynamic = "force-dynamic"

export default async function CustomerLedgerPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customer = await prisma.customer.findUnique({
        where: { id: params.id },
        include: {
            bills: {
                orderBy: { date: "desc" },
            },
        },
    })

    if (!customer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/reports/ledger">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Customer Ledger</h2>
                </div>
                <PrintButton />
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm print:shadow-none print:border-none print:p-0" id="ledger">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-xl font-bold">{customer.name}</h1>
                    <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                    {customer.address && <p className="text-sm text-muted-foreground">{customer.address}</p>}
                    <div className="mt-2 text-lg font-semibold">
                        Current Balance: <span className={customer.balance > 0 ? "text-destructive" : "text-green-600"}>
                            ₹ {customer.balance.toFixed(2)}
                        </span>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Bill No</TableHead>
                            <TableHead>Payment Mode</TableHead>
                            <TableHead className="text-right">Bill Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customer.bills.map((bill) => (
                            <TableRow key={bill.id}>
                                <TableCell>{format(new Date(bill.date), "dd/MM/yyyy")}</TableCell>
                                <TableCell>#{bill.id}</TableCell>
                                <TableCell>{bill.paymentMode}</TableCell>
                                <TableCell className="text-right">₹ {bill.totalAmount.toFixed(2)}</TableCell>
                                <TableCell className="text-right print:hidden">
                                    <Link href={`/bills/${bill.id}`}>
                                        <Button variant="ghost" size="sm">View Bill</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {customer.bills.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
