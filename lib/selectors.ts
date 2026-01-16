/**
 * CSS Selectors for Facebook Marketplace
 * @module selectors
 */

export const SELECTORS = {
  /** Product card link on marketplace feed */
  productCard: '.x17dddeq',

  /** Product title on item page */
  productTitle: '.xf7dkkf .x1xlr1w8',

  /** Product description on item page */
  productDescription: '.x126k92a .xo1l8bm',

  /** Seller name (also serves as profile link) */
  sellerName: '.xjp7ctv .x16ldp7u',

  /** Seller profile link for extracting seller ID */
  sellerProfileLink: '.xjp7ctv .x16ldp7u',

  /** Seller review count */
  sellerRating: '.xvq8zen.xi81zsa',

  /** Badge container element */
  badgeContainer: '.xdt5ytf.x1y1aw1k',

  /** Badge icon element (used to identify badge type) */
  badgeIcon: 'i[style*="background-image"]',
} as const;

/** Icon URLs to ignore when checking for seller badges */
export const IGNORED_BADGE_ICONS = [
  '_vw_H-fhi6f.png', // "On Facebook since XXXX"
] as const;

export type Selectors = typeof SELECTORS;
