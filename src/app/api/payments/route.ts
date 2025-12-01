import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            include: { customer: true },
            orderBy: { date: 'desc' }
        })
        return NextResponse.json(payments)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { customerId, amount, mode, notes } = body

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payment Record
            const payment = await tx.payment.create({
                data: {
                    customerId,
                    amount,
                    mode,
                    notes
                }
            })

            // 2. Update Customer Balance (Decrement because they paid)
            await tx.customer.update({
                where: { id: customerId },
                data: { balance: { decrement: amount } }
            })

            return payment
        })

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }
}
