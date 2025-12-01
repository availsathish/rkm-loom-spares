import { prisma } from "@/lib/prisma";
import { SupplierList } from "@/components/suppliers/SupplierList";
import { SupplierForm } from "@/components/suppliers/SupplierForm";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
    const suppliers = await prisma.supplier.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your suppliers and their details.
                    </p>
                </div>
                <SupplierForm />
            </div>

            <SupplierList initialSuppliers={suppliers} />
        </div>
    );
}
