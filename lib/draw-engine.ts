/**
 * Golf Draw Engine
 * Supports two modes:
 * 1. Random - pure random number generation (1-45)
 * 2. Algorithmic - weighted by frequency of user scores across all active subscribers
 */

export type DrawMode = 'random' | 'algorithmic'

export interface DrawNumbers {
    numbers: number[]
    mode: DrawMode
    generatedAt: string
}

export interface MatchResult {
    userId: string
    userScores: number[]
    matchedNumbers: number[]
    matchCount: 0 | 3 | 4 | 5
    prizeAmount: number
}

export interface PrizePool {
    total: number
    jackpot: number      // 40% + rollover
    fourMatch: number    // 35%
    threeMatch: number   // 25%
    rolloverAmount: number
}

/**
 * Generate 5 unique draw numbers (1-45)
 */
export function generateDrawNumbers(
    mode: DrawMode,
    allUserScores?: number[]
): DrawNumbers {
    let numbers: number[]

    if (mode === 'algorithmic' && allUserScores && allUserScores.length > 0) {
        numbers = algorithmicDraw(allUserScores)
    } else {
        numbers = randomDraw()
    }

    return {
        numbers,
        mode,
        generatedAt: new Date().toISOString(),
    }
}

/**
 * Pure random draw — selects 5 unique numbers from 1-45
 */
function randomDraw(): number[] {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1)
    const selected: number[] = []

    while (selected.length < 5) {
        const idx = Math.floor(Math.random() * pool.length)
        selected.push(pool[idx])
        pool.splice(idx, 1)
    }

    return selected.sort((a, b) => a - b)
}

/**
 * Algorithmic draw — prefers numbers that appear most frequently in user scores
 * This makes the draw more likely to have winners, increasing engagement
 */
function algorithmicDraw(allScores: number[]): number[] {
    // Build frequency map
    const freq: Record<number, number> = {}
    for (let i = 1; i <= 45; i++) freq[i] = 0
    for (const score of allScores) {
        if (score >= 1 && score <= 45) freq[score]++
    }

    // Build weighted pool — numbers with more scores get more entries
    const weightedPool: number[] = []
    for (let num = 1; num <= 45; num++) {
        const weight = Math.max(1, freq[num])
        for (let w = 0; w < weight; w++) {
            weightedPool.push(num)
        }
    }

    // Select 5 unique numbers from weighted pool
    const selected: number[] = []
    const remaining = [...weightedPool]

    while (selected.length < 5 && remaining.length > 0) {
        const idx = Math.floor(Math.random() * remaining.length)
        const num = remaining[idx]
        if (!selected.includes(num)) {
            selected.push(num)
        }
        remaining.splice(idx, 1)
    }

    // Fill up if needed
    while (selected.length < 5) {
        const candidates = Array.from({ length: 45 }, (_, i) => i + 1).filter(
            (n) => !selected.includes(n)
        )
        selected.push(candidates[Math.floor(Math.random() * candidates.length)])
    }

    return selected.sort((a, b) => a - b)
}

/**
 * Check how many numbers a user's scores match with the draw numbers
 */
export function checkMatch(
    userScores: number[],
    drawNumbers: number[]
): number[] {
    return userScores.filter((score) => drawNumbers.includes(score))
}

/**
 * Calculate prize pool based on active subscriber count and plan
 */
export function calculatePrizePool(
    activeSubscribers: number,
    monthlyRevenue: number, // in pence
    rolloverAmount: number = 0
): PrizePool {
    // Assume 60% of subscription goes to prize pool
    const poolContributionRate = 0.6
    const total = Math.floor(monthlyRevenue * poolContributionRate)

    const jackpotBase = Math.floor(total * 0.4)
    const fourMatch = Math.floor(total * 0.35)
    const threeMatch = Math.floor(total * 0.25)

    return {
        total,
        jackpot: jackpotBase + rolloverAmount,
        fourMatch,
        threeMatch,
        rolloverAmount,
    }
}

/**
 * Process draw results — match all users and calculate prizes
 */
export function processDraw(
    drawNumbers: number[],
    userScoreMap: Record<string, number[]>,
    prizePool: PrizePool
): MatchResult[] {
    const results: MatchResult[] = []

    // Find all winners
    const fiveMatchWinners: string[] = []
    const fourMatchWinners: string[] = []
    const threeMatchWinners: string[] = []

    for (const [userId, scores] of Object.entries(userScoreMap)) {
        const matched = checkMatch(scores, drawNumbers)
        if (matched.length >= 5) fiveMatchWinners.push(userId)
        else if (matched.length === 4) fourMatchWinners.push(userId)
        else if (matched.length === 3) threeMatchWinners.push(userId)
    }

    // Calculate per-winner prize (split equally)
    fiveMatchWinners.forEach((userId) => {
        results.push({
            userId,
            userScores: userScoreMap[userId],
            matchedNumbers: checkMatch(userScoreMap[userId], drawNumbers),
            matchCount: 5,
            prizeAmount: fiveMatchWinners.length > 0
                ? Math.floor(prizePool.jackpot / fiveMatchWinners.length)
                : 0,
        })
    })

    fourMatchWinners.forEach((userId) => {
        results.push({
            userId,
            userScores: userScoreMap[userId],
            matchedNumbers: checkMatch(userScoreMap[userId], drawNumbers),
            matchCount: 4,
            prizeAmount: fourMatchWinners.length > 0
                ? Math.floor(prizePool.fourMatch / fourMatchWinners.length)
                : 0,
        })
    })

    threeMatchWinners.forEach((userId) => {
        results.push({
            userId,
            userScores: userScoreMap[userId],
            matchedNumbers: checkMatch(userScoreMap[userId], drawNumbers),
            matchCount: 3,
            prizeAmount: threeMatchWinners.length > 0
                ? Math.floor(prizePool.threeMatch / threeMatchWinners.length)
                : 0,
        })
    })

    return results
}
