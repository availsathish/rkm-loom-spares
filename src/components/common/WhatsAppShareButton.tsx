"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface WhatsAppShareButtonProps {
    billId: number
    customerMobile?: string | null
    totalAmount: number
}

export function WhatsAppShareButton({ billId, customerMobile, totalAmount }: WhatsAppShareButtonProps) {
    const handleShare = () => {
        const text = `Hello, Here is your bill #${billId} from RKM Loom Spares. Total Amount: ₹${totalAmount.toFixed(2)}. Thank you for your business!`
        const url = `https://wa.me/${customerMobile ? customerMobile : ""}?text=${encodeURIComponent(text)}`
        window.open(url, "_blank")
    }

    return (
        <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share WhatsApp
        </Button>
    )
}
