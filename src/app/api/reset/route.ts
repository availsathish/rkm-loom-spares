import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const { type } = await request.json()

        if (type === "products") {
            // Delete all products (and related bill items? No, that would break bills. 
            // Actually, if we delete products, we must handle integrity.
            // Prisma might complain if we delete products used in bills.
            // For a hard reset, we might need to delete everything or just products not in use.
            // But user asked to "reset product data". Usually implies clearing the catalog.
            // If we have bills, we can't easily delete products without cascading or setting null.
            // Let's assume for now we delete everything related if "all" or warn.

            // For now, let's try deleteMany. If it fails due to FK, we catch it.
            await prisma.product.deleteMany()
        } else if (type === "customers") {
            await prisma.customer.deleteMany()
        } else if (type === "all") {
            // Delete everything in order
            await prisma.billItem.deleteMany()
            await prisma.bill.deleteMany()
            await prisma.customer.deleteMany()
            await prisma.product.deleteMany()
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reset Error:", error)
        return NextResponse.json({ error: "Failed to reset data. Ensure no dependencies exist." }, { status: 500 })
    }
}
