import { create } from 'zustand'

export interface CartItem {
    productId: string
    name: string
    code: string
    price: number
    qty: number
    stock: number
    product: any
}

interface CartState {
    items: CartItem[]
    customer: any | null
    discount: number
    transportCharge: number
    addToCart: (product: any) => void
    removeFromCart: (productId: string) => void
    updateQty: (productId: string, qty: number) => void
    setCustomer: (customer: any) => void
    setDiscount: (amount: number) => void
    setTransportCharge: (amount: number) => void
    clearCart: () => void
    totalAmount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    customer: null,
    discount: 0,
    transportCharge: 0,

    addToCart: (product) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === product.id)

        if (existing) {
            if (existing.qty >= product.stock) return // Prevent adding more than stock
            set({
                items: items.map((i) =>
                    i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
                ),
            })
        } else {
            set({
                items: [
                    ...items,
                    {
                        productId: product.id,
                        name: product.name,
                        code: product.code,
                        price: product.sellingPrice,
                        qty: 1,
                        stock: product.stock,
                        product: product
                    },
                ],
            })
        }
    },

    removeFromCart: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
    },

    updateQty: (productId, qty) => {
        if (qty < 1) return
        const { items } = get()
        const item = items.find(i => i.productId === productId)
        if (item && qty > item.stock) return // Check stock limit

        set({
            items: items.map((i) =>
                i.productId === productId ? { ...i, qty } : i
            ),
        })
    },

    setCustomer: (customer) => set({ customer }),
    setDiscount: (discount) => set({ discount }),
    setTransportCharge: (transportCharge) => set({ transportCharge }),
    clearCart: () => set({ items: [], customer: null, discount: 0, transportCharge: 0 }),

    totalAmount: () => {
        const { items, discount, transportCharge } = get()
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
        return subtotal - discount + transportCharge
    },
}))
