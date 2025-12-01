import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        let count = 0
        for (const row of jsonData) {
            // Expected columns: Name, Mobile, Address, GST, Balance
            const customer = {
                name: row['Name'] || row['name'],
                mobile: row['Mobile']?.toString() || row['mobile']?.toString(),
                address: row['Address'] || row['address'] || '',
                gst: row['GST']?.toString() || row['gst']?.toString() || '',
                balance: parseFloat(row['Balance'] || row['balance'] || 0),
            }

            if (customer.name && customer.mobile) {
                await prisma.customer.upsert({
                    where: { mobile: customer.mobile },
                    update: customer,
                    create: customer,
                })
                count++
            }
        }

        return NextResponse.json({ success: true, count })
    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 })
    }
}
