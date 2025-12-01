import { prisma } from "@/lib/prisma"
import { ProductList } from "@/components/products/ProductList"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
    })

    return <ProductList initialProducts={products} />
}
