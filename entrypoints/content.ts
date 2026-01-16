import { CONFIG } from '@/lib/constants'
import { collectProductLinks, parseProduct } from '@/lib/parser'
import { filterProduct } from '@/lib/filters'
import type { Message, FilterResult } from '@/types'

/**
 * Content script for Facebook Marketplace pages
 * Handles product link collection and individual product parsing
 */
export default defineContentScript({
  matches: ['*://*.facebook.com/marketplace/*'],

  main() {
    const isProductPage = window.location.href.includes('/marketplace/item/')
    const isMarketplaceFeed = !isProductPage && window.location.href.includes('/marketplace')

    browser.runtime.onMessage.addListener((message: Message | { type: string }, _sender, sendResponse) => {
      if (message.type === 'GET_PRODUCT_LINKS' && isMarketplaceFeed) {
        const links = collectProductLinks(document)
        browser.runtime.sendMessage({ type: 'PRODUCT_LINKS', links } as Message)
        sendResponse({ success: true })
        return true
      }

      if (message.type === 'CHECK_PRODUCT' && isProductPage) {
        checkProduct()
        sendResponse({ success: true })
        return true
      }

      return false
    })

    if (isProductPage) {
      setTimeout(checkProduct, CONFIG.PAGE_LOAD_DELAY)
    }
  },
})

/**
 * Parses current product page and sends result to background script
 */
function checkProduct(): void {
  const product = parseProduct(document)

  if (!product) {
    sendFailedResult()
    return
  }

  const result = filterProduct(product, new Set())
  browser.runtime.sendMessage({ type: 'PRODUCT_RESULT', result } as Message)
}

/**
 * Sends a failed parse result to background script
 */
function sendFailedResult(): void {
  const result: FilterResult = {
    product: {
      id: 'unknown',
      url: window.location.href,
      title: '',
      description: '',
      seller: null,
    },
    passed: false,
    reasons: [],
  }
  browser.runtime.sendMessage({ type: 'PRODUCT_RESULT', result } as Message)
}
