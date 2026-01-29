// Medium TypeScript file for benchmarking (~500 lines)
// @ts-expect-error -- no type declarations for express
import type { NextFunction, Request, Response } from 'express'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  tags: string[]
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  products: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: Address
  paymentMethod: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  priceAtPurchase: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe'

export class ProductRepository {
  private products: Map<string, Product> = new Map()

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null
  }

  async findAll(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    tags?: string[]
  }): Promise<Product[]> {
    let results = Array.from(this.products.values())

    if (filters?.category) {
      results = results.filter(p => p.category === filters.category)
    }

    if (filters?.minPrice !== undefined) {
      results = results.filter(p => p.price >= filters.minPrice!)
    }

    if (filters?.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filters.maxPrice!)
    }

    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag)),
      )
    }

    return results
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.products.set(newProduct.id, newProduct)
    return newProduct
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const product = await this.findById(id)
    if (!product) {
      return null
    }

    const updated = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    }
    this.products.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id)
  }

  private generateId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}

export class OrderRepository {
  private orders: Map<string, Order> = new Map()

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId)
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.status === status)
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.orders.set(newOrder.id, newOrder)
    return newOrder
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.findById(id)
    if (!order) {
      return null
    }

    order.status = status
    order.updatedAt = new Date()
    this.orders.set(id, order)
    return order
  }

  private generateId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}

export class OrderService {
  constructor(
    private productRepo: ProductRepository,
    private orderRepo: OrderRepository,
  ) {}

  async createOrder(
    userId: string,
    items: Array<{ productId: string, quantity: number }>,
    shippingAddress: Address,
    paymentMethod: PaymentMethod,
  ): Promise<Order> {
    const orderItems: OrderItem[] = []
    let totalAmount = 0

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      if (!product.inStock) {
        throw new Error(`Product ${product.name} is out of stock`)
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      })

      totalAmount += product.price * item.quantity
    }

    const order = await this.orderRepo.create({
      userId,
      products: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod,
    })

    return order
  }

  async processOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'pending') {
      throw new Error('Order cannot be processed')
    }

    const processed = await this.orderRepo.updateStatus(orderId, 'processing')
    if (!processed) {
      throw new Error('Failed to update order status')
    }

    return processed
  }

  async shipOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'processing') {
      throw new Error('Order must be in processing status')
    }

    const shipped = await this.orderRepo.updateStatus(orderId, 'shipped')
    if (!shipped) {
      throw new Error('Failed to update order status')
    }

    return shipped
  }

  async deliverOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'shipped') {
      throw new Error('Order must be in shipped status')
    }

    const delivered = await this.orderRepo.updateStatus(orderId, 'delivered')
    if (!delivered) {
      throw new Error('Failed to update order status')
    }

    return delivered
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status === 'delivered') {
      throw new Error('Cannot cancel delivered order')
    }

    const cancelled = await this.orderRepo.updateStatus(orderId, 'cancelled')
    if (!cancelled) {
      throw new Error('Failed to update order status')
    }

    return cancelled
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId)
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepo.findByStatus(status)
  }
}

export class ProductController {
  constructor(private productRepo: ProductRepository) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        tags: req.query.tags ? String(req.query.tags).split(',') : undefined,
      }

      const products = await this.productRepo.findAll(filters)
      res.json({ data: products, count: products.length })
    }
    catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productRepo.findById(req.params.id)
      if (!product) {
        res.status(404).json({ error: 'Product not found' })
        return
      }
      res.json({ data: product })
    }
    catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productRepo.create(req.body)
      res.status(201).json({ data: product })
    }
    catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productRepo.update(req.params.id, req.body)
      if (!product) {
        res.status(404).json({ error: 'Product not found' })
        return
      }
      res.json({ data: product })
    }
    catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await this.productRepo.delete(req.params.id)
      if (!deleted) {
        res.status(404).json({ error: 'Product not found' })
        return
      }
      res.status(204).send()
    }
    catch (error) {
      next(error)
    }
  }
}

export class OrderController {
  constructor(private orderService: OrderService) {}

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, items, shippingAddress, paymentMethod } = req.body
      const order = await this.orderService.createOrder(
        userId,
        items,
        shippingAddress,
        paymentMethod,
      )
      res.status(201).json({ data: order })
    }
    catch (error) {
      next(error)
    }
  }

  async processOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderService.processOrder(req.params.id)
      res.json({ data: order })
    }
    catch (error) {
      next(error)
    }
  }

  async shipOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderService.shipOrder(req.params.id)
      res.json({ data: order })
    }
    catch (error) {
      next(error)
    }
  }

  async deliverOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderService.deliverOrder(req.params.id)
      res.json({ data: order })
    }
    catch (error) {
      next(error)
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.orderService.cancelOrder(req.params.id)
      res.json({ data: order })
    }
    catch (error) {
      next(error)
    }
  }
}
