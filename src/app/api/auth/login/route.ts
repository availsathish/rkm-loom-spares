import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { login } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { mobile, password } = await request.json()

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { mobile: mobile },
                    { email: mobile }
                ]
            }
        })

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        await login({ id: user.id, name: user.name, role: user.role })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}
