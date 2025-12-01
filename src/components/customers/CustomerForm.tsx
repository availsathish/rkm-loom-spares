"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CustomerFormProps {
    initialData?: any
    onSuccess?: () => void
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        mobile: initialData?.mobile || "",
        address: initialData?.address || "",
        gst: initialData?.gst || "",
        balance: initialData?.balance || "0",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = initialData ? `/api/customers/${initialData.id}` : "/api/customers"
            const method = initialData ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed to save customer")

            toast.success(initialData ? "Customer updated" : "Customer created")
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile No</Label>
                    <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="gst">GST Number (Optional)</Label>
                    <Input id="gst" name="gst" value={formData.gst} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="balance">Opening Balance</Label>
                    <Input
                        id="balance"
                        name="balance"
                        type="number"
                        value={formData.balance}
                        onChange={handleChange}
                        placeholder="Positive = Due, Negative = Advance"
                    />
                    <p className="text-xs text-muted-foreground">Positive for Due, Negative for Advance</p>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Customer"}
            </Button>
        </form>
    )
}
