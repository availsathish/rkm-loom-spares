import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const lowerMsg = message.toLowerCase().trim();
        let response = "I'm not sure how to help with that. Try asking about stock, prices, customer balances, or suppliers.";

        // Helper to clean search terms
        const cleanTerm = (term: string) => term.replace(/^(of|for|the|we|do|does)\s+/i, "").trim();

        // 1. Greetings
        if (lowerMsg === "hello" || lowerMsg === "hi" || lowerMsg === "hey") {
            return NextResponse.json({
                response: "Hello! I can help you check stock, prices, customer balances, and more. Just ask!"
            });
        }

        // 2. Stock & Price Queries
        if (lowerMsg.includes("stock") || lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("rate")) {
            const match = lowerMsg.match(/(?:stock|price|cost|rate)\s+(?:of|for)?\s*(.+)/i);
            if (match && match[1]) {
                const term = cleanTerm(match[1]);
                const products = await prisma.product.findMany({
                    where: {
                        OR: [
                            { name: { contains: term } },
                            { code: { contains: term } },
                        ],
                    },
                    take: 5,
                });

                if (products.length > 0) {
                    if (products.length === 1) {
                        const p = products[0];
                        response = `**${p.name}** (${p.code})\nStock: ${p.stock} ${p.unit}\nPrice: ₹${p.sellingPrice}`;
                    } else {
                        response = "Found multiple items:\n" + products.map(p =>
                            `- ${p.name}: ${p.stock} ${p.unit} @ ₹${p.sellingPrice}`
                        ).join("\n");
                    }
                } else {
                    response = `I couldn't find any products matching "${term}".`;
                }
            }
        }

        // 3. Customer Outstanding / Balance
        else if (lowerMsg.includes("balance") || lowerMsg.includes("outstanding") || lowerMsg.includes("due")) {
            const match = lowerMsg.match(/(?:balance|outstanding|due)\s+(?:of|for)?\s*(.+)/i);
            if (match && match[1]) {
                const term = cleanTerm(match[1]);
                const customers = await prisma.customer.findMany({
                    where: {
                        OR: [
                            { name: { contains: term } },
                            { mobile: { contains: term } },
                        ],
                    },
                    take: 3,
                });

                if (customers.length > 0) {
                    response = customers.map(c =>
                        `**${c.name}**\nBalance: ₹${c.balance} ${c.balance > 0 ? '(Due)' : '(Advance)'}`
                    ).join("\n\n");
                } else {
                    response = `I couldn't find any customer matching "${term}".`;
                }
            }
        }

        // 4. Supplier Details
        else if (lowerMsg.includes("supplier") || ((lowerMsg.includes("mobile") || lowerMsg.includes("phone") || lowerMsg.includes("detail") || lowerMsg.includes("address") || lowerMsg.includes("email")) && (lowerMsg.includes("of") || lowerMsg.includes("for")))) {
            let term = "";
            const specificMatch = lowerMsg.match(/(?:mobile|phone|details|address|email|supplier)\s+(?:of|for)?\s*(.+)/i);

            if (specificMatch && specificMatch[1]) {
                term = cleanTerm(specificMatch[1]);
                // Remove "supplier" from the term if it's there (e.g. "mobile of supplier X")
                term = term.replace(/^supplier\s+/i, "").trim();
            }

            if (term) {
                const suppliers = await prisma.supplier.findMany({
                    where: { name: { contains: term } },
                    take: 1
                });

                if (suppliers.length > 0) {
                    const s = suppliers[0];
                    response = `**${s.name}**\nMobile: ${s.mobile}\nEmail: ${s.email || "N/A"}\nAddress: ${s.address || "N/A"}`;
                } else {
                    // Only respond with "not found" if we are fairly sure it was a supplier query
                    if (lowerMsg.includes("supplier")) {
                        response = `No supplier found matching "${term}".`;
                    }
                }
            }
        }

        // 5. Ledger / Last Bill
        else if (lowerMsg.includes("ledger") || lowerMsg.includes("last bill")) {
            const match = lowerMsg.match(/(?:ledger|last bill)\s+(?:of|for)?\s*(.+)/i);
            if (match && match[1]) {
                const term = cleanTerm(match[1]);
                const customer = await prisma.customer.findFirst({
                    where: { name: { contains: term } }
                });

                if (customer) {
                    const lastBill = await prisma.bill.findFirst({
                        where: { customerId: customer.id },
                        orderBy: { date: 'desc' },
                        include: { items: { include: { product: true } } }
                    });

                    if (lastBill) {
                        response = `**Last Bill for ${customer.name}**\nDate: ${new Date(lastBill.date).toLocaleDateString()}\nAmount: ₹${lastBill.totalAmount}\nItems: ${lastBill.items.length}`;
                    } else {
                        response = `${customer.name} has no bills yet.`;
                    }
                } else {
                    response = `Customer "${term}" not found.`;
                }
            }
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chatbot Error:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}
