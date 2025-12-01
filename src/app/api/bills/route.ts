import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const bills = await prisma.bill.findMany({
            orderBy: { createdAt: 'desc' },
            include: { customer: true }
        })
        return NextResponse.json(bills)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            customerId,
            customerName,
            customerMobile,
            items,
            discount,
            transportCharge,
            paymentMode
        } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in bill" }, { status: 400 })
        }

        // Calculate total
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)
        const totalAmount = subtotal - (discount || 0) + (transportCharge || 0)

        // Transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Bill
            const bill = await tx.bill.create({
                data: {
                    customerId,
                    customerName,
                    customerMobile,
                    totalAmount,
                    discount: discount || 0,
                    transportCharge: transportCharge || 0,
                    paymentMode,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            qty: item.qty,
                            price: item.price,
                            amount: item.price * item.qty
                        }))
                    }
                },
                include: { items: true }
            })

            // 2. Update Stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.qty } }
                })
            }

            // 3. Update Customer Balance if Credit
            if (customerId && paymentMode === "CREDIT") {
                await tx.customer.update({
                    where: { id: customerId },
                    data: { balance: { increment: totalAmount } }
                })
            }

            return bill
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Billing Error:", error)
        return NextResponse.json({ error: "Failed to create bill" }, { status: 500 })
    }
}
