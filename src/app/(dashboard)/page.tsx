"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    IndianRupee,
    Receipt,
    AlertTriangle,
    Plus,
    ShoppingCart,
    Users
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const [stats, setStats] = useState({
        todaySales: 0,
        todayBills: 0,
        lowStock: 0,
        salesGrowth: "0",
        billsGrowth: "0",
        yesterdaySales: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const res = await fetch("/api/dashboard")
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error("Failed to fetch dashboard stats")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today's Sales
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <IndianRupee className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">
                            {loading ? "..." : `₹ ${stats.todaySales.toLocaleString()}`}
                        </div>
                        <p className="text-xs font-medium flex items-center mt-1">
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full mr-1",
                                parseFloat(stats.salesGrowth) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {parseFloat(stats.salesGrowth) >= 0 ? "+" : ""}{stats.salesGrowth}%
                            </span>
                            <span className="text-muted-foreground">from yesterday</span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today's Bills
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">
                            {loading ? "..." : stats.todayBills}
                        </div>
                        <p className="text-xs font-medium flex items-center mt-1">
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full mr-1",
                                parseFloat(stats.billsGrowth) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {parseFloat(stats.billsGrowth) >= 0 ? "+" : ""}{stats.billsGrowth}%
                            </span>
                            <span className="text-muted-foreground">from yesterday</span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Low Stock Items
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">
                            {loading ? "..." : stats.lowStock}
                        </div>
                        <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                            <span className="bg-red-100 px-1.5 py-0.5 rounded-full mr-1">Alert</span> Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Link href="/pos">
                            <Button className="w-full h-24 flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-600 hover:text-primary transition-all shadow-none" variant="outline">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-semibold">New Bill (POS)</span>
                            </Button>
                        </Link>
                        <Link href="/products?action=new">
                            <Button className="w-full h-24 flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all shadow-none" variant="outline">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="font-semibold">Add Item</span>
                            </Button>
                        </Link>
                        <Link href="/customers?action=new">
                            <Button className="w-full h-24 flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all shadow-none" variant="outline">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="font-semibold">Add Customer</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Check Bills page for detailed activity.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
