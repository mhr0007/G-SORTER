import { SELECTORS, IGNORED_BADGE_ICONS } from './selectors'
import type { Product, Seller } from '@/types'

/**
 * Extracts seller ID from profile URL
 * @example "/marketplace/profile/123456/?..." -> "123456"
 */
function extractSellerId(url: string): string | null {
  const match = url.match(/\/marketplace\/profile\/(\d+)/)
  return match?.[1] ?? null
}

/**
 * Extracts product ID from URL
 * @example "/marketplace/item/123456/?..." -> "123456"
 */
function extractProductId(url: string): string {
  const match = url.match(/\/marketplace\/item\/(\d+)/)
  return match?.[1] ?? url
}

/**
 * Parses review count from text like "(5)"
 */
function parseReviewCount(text: string): number | null {
  const match = text.match(/\((\d+)\)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Checks if badge icon URL should be ignored
 */
function isIgnoredBadgeIcon(style: string): boolean {
  return IGNORED_BADGE_ICONS.some(icon => style.includes(icon))
}

/**
 * Parses seller badges, filtering out ignored ones (e.g., "On Facebook since")
 */
function parseSellerBadges(doc: Document): string[] {
  const badges: string[] = []
  const containers = doc.querySelectorAll(SELECTORS.badgeContainer)

  containers.forEach(container => {
    const icon = container.querySelector<HTMLElement>(SELECTORS.badgeIcon)
    const iconStyle = icon?.getAttribute('style') || ''

    if (isIgnoredBadgeIcon(iconStyle)) return

    const text = container.textContent?.trim()
    if (text) badges.push(text)
  })

  return badges
}

/**
 * Parses seller information from product page
 */
export function parseSeller(doc: Document = document): Seller | null {
  const profileLink = doc.querySelector<HTMLAnchorElement>(SELECTORS.sellerProfileLink)
  if (!profileLink) return null

  const name = profileLink.textContent?.trim() || 'Unknown'
  const profileUrl = profileLink.href || ''
  const id = extractSellerId(profileUrl) || `unknown-${Date.now()}`

  const ratingEl = doc.querySelector(SELECTORS.sellerRating)
  const rating = parseReviewCount(ratingEl?.textContent?.trim() || '')

  const badges = parseSellerBadges(doc)

  return { id, name, rating, profileUrl, badges }
}

/**
 * Parses product information from product page
 */
export function parseProduct(doc: Document = document): Product | null {
  try {
    const url = doc.location?.href || window.location.href
    const id = extractProductId(url)
    const title = doc.querySelector(SELECTORS.productTitle)?.textContent?.trim() || ''
    const description = doc.querySelector(SELECTORS.productDescription)?.textContent?.trim() || ''
    const seller = parseSeller(doc)

    return { id, url, title, description, seller }
  } catch {
    return null
  }
}

/**
 * Collects product links from marketplace feed page
 */
export function collectProductLinks(doc: Document = document): string[] {
  const cards = doc.querySelectorAll<HTMLAnchorElement>(SELECTORS.productCard)
  const links = new Set<string>()

  cards.forEach(card => {
    const href = card.href || card.querySelector('a')?.href
    if (href?.includes('/marketplace/item/')) {
      links.add(href)
    }
  })

  return [...links]
}
