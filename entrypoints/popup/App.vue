<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { Stats, Message } from "@/types";

const isRunning = ref(false);
const isLoading = ref(true);
const stats = ref<Stats>({
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
});

const progress = computed(() => {
    if (stats.value.totalFound === 0) return 0;
    const processed = stats.value.passed + stats.value.filtered;
    return Math.round((processed / stats.value.totalFound) * 100);
});

const isOnMarketplace = ref(false);

async function checkCurrentTab() {
    try {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        const url = tabs[0]?.url || "";
        isOnMarketplace.value =
            url.includes("facebook.com/marketplace") && !url.includes("/item/");
    } catch {
        isOnMarketplace.value = false;
    }
}

async function fetchStats() {
    try {
        const response = await browser.runtime.sendMessage({
            type: "GET_STATS",
        });
        if (response?.stats) {
            stats.value = response.stats;
            isRunning.value = response.isRunning;
        }
    } catch (error) {
        console.error("Failed to fetch stats:", error);
    }
}

async function startScan() {
    if (isRunning.value) return;
    try {
        await browser.runtime.sendMessage({ type: "START_SCAN" } as Message);
        isRunning.value = true;
    } catch (error) {
        console.error("Failed to start scan:", error);
    }
}

async function stopScan() {
    try {
        await browser.runtime.sendMessage({ type: "STOP_SCAN" } as Message);
        isRunning.value = false;
    } catch (error) {
        console.error("Failed to stop scan:", error);
    }
}

function handleMessage(message: Message) {
    if (message.type === "STATS_UPDATE") {
        stats.value = message.stats;
        isRunning.value = message.stats.inProgress;
    }
}

onMounted(async () => {
    await fetchStats();
    await checkCurrentTab();
    browser.runtime.onMessage.addListener(handleMessage);
    isLoading.value = false;
});

onUnmounted(() => {
    browser.runtime.onMessage.removeListener(handleMessage);
});
</script>

<template>
    <div class="container">
        <div v-if="isLoading" class="empty-state">
            <p class="text-muted">Loading...</p>
        </div>

        <div v-else-if="!isOnMarketplace" class="empty-state">
            <p class="text-muted">Open Facebook Marketplace to scan</p>
        </div>

        <template v-else>
            <button v-if="!isRunning" @click="startScan" class="btn">
                Start Scan
            </button>
            <button v-else @click="stopScan" class="btn btn-active">
                Stop
            </button>

            <div v-if="stats.totalFound > 0" class="results">
                <div class="progress-section">
                    <div class="progress-track">
                        <div
                            class="progress-bar"
                            :style="{ width: progress + '%' }"
                        ></div>
                    </div>
                    <span class="progress-label">{{ progress }}%</span>
                </div>

                <div v-if="stats.pending > 0" class="pending-indicator">
                    <span class="pending-dot"></span>
                    <span>{{ stats.pending }} loading...</span>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-number">{{ stats.totalFound }}</span>
                        <span class="stat-label">Found</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">{{ stats.totalOpened }}</span>
                        <span class="stat-label">Opened</span>
                    </div>
                    <div class="stat-card stat-card-accent">
                        <span class="stat-number">{{ stats.passed }}</span>
                        <span class="stat-label">Kept</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number stat-number-muted">{{
                            stats.filtered
                        }}</span>
                        <span class="stat-label">Closed</span>
                    </div>
                </div>

                <div v-if="stats.filtered > 0" class="breakdown">
                    <div
                        v-if="stats.byReason.LOW_RATING > 0"
                        class="breakdown-row"
                    >
                        <span>Has reviews</span>
                        <span class="breakdown-value">{{
                            stats.byReason.LOW_RATING
                        }}</span>
                    </div>
                    <div
                        v-if="stats.byReason.SELLER_BADGE > 0"
                        class="breakdown-row"
                    >
                        <span>Has badge</span>
                        <span class="breakdown-value">{{
                            stats.byReason.SELLER_BADGE
                        }}</span>
                    </div>
                    <div
                        v-if="stats.byReason.BLACKLISTED_WORD > 0"
                        class="breakdown-row"
                    >
                        <span>Pickup only</span>
                        <span class="breakdown-value">{{
                            stats.byReason.BLACKLISTED_WORD
                        }}</span>
                    </div>
                    <div
                        v-if="stats.byReason.DUPLICATE_SELLER > 0"
                        class="breakdown-row"
                    >
                        <span>Duplicate</span>
                        <span class="breakdown-value">{{
                            stats.byReason.DUPLICATE_SELLER
                        }}</span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.container {
    padding: 16px;
}

.empty-state {
    padding: 32px 0;
    text-align: center;
}

.text-muted {
    color: var(--muted-foreground);
    font-size: 13px;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 36px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.15s ease;
    background-color: var(--secondary);
    color: var(--secondary-foreground);
    border: 1px solid var(--border);
}

.btn:hover {
    background-color: var(--accent);
}

.btn-active {
    background-color: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
}

.btn-active:hover {
    opacity: 0.9;
}

.results {
    margin-top: 16px;
}

.progress-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.progress-track {
    flex: 1;
    height: 8px;
    background-color: var(--secondary);
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: var(--primary);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-label {
    font-size: 12px;
    color: var(--muted-foreground);
    min-width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.pending-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted-foreground);
    margin-bottom: 12px;
}

.pending-dot {
    width: 6px;
    height: 6px;
    background-color: #22c55e;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    background-color: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
}

.stat-card-accent {
    background-color: var(--primary);
    border-color: var(--primary);
}

.stat-card-accent .stat-number {
    color: var(--primary-foreground);
}

.stat-card-accent .stat-label {
    color: var(--primary-foreground);
    opacity: 0.7;
}

.stat-number {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
}

.stat-number-muted {
    color: var(--muted-foreground);
}

.stat-label {
    font-size: 10px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

.breakdown {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
}

.breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: var(--muted-foreground);
}

.breakdown-value {
    font-weight: 500;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
}
</style>
