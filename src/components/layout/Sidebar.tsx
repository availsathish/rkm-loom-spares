"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    FileText,
    Settings,
    LogOut,
    Receipt,
    IndianRupee,
    RotateCcw,
    Truck,
    Boxes,
    ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Billing (POS)",
        href: "/pos",
        icon: ShoppingCart,
    },
    {
        title: "Bills",
        href: "/bills",
        icon: Receipt,
    },
    {
        title: "Products",
        href: "/products",
        icon: Package,
    },
    {
        title: "Payments (In)",
        href: "/payments",
        icon: IndianRupee,
    },
    {
        title: "Sales Return",
        href: "/sales-return",
        icon: RotateCcw,
    },
    {
        title: "Customers",
        href: "/customers",
        icon: Users,
    },
    {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
    },
    {
        title: "Stock",
        href: "/stock",
        icon: Boxes,
    },
    {
        title: "Payment Out",
        href: "/payments-out",
        icon: ArrowUpRight,
    },
    {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt,
    },
    {
        title: "Reports",
        href: "/reports",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300">
            <div className="flex h-16 items-center border-b px-6 bg-white dark:bg-sidebar">
                <div className="relative h-8 w-8 mr-3">
                    <Image src="/logo.jpg" alt="Logo" fill className="object-contain rounded-md" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-primary leading-none">RKM LOOM</span>
                    <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Spares & Service</span>
                </div>
            </div>
            <div className="flex-1 overflow-auto py-6 px-3">
                <nav className="grid gap-1.5">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4 bg-gray-50/50 dark:bg-sidebar/50">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
