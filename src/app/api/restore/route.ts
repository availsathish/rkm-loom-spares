import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const dbPath = path.join(process.cwd(), 'prisma/dev.db')
        const backupPath = path.join(process.cwd(), `prisma/dev.db.bak-${Date.now()}`)

        // Backup current DB before overwriting
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath)
        }

        // Write new DB
        fs.writeFileSync(dbPath, buffer)

        // Disconnect to force reconnection on next request (might help with SQLite locking)
        await prisma.$disconnect()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Restore error:', error)
        return NextResponse.json({ success: false, error: 'Restore failed' }, { status: 500 })
    }
}
