import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
        return NextResponse.json({ success: false })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const uploadDir = path.join(process.cwd(), 'public/uploads')

    try {
        await require('fs/promises').mkdir(uploadDir, { recursive: true })
    } catch (e) {
        // Ignore if exists
    }

    const filepath = path.join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ success: false, error: 'Upload failed' })
    }
}
