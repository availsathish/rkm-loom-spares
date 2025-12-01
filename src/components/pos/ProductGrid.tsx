"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    code: string
    category: string
    sellingPrice: number
    stock: number
    imageUrl?: string | null
}

export function ProductGrid({ products }: { products: Product[] }) {
    const [search, setSearch] = useState("")
    const addToCart = useCartStore((state) => state.addToCart)

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search items by name, code, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg shadow-sm"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-1">
                {filteredProducts.map((product) => (
                    <Card
                        key={product.id}
                        className="cursor-pointer group hover:border-primary hover:shadow-md transition-all duration-200 border-gray-100 shadow-sm overflow-hidden"
                        onClick={() => addToCart(product)}
                    >
                        <CardContent className="p-0 flex flex-col h-full">
                            <div className="relative w-full h-32 bg-gray-50 overflow-hidden">
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                                            <span className="text-xs font-bold">IMG</span>
                                        </div>
                                        <span className="text-[10px]">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm",
                                        product.stock < 5 ? "bg-red-100 text-red-600" : "bg-white/90 text-green-700 backdrop-blur-sm"
                                    )}>
                                        {product.stock} left
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 flex flex-col flex-1">
                                <div className="mb-1">
                                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                        {product.code}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-sm leading-tight text-gray-800 line-clamp-2 mb-auto" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="font-bold text-primary">₹ {product.sellingPrice}</span>
                                    <Button size="sm" className="h-7 w-7 rounded-full p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-none">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p>No products found matching "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}
