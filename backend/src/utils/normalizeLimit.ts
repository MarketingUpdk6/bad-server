export default function normalizeLimit(value: unknown): number {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return 10
    }

    const limit = Number(value)

    if (!Number.isSafeInteger(limit) || limit < 1) {
        return 10
    }

    return Math.min(limit, 10)
}
