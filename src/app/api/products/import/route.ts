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
            // Map Excel columns to DB fields
            // Expected columns: Name, Code, Category, HSN, PurchasePrice, SellingPrice, Stock, Unit
            const product = {
                name: row['Name'] || row['name'],
                code: row['Code']?.toString() || row['code']?.toString(),
                category: row['Category'] || row['category'] || 'General',
                hsn: row['HSN']?.toString() || row['hsn']?.toString() || '',
                purchasePrice: parseFloat(row['PurchasePrice'] || row['purchasePrice'] || 0),
                sellingPrice: parseFloat(row['SellingPrice'] || row['sellingPrice'] || 0),
                stock: parseInt(row['Stock'] || row['stock'] || 0),
                unit: row['Unit'] || row['unit'] || 'pcs',
                imageUrl: row['ImageUrl'] || row['imageUrl'] || '',
            }

            if (product.name && product.code) {
                await prisma.product.upsert({
                    where: { code: product.code },
                    update: product,
                    create: product,
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
