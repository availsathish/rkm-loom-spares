import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const bill = await prisma.bill.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true,
                items: {
                    include: { product: true }
                }
            }
        })

        if (!bill) {
            return NextResponse.json({ error: "Bill not found" }, { status: 404 })
        }

        return NextResponse.json(bill)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 })
    }
}


export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { customerId, paymentMode, date } = body

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get existing bill
            const existingBill = await tx.bill.findUnique({
                where: { id: parseInt(id) },
                include: { customer: true }
            })

            if (!existingBill) {
                throw new Error("Bill not found")
            }

            // 2. Handle Customer Change
            if (customerId && customerId !== existingBill.customerId) {
                // Revert balance for old customer if it was CREDIT
                if (existingBill.paymentMode === "CREDIT" && existingBill.customerId) {
                    await tx.customer.update({
                        where: { id: existingBill.customerId },
                        data: { balance: { decrement: existingBill.totalAmount } }
                    })
                }

                // Update balance for new customer if it is CREDIT (or if payment mode is also changing to CREDIT)
                // We need to check the *new* payment mode (or keep old if not changing)
                const finalPaymentMode = paymentMode || existingBill.paymentMode
                if (finalPaymentMode === "CREDIT") {
                    await tx.customer.update({
                        where: { id: customerId },
                        data: { balance: { increment: existingBill.totalAmount } }
                    })
                }
            } else if (paymentMode && paymentMode !== existingBill.paymentMode) {
                // Same customer, but payment mode changed
                if (existingBill.customerId) {
                    // If changing FROM Credit TO Cash/UPI -> Decrement Balance
                    if (existingBill.paymentMode === "CREDIT" && paymentMode !== "CREDIT") {
                        await tx.customer.update({
                            where: { id: existingBill.customerId },
                            data: { balance: { decrement: existingBill.totalAmount } }
                        })
                    }
                    // If changing FROM Cash/UPI TO Credit -> Increment Balance
                    else if (existingBill.paymentMode !== "CREDIT" && paymentMode === "CREDIT") {
                        await tx.customer.update({
                            where: { id: existingBill.customerId },
                            data: { balance: { increment: existingBill.totalAmount } }
                        })
                    }
                }
            }

            // 3. Update Bill
            const updatedBill = await tx.bill.update({
                where: { id: parseInt(id) },
                data: {
                    customerId: customerId ? customerId : undefined,
                    customerName: customerId ? (await tx.customer.findUnique({ where: { id: customerId } }))?.name : undefined,
                    customerMobile: customerId ? (await tx.customer.findUnique({ where: { id: customerId } }))?.mobile : undefined,
                    paymentMode: paymentMode || undefined,
                    date: date ? new Date(date) : undefined
                }
            })

            return updatedBill
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error updating bill:", error)
        return NextResponse.json(
            { error: "Failed to update bill" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const billId = parseInt(id)

        await prisma.$transaction(async (tx) => {
            // 1. Get bill details
            const bill = await tx.bill.findUnique({
                where: { id: billId },
                include: { items: true }
            })

            if (!bill) throw new Error("Bill not found")

            // 2. Restore stock
            for (const item of bill.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.qty } }
                })
            }

            // 3. Revert customer balance if Credit
            if (bill.paymentMode === "CREDIT" && bill.customerId) {
                await tx.customer.update({
                    where: { id: bill.customerId },
                    data: { balance: { decrement: bill.totalAmount } }
                })
            }

            // 4. Delete bill items
            await tx.billItem.deleteMany({
                where: { billId }
            })

            // 5. Delete bill
            await tx.bill.delete({
                where: { id: billId }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete bill" },
            { status: 500 }
        )
    }
}
