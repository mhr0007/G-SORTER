import { markSellerAsSeen } from '@/lib/filters'
import type { Stats, Message, FilterResult } from '@/types'

/**
 * Background service worker for FB Marketplace Filter extension
 * Manages tab lifecycle, URL caching, and coordinates filtering results
 */

let isRunning = false
let seenSellerIds = new Set<string>()
let openedTabIds = new Set<number>()
let scannedUrls = new Set<string>()
let stats: Stats = createEmptyStats()

function createEmptyStats(): Stats {
  return {
    totalFound: 0,
    totalOpened: 0,
    pending: 0,
    passed: 0,
    filtered: 0,
    inProgress: false,
    byReason: {
      LOW_RATING: 0,
      BLACKLISTED_WORD: 0,
      SELLER_BADGE: 0,
      DUPLICATE_SELLER: 0,
    },
  }
}

function resetState(): void {
  isRunning = false
  seenSellerIds = new Set()
  openedTabIds = new Set()
  stats = createEmptyStats()
  // Note: scannedUrls is NOT reset - persists across scans
}

function clearUrlCache(): void {
  scannedUrls = new Set()
}

function broadcastStats(): void {
  stats.pending = openedTabIds.size
  browser.runtime.sendMessage({
    type: 'STATS_UPDATE',
    stats: { ...stats },
  } as Message).catch(() => {})
}

function extractProductId(url: string): string {
  const match = url.match(/\/marketplace\/item\/(\d+)/)
  return match?.[1] ?? url
}

function filterNewUrls(urls: string[]): string[] {
  const newUrls: string[] = []

  for (const url of urls) {
    const productId = extractProductId(url)
    if (!scannedUrls.has(productId)) {
      scannedUrls.add(productId)
      newUrls.push(url)
    }
  }

  return newUrls
}

async function openProductTabs(links: string[]): Promise<void> {
  const newLinks = filterNewUrls(links)

  if (newLinks.length === 0) {
    isRunning = false
    stats.inProgress = false
    broadcastStats()
    return
  }

  stats.totalFound += newLinks.length
  stats.inProgress = true
  broadcastStats()

  await Promise.allSettled(
    newLinks.map(async (url) => {
      if (!isRunning) return

      try {
        const tab = await browser.tabs.create({ url, active: false })
        if (tab.id) {
          openedTabIds.add(tab.id)
          stats.totalOpened++
          broadcastStats()
        }
      } catch (e) {
        console.error('[FBParser] Failed to open tab:', e)
      }
    })
  )
}

function handleProductResult(result: FilterResult, tabId: number): void {
  if (!openedTabIds.has(tabId)) return

  openedTabIds.delete(tabId)

  if (result.passed) {
    stats.passed++
    if (result.product.seller?.id) {
      markSellerAsSeen(result.product.seller.id, seenSellerIds)
    }
  } else {
    stats.filtered++
    result.reasons.forEach(reason => {
      if (reason.type in stats.byReason) {
        stats.byReason[reason.type as keyof typeof stats.byReason]++
      }
    })
    browser.tabs.remove(tabId).catch(() => {})
  }

  if (openedTabIds.size === 0) {
    stats.inProgress = false
    isRunning = false
  }

  broadcastStats()
}

async function startScan(sourceTabId?: number): Promise<void> {
  if (isRunning) return

  isRunning = true
  stats.inProgress = true
  broadcastStats()

  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  const tabId = sourceTabId ?? tabs[0]?.id

  if (tabId) {
    try {
      await browser.tabs.sendMessage(tabId, { type: 'GET_PRODUCT_LINKS' })
    } catch {
      isRunning = false
      stats.inProgress = false
      broadcastStats()
    }
  }
}

function stopScan(): void {
  isRunning = false
  stats.inProgress = false
  openedTabIds.forEach(id => browser.tabs.remove(id).catch(() => {}))
  openedTabIds.clear()
  broadcastStats()
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    switch (message.type) {
      case 'START_SCAN':
        startScan()
        sendResponse({ success: true })
        return true

      case 'STOP_SCAN':
        stopScan()
        sendResponse({ success: true })
        return true

      case 'GET_STATS':
        sendResponse({ stats: { ...stats, pending: openedTabIds.size }, isRunning })
        return true

      case 'CLEAR_CACHE':
        clearUrlCache()
        sendResponse({ success: true })
        return true

      case 'PRODUCT_LINKS':
        if (isRunning && message.links.length > 0) {
          openProductTabs(message.links)
        } else {
          isRunning = false
          stats.inProgress = false
          broadcastStats()
        }
        return true

      case 'PRODUCT_RESULT':
        if (sender.tab?.id) {
          const { product } = message.result
          let result = message.result

          if (result.passed && product.seller?.id && seenSellerIds.has(product.seller.id)) {
            result = {
              ...result,
              passed: false,
              reasons: [
                ...result.reasons,
                {
                  type: 'DUPLICATE_SELLER',
                  sellerId: product.seller.id,
                  sellerName: product.seller.name,
                },
              ],
            }
          }

          handleProductResult(result, sender.tab.id)
        }
        return true
    }

    return false
  })

  browser.tabs.onRemoved.addListener((tabId) => {
    if (!openedTabIds.has(tabId)) return

    openedTabIds.delete(tabId)

    if (openedTabIds.size === 0 && isRunning) {
      stats.inProgress = false
      isRunning = false
      broadcastStats()
    }
  })
})
