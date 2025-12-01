"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react"
import { CustomerForm } from "./CustomerForm"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImportDialog } from "@/components/common/ImportDialog"

export function CustomerList({ initialCustomers }: { initialCustomers: any[] }) {
    const [customers, setCustomers] = useState(initialCustomers)
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<any>(null)
    const router = useRouter()

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search)
    )

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return
        try {
            await fetch(`/api/customers/${id}`, { method: "DELETE" })
            toast.success("Customer deleted")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2">
                    <ImportDialog type="customers" onSuccess={router.refresh} />
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingCustomer(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                            </DialogHeader>
                            <CustomerForm
                                initialData={editingCustomer}
                                onSuccess={() => {
                                    setIsAddOpen(false)
                                    router.refresh()
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.mobile}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{customer.address || "-"}</TableCell>
                                <TableCell>
                                    <span className={customer.balance > 0 ? "text-destructive font-bold" : "text-green-600"}>
                                        ₹ {customer.balance}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/reports/ledger/${customer.id}`}>
                                        <Button variant="ghost" size="icon" title="View Ledger">
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditingCustomer(customer)
                                            setIsAddOpen(true)
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleDelete(customer.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
