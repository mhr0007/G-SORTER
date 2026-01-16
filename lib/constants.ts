/**
 * Extension configuration constants
 * @module constants
 */

export const CONFIG = {
  /** Words/phrases that indicate no shipping available (case-insensitive) */
  EXCLUDE_WORDS: [
    // English - explicit no shipping
    'pick up only',
    'pickup only',
    'pick-up only',
    'collection only',
    'collect only',
    'no shipping',
    'no delivery',
    'no post',
    'no postage',
    'no mail',
    'no mailing',
    'cannot ship',
    'can not ship',
    "can't ship",
    'cant ship',
    'will not ship',
    "won't ship",
    'wont ship',
    'do not ship',
    "don't ship",
    'dont ship',
    'not shipping',
    'no shipping available',
    'shipping not available',
    'unable to ship',
    'unable to post',

    // Pickup variations
    'must pick up',
    'must pickup',
    'must collect',
    'buyer collects',
    'buyer to collect',
    'buyer to pick up',
    'buyer pickup',
    'buyer pick up',
    'cash on pickup',
    'cash on collection',
    'collect from',
    'pickup from',
    'pick up from',

    // Local only
    'local only',
    'local pickup',
    'local pick up',
    'local collection',
    'locals only',
    'local buyers only',
    'local buyer only',
    'local sale only',

    // Australian slang/variations
    'no delivers',
    'no couriers',
    'no courier',
    'no freight',

    // Abbreviated
    'p/u only',
    'p.u. only',
    'pu only',
  ],

  /** Delay between opening tabs in ms (0 = instant) */
  TAB_OPEN_DELAY: 0,

  /** Delay before parsing product page in ms */
  PAGE_LOAD_DELAY: 800,

  /** Max concurrent tabs (0 = unlimited) */
  MAX_CONCURRENT_TABS: 0,
} as const;

export type Config = typeof CONFIG;
