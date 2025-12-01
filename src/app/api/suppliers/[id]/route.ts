import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    gst: z.string().optional(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const result = supplierSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, mobile, email, address, gst } = result.data;

        // Check if mobile is taken by another supplier
        const existingSupplier = await prisma.supplier.findFirst({
            where: {
                mobile,
                NOT: { id },
            },
        });

        if (existingSupplier) {
            return NextResponse.json(
                { error: "Mobile number already in use by another supplier" },
                { status: 400 }
            );
        }

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                name,
                mobile,
                email: email || null,
                address: address || null,
                gst: gst || null,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update supplier" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.supplier.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete supplier" },
            { status: 500 }
        );
    }
}
