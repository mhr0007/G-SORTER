# G-SORTER

Chrome extension for filtering Facebook Marketplace listings. Finds new sellers without reviews or badges, with shipping available.

## What it does

- Opens all product listings from current Marketplace page
- Closes tabs that don't match criteria
- Keeps only listings from new sellers (no reviews, no badges)
- Filters out "pickup only" listings
- Deduplicates by seller (keeps one listing per seller)
- Caches scanned URLs to avoid duplicates on subsequent scans

## Install

### From Releases (easy)

1. Download latest `g-sorter-vX.X.X.zip` from [Releases](../../releases)
2. Unzip
3. Open `chrome://extensions/`
4. Enable Developer mode
5. Load unpacked → select `chrome-mv3` folder

### From Source

1. Clone repo
2. `bun install`
3. `bun run build`
4. Open `chrome://extensions/`
5. Enable Developer mode
6. Load unpacked → select `.output/chrome-mv3`

## Usage

1. Go to Facebook Marketplace
2. Click extension icon
3. Click "Start Scan"
4. Scroll down, load more listings, scan again — duplicates are skipped

## Config

Edit `lib/constants.ts` to modify:
- `EXCLUDE_WORDS` — phrases that indicate no shipping
- `PAGE_LOAD_DELAY` — wait time before parsing product page

Edit `lib/selectors.ts` to update:
- CSS selectors for Facebook elements
- `IGNORED_BADGE_ICONS` — badge icons to ignore (e.g., "On Facebook since")

---

Created by [@bronchitis](https://t.me/bronchitis)