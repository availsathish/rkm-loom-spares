import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // 1. Today's Sales & Bills
        const todayBills = await prisma.bill.findMany({
            where: { createdAt: { gte: today } }
        })
        const todaySalesAmount = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
        const todayBillsCount = todayBills.length

        // 2. Yesterday's Sales (for growth)
        const yesterdayBills = await prisma.bill.findMany({
            where: {
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        })
        const yesterdaySalesAmount = yesterdayBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
        const yesterdayBillsCount = yesterdayBills.length

        // 3. Low Stock Items
        const lowStockCount = await prisma.product.count({
            where: { stock: { lt: 5 } }
        })

        // 4. Sales Growth Calculation
        let salesGrowth = 0
        if (yesterdaySalesAmount > 0) {
            salesGrowth = ((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount) * 100
        } else if (todaySalesAmount > 0) {
            salesGrowth = 100 // 100% growth if yesterday was 0
        }

        let billsGrowth = 0
        if (yesterdayBillsCount > 0) {
            billsGrowth = ((todayBillsCount - yesterdayBillsCount) / yesterdayBillsCount) * 100
        } else if (todayBillsCount > 0) {
            billsGrowth = 100
        }

        return NextResponse.json({
            todaySales: todaySalesAmount,
            todayBills: todayBillsCount,
            lowStock: lowStockCount,
            salesGrowth: salesGrowth.toFixed(1),
            billsGrowth: billsGrowth.toFixed(1),
            yesterdaySales: yesterdaySalesAmount
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
    }
}
