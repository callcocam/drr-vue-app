// composables/useEventUtils.js
export const useEventUtils = () => {
    const getEventPosition = (event) => {
        // Verifica se é um evento de touch
        if (event.touches) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            }
        }
        // Se não for touch, é um evento de mouse
        return {
            clientX: event.clientX,
            clientY: event.clientY
        }
    }

    // Função para obter a posição relativa ao canvas
    const getCanvasPosition = (event, canvasRef) => {
        const rect = canvasRef.getBoundingClientRect()
        const position = getEventPosition(event)
        return {
            x: position.clientX - rect.left,
            y: position.clientY - rect.top
        }
    }

    return {
        getEventPosition,
        getCanvasPosition
    }
}