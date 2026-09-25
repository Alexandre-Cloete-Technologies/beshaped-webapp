export interface Product {
  id: string,
  title: string,
  description: string,
  price: number,
  currency: string,
  coverImage: string,
  pdf: string,
  duration: string,
  level: string,
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}