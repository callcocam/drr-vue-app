// src/components/DesignEditor/composables/useInteraction.js
import { ref } from 'vue'

export function useInteraction() {
    const interaction = ref({
        isMoving: false,
        isResizing: false,
        isRotating: false,
        initialMousePos: { x: 0, y: 0 },
        initialElementState: null,
        initialElements: null
    })

    const getEventPosition = (event) => {
        if (!event) return null

        if (event.touches && event.touches[0]) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            }
        }

        return {
            clientX: event.clientX,
            clientY: event.clientY
        }
    }

    const startMove = ({ event, element }, selectedElements, elements) => {
        const pos = getEventPosition(event)
        if (!pos) return

        // Salva o estado inicial de todos os elementos selecionados
        const initialElements = elements
            .filter(el => selectedElements.has(el.id))
            .map(el => ({ ...el }))  

        interaction.value = {
            isMoving: true,
            isResizing: false,
            isRotating: false,
            initialMousePos: pos,
            initialElementState: { ...element },
            initialElements
        } 
    }

    const startResize = ({ event, element }) => {
        const pos = getEventPosition(event)
        if (!pos) return

        interaction.value = {
            isMoving: false,
            isResizing: true,
            isRotating: false,
            initialMousePos: pos,
            initialElementState: { ...element },
            initialElements: null
        }
    }

    const startRotate = ({ event, element }) => {
        const pos = getEventPosition(event)
        if (!pos) return

        interaction.value = {
            isMoving: false,
            isResizing: false,
            isRotating: true,
            initialMousePos: pos,
            initialElementState: { ...element },
            initialElements: null
        }
    }

    const stopInteraction = () => {
        interaction.value = {
            isMoving: false,
            isResizing: false,
            isRotating: false,
            initialMousePos: { x: 0, y: 0 },
            initialElementState: null,
            initialElements: null
        }
    }

    return {
        interaction,
        startMove,
        startResize,
        startRotate,
        stopInteraction,
        getEventPosition
    }
}