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

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(suppliers);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch suppliers" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = supplierSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, mobile, email, address, gst } = result.data;

        const existingSupplier = await prisma.supplier.findUnique({
            where: { mobile },
        });

        if (existingSupplier) {
            return NextResponse.json(
                { error: "Supplier with this mobile number already exists" },
                { status: 400 }
            );
        }

        const supplier = await prisma.supplier.create({
            data: {
                name,
                mobile,
                email: email || null,
                address: address || null,
                gst: gst || null,
            },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create supplier" },
            { status: 500 }
        );
    }
}
