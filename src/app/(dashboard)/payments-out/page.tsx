import { prisma } from "@/lib/prisma";
import { PaymentOutForm } from "@/components/payments/PaymentOutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function PaymentsOutPage() {
    const payments = await prisma.paymentOut.findMany({
        include: { supplier: true },
        orderBy: { date: "desc" },
    });

    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Payment Out</h1>
                <PaymentOutForm suppliers={suppliers} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{payment.supplier.name}</TableCell>
                                    <TableCell>{payment.mode}</TableCell>
                                    <TableCell>{payment.notes || "-"}</TableCell>
                                    <TableCell className="text-right">₹{payment.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
