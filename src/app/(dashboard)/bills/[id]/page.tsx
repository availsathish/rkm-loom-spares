import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { PrintButton } from "@/components/common/PrintButton"
import Image from "next/image"
import { WhatsAppShareButton } from "@/components/common/WhatsAppShareButton"

export const dynamic = "force-dynamic"

export default async function BillPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const [bill, settingsList] = await Promise.all([
        prisma.bill.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: true
            }
        }),
        prisma.settings.findMany()
    ])

    if (!bill) {
        notFound()
    }

    const settings = settingsList.reduce((acc: Record<string, string>, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, string>)

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <Link href="/pos">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to POS
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <WhatsAppShareButton
                        billId={bill.id}
                        customerMobile={bill.customerMobile}
                        totalAmount={bill.totalAmount}
                    />
                    <PrintButton />
                </div>
            </div>

            <div className="bg-white p-8 shadow-sm border print:shadow-none print:border-none print:p-0" id="invoice">
                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                    <div className="flex justify-center mb-2">
                        <div className="relative h-20 w-20">
                            <Image src="/logo.jpg" alt="Logo" fill className="object-contain" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-primary">
                        {settings.businessName?.replace(" FINAL", "") || "RKM Loom Spares"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-bold uppercase">DELIVERY NOTE</p>
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                        {settings.address || "Saraswathi complex, Chettipalayam road\nPalladam, Tiruppur - 641664"}
                        {settings.mobile && <p>Mobile: {settings.mobile}</p>}
                        {settings.gst && <p>GSTIN: {settings.gst}</p>}
                    </div>
                </div>

                {/* Bill Info */}
                <div className="flex justify-between mb-6 text-sm">
                    <div>
                        <p className="font-semibold">Bill To:</p>
                        <p className="font-bold text-lg">{bill.customerName || "Guest"}</p>
                        {bill.customerMobile && <p>Mobile: {bill.customerMobile}</p>}
                        {bill.customerAddress && <p className="whitespace-pre-wrap max-w-[250px]">{bill.customerAddress}</p>}
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold">Bill No:</span> #{bill.id}</p>
                        <p><span className="font-semibold">Date:</span> {format(new Date(bill.date), "dd/MM/yyyy")}</p>
                        <p><span className="font-semibold">Time:</span> {format(new Date(bill.date), "hh:mm a")}</p>
                        <p><span className="font-semibold">Payment:</span> {bill.paymentMode}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-6">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-2">S.No</th>
                            <th className="text-left py-2">Item Name</th>
                            <th className="text-left py-2">Code</th>
                            <th className="text-right py-2">Qty</th>
                            <th className="text-right py-2">Price</th>
                            <th className="text-right py-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-2">{index + 1}</td>
                                <td className="py-2 font-medium">{item.product.name}</td>
                                <td className="py-2 text-muted-foreground">{item.product.code}</td>
                                <td className="py-2 text-right">{item.qty}</td>
                                <td className="py-2 text-right">₹ {item.price.toFixed(2)}</td>
                                <td className="py-2 text-right font-bold">₹ {item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹ {bill.items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</span>
                        </div>
                        {bill.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>- ₹ {bill.discount.toFixed(2)}</span>
                            </div>
                        )}
                        {bill.transportCharge > 0 && (
                            <div className="flex justify-between">
                                <span>Transport:</span>
                                <span>+ ₹ {bill.transportCharge.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-black pt-2 font-bold text-lg">
                            <span>Grand Total:</span>
                            <span>₹ {bill.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-muted-foreground border-t pt-4">
                    <p className="whitespace-pre-wrap">{settings.terms || "Thank you for your business!\nGoods once sold cannot be taken back or exchanged."}</p>
                </div>
            </div>
        </div>
    )
}
