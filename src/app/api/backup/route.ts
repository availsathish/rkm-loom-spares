import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'prisma/dev.db')

        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
        }

        const fileBuffer = fs.readFileSync(dbPath)

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.db"`,
                'Content-Type': 'application/x-sqlite3',
            },
        })
    } catch (error) {
        console.error('Backup error:', error)
        return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
    }
}
