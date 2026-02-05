// Large TypeScript file for benchmarking (~2000 lines)
import type { EventEmitter } from 'node:events'

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface User extends BaseEntity {
  email: string
  username: string
  firstName: string
  lastName: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  emailVerifiedAt?: Date
  profile?: UserProfile
  settings: UserSettings
}

export interface UserProfile {
  avatarUrl?: string
  bio?: string
  website?: string
  location?: string
  birthDate?: Date
  phoneNumber?: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  allowMessagesFrom: 'everyone' | 'friends' | 'nobody'
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest'

export interface Post extends BaseEntity {
  title: string
  content: string
  authorId: string
  categoryId: string
  tags: string[]
  status: PostStatus
  publishedAt?: Date
  viewCount: number
  likeCount: number
  commentCount: number
  isFeatured: boolean
  slug: string
}

export type PostStatus = 'draft' | 'published' | 'archived' | 'deleted'

export interface Comment extends BaseEntity {
  postId: string
  authorId: string
  parentId?: string
  content: string
  likeCount: number
  isApproved: boolean
}

export interface Category extends BaseEntity {
  name: string
  slug: string
  description?: string
  parentId?: string
  order: number
}

export interface Tag extends BaseEntity {
  name: string
  slug: string
  description?: string
  usageCount: number
}

export interface Media extends BaseEntity {
  filename: string
  originalFilename: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  metadata: MediaMetadata
}

export interface MediaMetadata {
  width?: number
  height?: number
  duration?: number
  format?: string
  codec?: string
  bitrate?: number
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public resource?: string,
    public id?: string,
  ) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(
    message: string,
    public reason?: string,
  ) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(
    message: string,
    public requiredPermission?: string,
  ) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract tableName: string
  protected abstract eventEmitter: EventEmitter

  async findById(id: string): Promise<T | null> {
    throw new Error('Not implemented')
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    throw new Error('Not implemented')
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    throw new Error('Not implemented')
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    throw new Error('Not implemented')
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async softDelete(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async restore(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    throw new Error('Not implemented')
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id)
    return entity !== null
  }

  protected generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  protected emitEvent(event: string, data: unknown): void {
    this.eventEmitter.emit(event, data)
  }
}

export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, unknown>
  include?: string[]
}

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Not implemented')
  }

  async findByUsername(username: string): Promise<User | null> {
    throw new Error('Not implemented')
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async verifyEmail(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async updateLastLogin(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async updateSettings(id: string, settings: Partial<UserSettings>): Promise<User | null> {
    throw new Error('Not implemented')
  }

  async updateProfile(id: string, profile: Partial<UserProfile>): Promise<User | null> {
    throw new Error('Not implemented')
  }
}

export class PostRepository extends BaseRepository<Post> {
  protected tableName = 'posts'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findBySlug(slug: string): Promise<Post | null> {
    throw new Error('Not implemented')
  }

  async findByAuthor(authorId: string, options?: QueryOptions): Promise<Post[]> {
    throw new Error('Not implemented')
  }

  async findByCategory(categoryId: string, options?: QueryOptions): Promise<Post[]> {
    throw new Error('Not implemented')
  }

  async findByTag(tagId: string, options?: QueryOptions): Promise<Post[]> {
    throw new Error('Not implemented')
  }

  async findFeatured(limit?: number): Promise<Post[]> {
    throw new Error('Not implemented')
  }

  async incrementViewCount(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async incrementLikeCount(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async incrementCommentCount(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async publish(id: string): Promise<Post | null> {
    throw new Error('Not implemented')
  }

  async archive(id: string): Promise<Post | null> {
    throw new Error('Not implemented')
  }
}

export class CommentRepository extends BaseRepository<Comment> {
  protected tableName = 'comments'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findByPost(postId: string, options?: QueryOptions): Promise<Comment[]> {
    throw new Error('Not implemented')
  }

  async findByAuthor(authorId: string, options?: QueryOptions): Promise<Comment[]> {
    throw new Error('Not implemented')
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    throw new Error('Not implemented')
  }

  async approve(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async incrementLikeCount(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }
}

export class CategoryRepository extends BaseRepository<Category> {
  protected tableName = 'categories'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findBySlug(slug: string): Promise<Category | null> {
    throw new Error('Not implemented')
  }

  async findChildren(parentId: string): Promise<Category[]> {
    throw new Error('Not implemented')
  }

  async findRoot(): Promise<Category[]> {
    throw new Error('Not implemented')
  }

  async reorder(updates: Array<{ id: string, order: number }>): Promise<boolean> {
    throw new Error('Not implemented')
  }
}

export class TagRepository extends BaseRepository<Tag> {
  protected tableName = 'tags'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    throw new Error('Not implemented')
  }

  async findPopular(limit: number): Promise<Tag[]> {
    throw new Error('Not implemented')
  }

  async incrementUsage(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }

  async decrementUsage(id: string): Promise<boolean> {
    throw new Error('Not implemented')
  }
}

export class MediaRepository extends BaseRepository<Media> {
  protected tableName = 'media'
  protected eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.eventEmitter = eventEmitter
  }

  async findByUploader(uploaderId: string, options?: QueryOptions): Promise<Media[]> {
    throw new Error('Not implemented')
  }

  async findByMimeType(mimeType: string, options?: QueryOptions): Promise<Media[]> {
    throw new Error('Not implemented')
  }

  async calculateTotalSize(uploaderId?: string): Promise<number> {
    throw new Error('Not implemented')
  }
}

export interface AuthService {
  login: (email: string, password: string) => Promise<{ user: User, token: string }>
  register: (data: RegisterData) => Promise<{ user: User, token: string }>
  logout: (token: string) => Promise<void>
  refreshToken: (token: string) => Promise<{ token: string }>
  verifyToken: (token: string) => Promise<User>
  resetPassword: (email: string) => Promise<void>
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>
}

export interface RegisterData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export class AuthServiceImpl implements AuthService {
  constructor(
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string): Promise<{ user: User, token: string }> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive')
    }

    const isValid = await this.passwordService.verify(password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    await this.userRepo.updateLastLogin(user.id)

    const token = await this.tokenService.generate(user)

    return { user, token }
  }

  async register(data: RegisterData): Promise<{ user: User, token: string }> {
    const existingUser = await this.userRepo.findByEmail(data.email)
    if (existingUser) {
      throw new ValidationError('Email already exists', 'email')
    }

    const existingUsername = await this.userRepo.findByUsername(data.username)
    if (existingUsername) {
      throw new ValidationError('Username already exists', 'username')
    }

    const passwordHash = await this.passwordService.hash(data.password)

    const user = await this.userRepo.create({
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: 'user',
      isActive: true,
      settings: this.getDefaultSettings(),
    })

    await this.emailService.sendVerificationEmail(user)

    const token = await this.tokenService.generate(user)

    return { user, token }
  }

  async logout(token: string): Promise<void> {
    await this.tokenService.revoke(token)
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const user = await this.tokenService.verify(token)
    const newToken = await this.tokenService.generate(user)
    return { token: newToken }
  }

  async verifyToken(token: string): Promise<User> {
    return this.tokenService.verify(token)
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      return
    }

    const resetToken = await this.tokenService.generateResetToken(user)
    await this.emailService.sendPasswordResetEmail(user, resetToken)
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const isValid = await this.passwordService.verify(oldPassword, user.passwordHash)
    if (!isValid) {
      throw new ValidationError('Invalid password', 'oldPassword')
    }

    const newPasswordHash = await this.passwordService.hash(newPassword)
    await this.userRepo.updatePassword(userId, newPasswordHash)
  }

  private getDefaultSettings(): UserSettings {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessagesFrom: 'everyone',
      },
    }
  }
}

export interface TokenService {
  generate: (user: User) => Promise<string>
  verify: (token: string) => Promise<User>
  revoke: (token: string) => Promise<void>
  generateResetToken: (user: User) => Promise<string>
  verifyResetToken: (token: string) => Promise<User>
}

export interface PasswordService {
  hash: (password: string) => Promise<string>
  verify: (password: string, hash: string) => Promise<boolean>
}

export interface EmailService {
  sendVerificationEmail: (user: User) => Promise<void>
  sendPasswordResetEmail: (user: User, token: string) => Promise<void>
  sendWelcomeEmail: (user: User) => Promise<void>
  sendNotification: (user: User, subject: string, content: string) => Promise<void>
}

export class PostService {
  constructor(
    private postRepo: PostRepository,
    private userRepo: UserRepository,
    private categoryRepo: CategoryRepository,
    private tagRepo: TagRepository,
  ) {}

  async createPost(
    authorId: string,
    data: {
      title: string
      content: string
      categoryId: string
      tags?: string[]
      status?: PostStatus
    },
  ): Promise<Post> {
    const author = await this.userRepo.findById(authorId)
    if (!author) {
      throw new NotFoundError('Author not found')
    }

    const category = await this.categoryRepo.findById(data.categoryId)
    if (!category) {
      throw new NotFoundError('Category not found')
    }

    const slug = this.generateSlug(data.title)

    const post = await this.postRepo.create({
      title: data.title,
      content: data.content,
      authorId,
      categoryId: data.categoryId,
      tags: data.tags || [],
      status: data.status || 'draft',
      slug,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isFeatured: false,
    })

    if (data.tags) {
      for (const tagName of data.tags) {
        const tag = await this.tagRepo.findBySlug(this.generateSlug(tagName))
        if (tag) {
          await this.tagRepo.incrementUsage(tag.id)
        }
      }
    }

    return post
  }

  async updatePost(
    postId: string,
    userId: string,
    data: Partial<Post>,
  ): Promise<Post> {
    const post = await this.postRepo.findById(postId)
    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (post.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own posts')
    }

    const updated = await this.postRepo.update(postId, data)
    if (!updated) {
      throw new Error('Failed to update post')
    }

    return updated
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepo.findById(postId)
    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (post.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only delete your own posts')
    }

    await this.postRepo.delete(postId)
  }

  async publishPost(postId: string, userId: string): Promise<Post> {
    const post = await this.postRepo.findById(postId)
    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (post.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only publish your own posts')
    }

    const published = await this.postRepo.publish(postId)
    if (!published) {
      throw new Error('Failed to publish post')
    }

    return published
  }

  async getPost(postId: string): Promise<Post> {
    const post = await this.postRepo.findById(postId)
    if (!post) {
      throw new NotFoundError('Post not found')
    }

    await this.postRepo.incrementViewCount(postId)

    return post
  }

  async getPosts(options?: QueryOptions): Promise<Post[]> {
    return this.postRepo.findAll(options)
  }

  async getPostsByAuthor(authorId: string, options?: QueryOptions): Promise<Post[]> {
    return this.postRepo.findByAuthor(authorId, options)
  }

  async getPostsByCategory(categoryId: string, options?: QueryOptions): Promise<Post[]> {
    return this.postRepo.findByCategory(categoryId, options)
  }

  async getFeaturedPosts(limit = 10): Promise<Post[]> {
    return this.postRepo.findFeatured(limit)
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

export class CommentService {
  constructor(
    private commentRepo: CommentRepository,
    private postRepo: PostRepository,
    private userRepo: UserRepository,
  ) {}

  async createComment(
    authorId: string,
    postId: string,
    content: string,
    parentId?: string,
  ): Promise<Comment> {
    const author = await this.userRepo.findById(authorId)
    if (!author) {
      throw new NotFoundError('Author not found')
    }

    const post = await this.postRepo.findById(postId)
    if (!post) {
      throw new NotFoundError('Post not found')
    }

    if (parentId) {
      const parent = await this.commentRepo.findById(parentId)
      if (!parent) {
        throw new NotFoundError('Parent comment not found')
      }
    }

    const comment = await this.commentRepo.create({
      postId,
      authorId,
      parentId,
      content,
      likeCount: 0,
      isApproved: true,
    })

    await this.postRepo.incrementCommentCount(postId)

    return comment
  }

  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const comment = await this.commentRepo.findById(commentId)
    if (!comment) {
      throw new NotFoundError('Comment not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (comment.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own comments')
    }

    const updated = await this.commentRepo.update(commentId, { content })
    if (!updated) {
      throw new Error('Failed to update comment')
    }

    return updated
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId)
    if (!comment) {
      throw new NotFoundError('Comment not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (comment.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only delete your own comments')
    }

    await this.commentRepo.delete(commentId)
    await this.postRepo.incrementCommentCount(comment.postId)
  }

  async getCommentsByPost(postId: string, options?: QueryOptions): Promise<Comment[]> {
    return this.commentRepo.findByPost(postId, options)
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return this.commentRepo.findReplies(commentId)
  }

  async approveComment(commentId: string, userId: string): Promise<Comment> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      throw new ForbiddenError('Only moderators and admins can approve comments')
    }

    await this.commentRepo.approve(commentId)

    const comment = await this.commentRepo.findById(commentId)
    if (!comment) {
      throw new Error('Failed to approve comment')
    }

    return comment
  }
}

export class MediaService {
  constructor(
    private mediaRepo: MediaRepository,
    private userRepo: UserRepository,
    private storageService: StorageService,
  ) {}

  async uploadMedia(
    userId: string,
    file: File,
    metadata?: Partial<MediaMetadata>,
  ): Promise<Media> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const filename = this.generateFilename(file.name)
    const url = await this.storageService.upload(file, filename)

    let thumbnailUrl: string | undefined
    if (this.isImage(file.type)) {
      thumbnailUrl = await this.storageService.generateThumbnail(file, filename)
    }

    const media = await this.mediaRepo.create({
      filename,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      thumbnailUrl,
      uploadedBy: userId,
      metadata: metadata || {},
    })

    return media
  }

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    const media = await this.mediaRepo.findById(mediaId)
    if (!media) {
      throw new NotFoundError('Media not found')
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (media.uploadedBy !== userId && user.role !== 'admin') {
      throw new ForbiddenError('You can only delete your own media')
    }

    await this.storageService.delete(media.filename)
    await this.mediaRepo.delete(mediaId)
  }

  async getMediaByUser(userId: string, options?: QueryOptions): Promise<Media[]> {
    return this.mediaRepo.findByUploader(userId, options)
  }

  async getUserStorageSize(userId: string): Promise<number> {
    return this.mediaRepo.calculateTotalSize(userId)
  }

  private generateFilename(originalFilename: string): string {
    const ext = originalFilename.split('.').pop()
    return `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }
}

export interface StorageService {
  upload: (file: File, filename: string) => Promise<string>
  delete: (filename: string) => Promise<void>
  generateThumbnail: (file: File, filename: string) => Promise<string>
  getUrl: (filename: string) => string
}

export interface File {
  name: string
  type: string
  size: number
  data: Buffer
}

export class CacheService {
  private cache: Map<string, { value: unknown, expiresAt: number }> = new Map()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  set(key: string, value: unknown, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: unknown[]): void {
    console.log(`[INFO] [${this.context}]`, message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] [${this.context}]`, message, ...args)
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    console.error(`[ERROR] [${this.context}]`, message, error, ...args)
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] [${this.context}]`, message, ...args)
    }
  }
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  isAllowed(key: string, maxRequests: number, windowSeconds: number): boolean {
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    let requests = this.requests.get(key) || []
    requests = requests.filter(timestamp => timestamp > windowStart)

    if (requests.length >= maxRequests) {
      return false
    }

    requests.push(now)
    this.requests.set(key, requests)

    return true
  }

  reset(key: string): void {
    this.requests.delete(key)
  }

  clear(): void {
    this.requests.clear()
  }
}

export class EventBus {
  private handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map()

  on(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.handlers.get(event) || []
    handlers.push(handler)
    this.handlers.set(event, handlers)
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.handlers.get(event) || []
    const index = handlers.indexOf(handler)
    if (index !== -1) {
      handlers.splice(index, 1)
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event) || []
    for (const handler of handlers) {
      handler(...args)
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}

export class Validator {
  static isEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return re.test(email)
  }

  static isUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    }
    catch {
      return false
    }
  }

  static isStrongPassword(password: string): boolean {
    return password.length >= 8
      && /[a-z]/.test(password)
      && /[A-Z]/.test(password)
      && /\d/.test(password)
      && /[^a-z\d]/i.test(password)
  }

  static isAlphanumeric(str: string): boolean {
    return /^[\dA-Z]+$/i.test(str)
  }

  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str)
  }

  static isAlpha(str: string): boolean {
    return /^[A-Z]+$/i.test(str)
  }

  static inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  static minLength(str: string, length: number): boolean {
    return str.length >= length
  }

  static maxLength(str: string, length: number): boolean {
    return str.length <= length
  }

  static matches(str: string, pattern: RegExp): boolean {
    return pattern.test(str)
  }
}

export class DateUtils {
  static now(): Date {
    return new Date()
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear()
      && date1.getMonth() === date2.getMonth()
      && date1.getDate() === date2.getDate()
  }

  static differenceInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  static format(date: Date, format: string): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }
}

export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  static truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) {
      return str
    }
    return str.substring(0, length) + suffix
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  static camelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toLowerCase())
  }

  static snakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
  }

  static kebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
  }

  static randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

export class ArrayUtils {
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  static unique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  static shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    }, {} as Record<string, T[]>)
  }

  static flatten<T>(array: (T | T[])[]): T[] {
    return array.reduce<T[]>((acc, val) => {
      return acc.concat(Array.isArray(val) ? val : [val])
    }, [])
  }
}
