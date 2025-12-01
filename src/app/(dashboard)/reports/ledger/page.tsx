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
import { FileText } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function LedgerSelectionPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const query = params.q || ""

    const customers = await prisma.customer.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { mobile: { contains: query } },
            ],
        },
        orderBy: { name: "asc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Customer Ledger</h2>
            </div>

            <div className="flex items-center gap-2">
                <form className="flex-1 max-w-sm flex gap-2">
                    <Input
                        name="q"
                        placeholder="Search by name or mobile..."
                        defaultValue={query}
                    />
                    <Button type="submit">Search</Button>
                </form>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Current Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.mobile}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{customer.address || "-"}</TableCell>
                                <TableCell className="text-right font-bold">
                                    <span className={customer.balance > 0 ? "text-destructive" : "text-green-600"}>
                                        ₹ {customer.balance.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/reports/ledger/${customer.id}`}>
                                        <Button variant="outline" size="sm">
                                            <FileText className="mr-2 h-4 w-4" /> View Ledger
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
