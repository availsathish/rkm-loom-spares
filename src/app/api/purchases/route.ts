import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const purchaseItemSchema = z.object({
    productId: z.string(),
    qty: z.number().min(1),
    price: z.number().min(0),
});

const purchaseSchema = z.object({
    supplierId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    items: z.array(purchaseItemSchema).min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = purchaseSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { supplierId, date, items } = result.data;

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

        // Transaction to create purchase and update stock
        const purchase = await prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const newPurchase = await tx.purchase.create({
                data: {
                    supplierId,
                    date,
                    totalAmount,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            qty: item.qty,
                            price: item.price,
                            amount: item.qty * item.price,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // 2. Update Product Stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.qty,
                        },
                        purchasePrice: item.price, // Update latest purchase price
                    },
                });
            }

            return newPurchase;
        });

        return NextResponse.json(purchase, { status: 201 });
    } catch (error) {
        console.error("Purchase error:", error);
        return NextResponse.json(
            { error: "Failed to create purchase" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const purchases = await prisma.purchase.findMany({
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return NextResponse.json(purchases);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch purchases" },
            { status: 500 }
        );
    }
}
