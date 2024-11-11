// composables/useCanvas.js
import { ref, computed } from 'vue'

export const useCanvas = () => {
    const canvasElements = ref([])
    const nextId = ref(1)
    const nextZIndex = ref(1)

    const createElement = (type, x, y) => {
        return {
            id: nextId.value++,
            type,
            x,
            y,
            width: 100,
            height: 100,
            rotation: 0,
            zIndex: nextZIndex.value++,
            backgroundColor: type === 'text' ? null : '#EEEEEE',
            borderColor: '#000000',
            borderWidth: 1,
            textColor: '#000000',
            fontSize: 16,
            fontFamily: 'Arial',
            text: type === 'text' ? 'Clique duas vezes para editar' : ''
        }
    }

    const addElement = (type, x, y) => {
        const newElement = createElement(type, x, y)
        canvasElements.value.push(newElement)
        return newElement
    }

    const removeElements = (elementIds) => {
        canvasElements.value = canvasElements.value.filter(
            element => !elementIds.has(element.id)
        )
    }

    const updateElement = (updatedElement) => {
        const index = canvasElements.value.findIndex(el => el.id === updatedElement.id)
        if (index !== -1) {
            canvasElements.value[index] = updatedElement
        }
    }

    return {
        canvasElements,
        createElement,
        addElement,
        removeElements,
        updateElement
    }
}