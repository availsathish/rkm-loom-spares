import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const adjustmentSchema = z.object({
    productId: z.string(),
    type: z.enum(["ADD", "REMOVE"]),
    qty: z.number().min(1),
    reason: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = adjustmentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { productId, type, qty, reason } = result.data;

        const adjustment = await prisma.$transaction(async (tx) => {
            // 1. Create Adjustment Record
            const newAdjustment = await tx.stockAdjustment.create({
                data: {
                    productId,
                    type,
                    qty,
                    reason,
                },
            });

            // 2. Update Product Stock
            const stockChange = type === "ADD" ? qty : -qty;
            await tx.product.update({
                where: { id: productId },
                data: {
                    stock: {
                        increment: stockChange,
                    },
                },
            });

            return newAdjustment;
        });

        return NextResponse.json(adjustment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to adjust stock" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const adjustments = await prisma.stockAdjustment.findMany({
            include: {
                product: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        return NextResponse.json(adjustments);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch adjustments" },
            { status: 500 }
        );
    }
}
