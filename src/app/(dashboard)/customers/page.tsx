import { prisma } from "@/lib/prisma"
import { CustomerList } from "@/components/customers/CustomerList"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
    const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
    })

    return <CustomerList initialCustomers={customers} />
}
