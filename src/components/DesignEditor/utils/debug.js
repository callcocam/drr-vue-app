// src/utils/debug.js

const DEBUG = process.env.NODE_ENV === 'development'

export const debugLog = (label, data) => {
    if (!DEBUG) return

    console.group(`🎨 Editor: ${label}`)
    if (data) {
        console.log(data)
    }
    console.groupEnd()
}

export const measurePerformance = async (label, fn) => {
    if (!DEBUG) return fn()

    console.time(label)
    const result = await fn()
    console.timeEnd(label)
    return result
}