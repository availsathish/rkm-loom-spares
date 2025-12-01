"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DataReset() {
    const [loading, setLoading] = useState(false)

    const handleReset = async (type: "products" | "customers" | "all") => {
        setLoading(true)
        try {
            const res = await fetch("/api/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            })
            const json = await res.json()

            if (json.success) {
                toast.success("Data reset successfully")
                window.location.reload()
            } else {
                toast.error(json.error || "Reset failed")
            }
        } catch (error) {
            toast.error("Reset error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible actions. Please proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div>
                        <h3 className="font-medium">Reset Products</h3>
                        <p className="text-sm text-muted-foreground">Delete all products from the database.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Reset Products</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all products. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReset("products")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Confirm Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div>
                        <h3 className="font-medium">Reset Customers</h3>
                        <p className="text-sm text-muted-foreground">Delete all customers from the database.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Reset Customers</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all customers. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReset("customers")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Confirm Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div>
                        <h3 className="font-medium font-bold text-destructive">Factory Reset</h3>
                        <p className="text-sm text-muted-foreground">Delete EVERYTHING (Products, Customers, Bills).</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Reset Everything</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you ABSOLUTELY sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will wipe the entire database. All products, customers, bills, and history will be lost forever.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReset("all")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Confirm Full Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}
