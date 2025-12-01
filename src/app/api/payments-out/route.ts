import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const payments = await prisma.paymentOut.findMany({
            include: { supplier: true },
            orderBy: { date: "desc" },
        });
        return NextResponse.json(payments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { supplierId, amount, mode, date, notes } = body;

        const payment = await prisma.paymentOut.create({
            data: {
                supplierId,
                amount: parseFloat(amount),
                mode,
                date: new Date(date),
                notes,
            },
        });

        return NextResponse.json(payment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }
}
