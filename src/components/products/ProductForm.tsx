"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Image from "next/image"

interface ProductFormProps {
    initialData?: any
    onSuccess: () => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        code: initialData?.code || "",
        category: initialData?.category || "",
        hsn: initialData?.hsn || "",
        purchasePrice: initialData?.purchasePrice || "",
        sellingPrice: initialData?.sellingPrice || "",
        stock: initialData?.stock || "",
        unit: initialData?.unit || "pcs",
        imageUrl: initialData?.imageUrl || "",
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const data = new FormData()
        data.set('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            })
            const json = await res.json()
            if (json.success) {
                setFormData(prev => ({ ...prev, imageUrl: json.url }))
                toast.success("Image uploaded")
            } else {
                toast.error("Upload failed")
            }
        } catch (error) {
            toast.error("Upload error")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = initialData ? `/api/products/${initialData.id}` : "/api/products"
            const method = initialData ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    purchasePrice: parseFloat(formData.purchasePrice),
                    sellingPrice: parseFloat(formData.sellingPrice),
                    stock: parseInt(formData.stock),
                }),
            })

            if (!res.ok) throw new Error("Failed to save product")

            toast.success(initialData ? "Product updated" : "Product created")
            onSuccess()
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
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="code">Product Code</Label>
                    <Input
                        id="code"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hsn">HSN Code</Label>
                    <Input
                        id="hsn"
                        value={formData.hsn}
                        onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                        id="purchasePrice"
                        type="number"
                        required
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price</Label>
                    <Input
                        id="sellingPrice"
                        type="number"
                        required
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                        id="stock"
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex gap-4 items-center">
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {formData.imageUrl && (
                        <div className="relative h-12 w-12 border rounded overflow-hidden">
                            <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                </div>
                {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading || uploading}>
                {loading ? "Saving..." : "Save Product"}
            </Button>
        </form>
    )
}
