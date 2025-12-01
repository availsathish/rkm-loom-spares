import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, History } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function StockPage() {
    const [lowStockProducts, recentPurchases] = await Promise.all([
        prisma.product.findMany({
            where: { stock: { lte: 10 } },
            orderBy: { stock: "asc" },
            take: 5,
        }),
        prisma.purchase.findMany({
            take: 5,
            orderBy: { date: "desc" },
            include: { supplier: true },
        }),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
                    <p className="text-muted-foreground">
                        Manage inventory, purchases, and stock levels.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/stock/purchases">
                            <Plus className="mr-2 h-4 w-4" /> New Purchase
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Purchases</CardTitle>
                        <CardDescription>
                            Latest stock entries from suppliers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPurchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>
                                            {format(new Date(purchase.date), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>{purchase.supplier.name}</TableCell>
                                        <TableCell className="text-right">
                                            ₹{purchase.totalAmount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentPurchases.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No purchases recorded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Low Stock Alert
                        </CardTitle>
                        <CardDescription>
                            Products running low on stock (≤ 10).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
                                            {product.stock} {product.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {lowStockProducts.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    All stock levels are healthy.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
