// composables/useElementInteraction.js
import { ref } from 'vue'

export function useElementInteraction(props, emit) {
    const isDragging = ref(false)
    let startX = 0
    let startY = 0

    const handleMouseDown = (event) => {
        event.stopPropagation()
        isDragging.value = true
        startX = event.clientX
        startY = event.clientY

        emit('select', {
            element: props.element,
            event
        })
    }

    return {
        isDragging,
        handleMouseDown
    }
}