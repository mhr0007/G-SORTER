import { CONFIG } from './constants'
import type { Product, FilterResult, FilterReason } from '@/types'

/**
 * Checks if text contains any excluded words (case-insensitive)
 */
function containsExcludedWord(text: string): string | null {
  const lowerText = text.toLowerCase()
  return CONFIG.EXCLUDE_WORDS.find(word => lowerText.includes(word.toLowerCase())) ?? null
}

/**
 * Filters a product based on seller criteria
 *
 * Keeps products where seller:
 * - Has NO reviews (new seller)
 * - Has NO badges (e.g., "Highly Rated")
 * - Listing has shipping available (no "pick up only")
 * - Is not a duplicate seller
 */
export function filterProduct(product: Product, seenSellerIds: Set<string>): FilterResult {
  const reasons: FilterReason[] = []

  // Reject if seller has reviews
  if (product.seller?.rating && product.seller.rating > 0) {
    reasons.push({
      type: 'LOW_RATING',
      rating: product.seller.rating,
      minRequired: 0,
    })
  }

  // Reject if seller has badges
  if (product.seller?.badges.length) {
    reasons.push({
      type: 'SELLER_BADGE',
      badge: product.seller.badges[0],
    })
  }

  // Reject if pickup only (no shipping)
  const fullText = `${product.title} ${product.description}`
  const excludedWord = containsExcludedWord(fullText)
  if (excludedWord) {
    reasons.push({
      type: 'BLACKLISTED_WORD',
      word: excludedWord,
      foundIn: 'description',
    })
  }

  // Reject if duplicate seller
  if (product.seller?.id && seenSellerIds.has(product.seller.id)) {
    reasons.push({
      type: 'DUPLICATE_SELLER',
      sellerId: product.seller.id,
      sellerName: product.seller.name,
    })
  }

  return {
    product,
    passed: reasons.length === 0,
    reasons,
  }
}

/**
 * Marks a seller as seen for duplicate detection
 */
export function markSellerAsSeen(sellerId: string, seenSellerIds: Set<string>): void {
  seenSellerIds.add(sellerId)
}
