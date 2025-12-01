import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = params.id
        const body = await request.json()
        const { name, code, category, hsn, purchasePrice, sellingPrice, stock, unit, imageUrl } = body

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                code,
                category,
                hsn,
                purchasePrice: parseFloat(purchasePrice),
                sellingPrice: parseFloat(sellingPrice),
                stock: parseInt(stock),
                unit,
                imageUrl,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = params.id
        await prisma.product.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }
}
