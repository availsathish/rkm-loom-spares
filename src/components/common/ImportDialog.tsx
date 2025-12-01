"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ImportDialogProps {
    type: "products" | "customers"
    onSuccess?: () => void
}

export function ImportDialog({ type, onSuccess }: ImportDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.set("file", file)

        try {
            const res = await fetch(`/api/${type}/import`, {
                method: "POST",
                body: formData,
            })
            const json = await res.json()

            if (json.success) {
                toast.success(`Successfully imported ${json.count} ${type}`)
                setOpen(false)
                router.refresh()
                if (onSuccess) onSuccess()
            } else {
                toast.error("Import failed")
            }
        } catch (error) {
            toast.error("Import error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import {type === "products" ? "Products" : "Customers"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import {type === "products" ? "Products" : "Customers"}</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file (.xlsx) with the required columns.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleUpload}
                        disabled={loading}
                    />
                    {loading && <p className="text-sm text-muted-foreground">Importing...</p>}
                    <div className="text-xs text-muted-foreground">
                        <p className="font-semibold">Required Columns:</p>
                        {type === "products" ? (
                            <p>Name, Code, Category, HSN, PurchasePrice, SellingPrice, Stock, Unit</p>
                        ) : (
                            <p>Name, Mobile, Address, GST, Balance</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
