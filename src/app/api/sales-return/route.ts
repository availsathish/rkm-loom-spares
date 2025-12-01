import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const returns = await prisma.salesReturn.findMany({
            include: { customer: true },
            orderBy: { date: 'desc' }
        })
        return NextResponse.json(returns)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { billId, customerId, items } = body // items: { productId, qty, price }[]

        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0)

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sales Return Record
            const salesReturn = await tx.salesReturn.create({
                data: {
                    billId,
                    customerId,
                    totalAmount,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            qty: item.qty,
                            price: item.price,
                            amount: item.qty * item.price
                        }))
                    }
                }
            })

            // 2. Update Stock (Increment because items returned)
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.qty } }
                })
            }

            // 3. Update Customer Balance (Decrement if they have a balance, effectively refunding to account)
            if (customerId) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: { balance: { decrement: totalAmount } }
                })
            }

            return salesReturn
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Sales return error:", error)
        return NextResponse.json({ error: "Failed to create return" }, { status: 500 })
    }
}
