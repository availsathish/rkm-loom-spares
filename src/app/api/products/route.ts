import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: search } }, // Case insensitive usually requires mode: 'insensitive' but SQLite is case-insensitive by default for ASCII
                    { code: { contains: search } },
                    { category: { contains: search } },
                ],
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, code, category, hsn, purchasePrice, sellingPrice, stock, unit, imageUrl } = body

        // Basic validation
        if (!name || !code || !sellingPrice) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                name,
                code,
                category,
                hsn,
                purchasePrice: parseFloat(purchasePrice),
                sellingPrice: parseFloat(sellingPrice),
                stock: parseInt(stock) || 0,
                unit: unit || "PCS",
                imageUrl,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
