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
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function StockReportPage() {
    const products = await prisma.product.findMany({
        orderBy: {
            name: "asc",
        },
    })

    const totalItems = products.length
    const totalStockQty = products.reduce((sum, p) => sum + p.stock, 0)
    const totalStockValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.stock), 0)
    const totalSellingValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0)
    const lowStockItems = products.filter(p => p.stock < 5).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Stock Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Qty</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStockQty}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value (Purchase)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {totalStockValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Stock Value (Selling)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {totalSellingValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {lowStockItems > 0 && (
                <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-destructive">
                    <strong>Alert:</strong> {lowStockItems} items are running low on stock (less than 5).
                </div>
            )}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Purchase Price</TableHead>
                            <TableHead className="text-right">Selling Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Value (Purchase)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.code}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="text-right">₹ {product.purchasePrice}</TableCell>
                                <TableCell className="text-right">₹ {product.sellingPrice}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                                        {product.stock} {product.unit}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    ₹ {(product.purchasePrice * product.stock).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
