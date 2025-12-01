import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const expenses = await prisma.expense.findMany({
            include: { category: true },
            orderBy: { date: "desc" },
        });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, amount, date, notes } = body;

        const expense = await prisma.expense.create({
            data: {
                categoryId,
                amount: parseFloat(amount),
                date: new Date(date),
                notes,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}
