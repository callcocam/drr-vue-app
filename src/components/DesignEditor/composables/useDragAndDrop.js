import { ref } from 'vue'

export function useDragAndDrop() {
    const dragPreview = ref({
        visible: false,
        x: 0,
        y: 0
    })

    const showPreview = (x, y) => {
        dragPreview.value = {
            visible: true,
            x,
            y
        }
    }

    const hidePreview = () => {
        dragPreview.value.visible = false
    }

    const updatePreviewPosition = (event, canvasRef) => {
        if (!canvasRef || !dragPreview.value.visible) return

        const rect = canvasRef.getBoundingClientRect()
        dragPreview.value.x = event.clientX - rect.left - 50
        dragPreview.value.y = event.clientY - rect.top - 50
    }

    return {
        dragPreview,
        showPreview,
        hidePreview,
        updatePreviewPosition
    }
}