// composables/useEventUtils.js
export const useEventUtils = () => {
    const getEventPosition = (event) => {
        if (!event) return null

        // Suporte para touch events
        if (event.touches && event.touches[0]) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            }
        }

        // Mouse events
        if (event.clientX !== undefined && event.clientY !== undefined) {
            return {
                clientX: event.clientX,
                clientY: event.clientY
            }
        }

        return null
    }

    const getCanvasPosition = (event, canvasRef) => {
        if (!event || !canvasRef) return null

        const rect = canvasRef.getBoundingClientRect()
        const pos = getEventPosition(event)
        if (!pos) return null

        return {
            x: pos.clientX - rect.left,
            y: pos.clientY - rect.top
        }
    }

    return {
        getEventPosition,
        getCanvasPosition
    }
}