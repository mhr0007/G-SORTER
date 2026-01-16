/**
 * Type definitions for FB Marketplace Filter extension
 * @module types
 */

export interface Seller {
  id: string
  name: string
  rating: number | null
  profileUrl: string
  badges: string[]
}

export interface Product {
  id: string
  url: string
  title: string
  description: string
  seller: Seller | null
}

export type FilterReason =
  | { type: 'LOW_RATING'; rating: number; minRequired: number }
  | { type: 'BLACKLISTED_WORD'; word: string; foundIn: 'title' | 'description' }
  | { type: 'SELLER_BADGE'; badge: string }
  | { type: 'DUPLICATE_SELLER'; sellerId: string; sellerName: string }

export interface FilterResult {
  product: Product
  passed: boolean
  reasons: FilterReason[]
}

export interface Stats {
  totalFound: number
  totalOpened: number
  pending: number
  passed: number
  filtered: number
  inProgress: boolean
  byReason: {
    LOW_RATING: number
    BLACKLISTED_WORD: number
    SELLER_BADGE: number
    DUPLICATE_SELLER: number
  }
}

export type Message =
  | { type: 'START_SCAN' }
  | { type: 'STOP_SCAN' }
  | { type: 'GET_STATS' }
  | { type: 'CLEAR_CACHE' }
  | { type: 'STATS_UPDATE'; stats: Stats }
  | { type: 'PRODUCT_LINKS'; links: string[] }
  | { type: 'CHECK_PRODUCT' }
  | { type: 'PRODUCT_RESULT'; result: FilterResult }
