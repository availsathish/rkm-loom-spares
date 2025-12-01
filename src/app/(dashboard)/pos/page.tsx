import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/pos/ProductGrid"
import { Cart } from "@/components/pos/Cart"

export const dynamic = "force-dynamic"

export default async function POSPage() {
    const [products, customers] = await Promise.all([
        prisma.product.findMany({
            orderBy: { name: "asc" },
        }),
        prisma.customer.findMany({
            orderBy: { name: "asc" },
        }),
    ])

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            <div className="flex-1 h-full overflow-hidden">
                <ProductGrid products={products} />
            </div>
            <div className="w-[350px] h-full">
                <Cart customers={customers} />
            </div>
        </div>
    )
}
