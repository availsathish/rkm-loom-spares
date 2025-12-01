"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, AlertTriangle } from "lucide-react"
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

export function BackupRestore() {
    const [restoring, setRestoring] = useState(false)

    const handleBackup = () => {
        window.location.href = "/api/backup"
        toast.success("Backup download started")
    }

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setRestoring(true)
        const formData = new FormData()
        formData.set("file", file)

        try {
            const res = await fetch("/api/restore", {
                method: "POST",
                body: formData,
            })
            const json = await res.json()

            if (json.success) {
                toast.success("Database restored successfully")
                window.location.reload()
            } else {
                toast.error("Restore failed")
            }
        } catch (error) {
            toast.error("Restore error")
        } finally {
            setRestoring(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Backup & Restore</CardTitle>
                <CardDescription>Manage your application data safely.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h3 className="font-medium">Backup Data</h3>
                        <p className="text-sm text-muted-foreground">Download a copy of your database.</p>
                    </div>
                    <Button onClick={handleBackup}>
                        <Download className="mr-2 h-4 w-4" /> Download Backup
                    </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                    <div>
                        <h3 className="font-medium text-destructive">Restore Data</h3>
                        <p className="text-sm text-muted-foreground">Overwrite current data with a backup file.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Upload className="mr-2 h-4 w-4" /> Restore Backup
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will overwrite your current database with the uploaded file.
                                    All current data will be replaced. A backup of the current state will be saved on the server.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <input
                                    type="file"
                                    accept=".db"
                                    onChange={handleRestore}
                                    disabled={restoring}
                                    className="w-full"
                                />
                                {restoring && <p className="text-sm text-muted-foreground mt-2">Restoring...</p>}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}
