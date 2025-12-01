import { prisma } from "@/lib/prisma";
import { PurchaseForm } from "@/components/stock/PurchaseForm";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
    const [suppliers, products] = await Promise.all([
        prisma.supplier.findMany({ orderBy: { name: "asc" } }),
        prisma.product.findMany({ orderBy: { name: "asc" } }),
    ]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Purchase Entry</h1>
                <p className="text-muted-foreground">
                    Record a new stock purchase from a supplier.
                </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <PurchaseForm suppliers={suppliers} products={products} />
            </div>
        </div>
    );
}
