// composables/useInteraction.js
import { ref } from 'vue'

export const useInteraction = ({ getEventPosition }) => {
    const interaction = ref({
        isMoving: false,
        isResizing: false,
        isRotating: false,
        initialMousePos: { x: 0, y: 0 },
        initialElementState: null,
        initialElements: null
    })

    const startMove = ({ event, element, selectedElements, selectedElementsArray }) => {
        // Não inicia movimento se já estiver redimensionando ou rotacionando
        if (interaction.value.isResizing || interaction.value.isRotating) return

        const pos = getEventPosition(event)

        // Sempre armazena o estado inicial de todos os elementos selecionados
        interaction.value = {
            isMoving: true,
            isResizing: false,
            isRotating: false,
            initialMousePos: pos,
            initialElements: selectedElementsArray.map(el => ({ ...el })),
            initialElementState: { ...element }
        }
    }

    const startResize = ({ event, element }) => {
        if (!element) return

        const pos = getEventPosition(event)
        interaction.value = {
            isMoving: false,
            isResizing: true,
            isRotating: false,
            initialMousePos: pos,
            initialElementState: { ...element }
        }
    }

    const startRotate = ({ event, element }) => {
        if (!element) return

        const pos = getEventPosition(event)
        interaction.value = {
            isMoving: false,
            isResizing: false,
            isRotating: true,
            initialMousePos: pos,
            initialElementState: { ...element }
        }
    }

    const resetInteraction = () => {
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
        resetInteraction
    }
}