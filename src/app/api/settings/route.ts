import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const settings = await prisma.settings.findMany()
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)
        return NextResponse.json(settingsMap)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Upsert each setting
        for (const [key, value] of Object.entries(body)) {
            await prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }
}
