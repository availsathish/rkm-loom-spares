import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BarChart3, Users, Package } from "lucide-react"
import Link from "next/link"

const reports = [
    {
        title: "Sales Report",
        description: "View daily and monthly sales performance.",
        icon: BarChart3,
        href: "/reports/sales",
        color: "text-blue-600",
    },
    {
        title: "Stock Report",
        description: "Current stock levels and low stock alerts.",
        icon: Package,
        href: "/reports/stock",
        color: "text-orange-600",
    },
    {
        title: "Customer Ledger",
        description: "View customer transaction history and balances.",
        icon: Users,
        href: "/reports/ledger",
        color: "text-green-600",
    },
    {
        title: "Outstanding Credit",
        description: "List of customers with pending payments.",
        icon: FileText,
        href: "/reports/outstanding",
        color: "text-red-600",
    },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground">
                    View and export business reports.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {reports.map((report) => (
                    <Link key={report.title} href={report.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {report.title}
                                </CardTitle>
                                <report.icon className={`h-4 w-4 ${report.color}`} />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {report.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
