export interface Category {
  id: number
  name: string
  description: string | null
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number | string
  stock: number
  category_id: number
  category?: Category | null
}

export type CategoryPayload = {
  name: string
  description: string | null
}

export type ProductPayload = {
  name: string
  description: string | null
  price: number
  stock: number
  category_id: number
}
