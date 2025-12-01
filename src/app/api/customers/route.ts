import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""

        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: search } },
                    { mobile: { contains: search } },
                ],
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(customers)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, mobile, address, gst, balance } = body

        if (!name || !mobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                mobile,
                address,
                gst,
                balance: parseFloat(balance) || 0,
            },
        })

        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }
}
