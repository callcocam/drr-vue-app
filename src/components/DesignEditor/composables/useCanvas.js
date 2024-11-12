import { ref } from 'vue'

export const useCanvas = () => {
    const canvasElements = ref([])
    const generateUniqueId = () => Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    const createElement = (type, x, y, templateData = null) => {
        // Base properties for all elements
        const baseElement = {
            id: generateUniqueId(),
            type,
            x,
            y,
            rotation: 0,
            zIndex: Math.max(...canvasElements.value.map(el => el.zIndex), 0) + 1,
            borderColor: '#000000',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 0,
            lineHeight: '1.5',
        }

        // Se for um template
        if (type === 'template' && templateData) {
            return {
                ...baseElement,
                width: templateData.width || 300,
                height: templateData.height || 400,
                backgroundColor: 'transparent',
                template: templateData.template
            }
        }

        // Se for um elemento regular
        return {
            ...baseElement,
            width: 100,
            height: 100,
            backgroundColor: type === 'text' ? 'transparent' : '#EEEEEE',
            textColor: '#000000',
            fontSize: 16,
            fontFamily: 'Arial',
            text: type === 'text' ? 'Clique duas vezes para editar' : ''
        }
    }

    const addElement = (type, x, y, templateData = null) => {
        const newElement = createElement(type, x, y, templateData)
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
        addElement,
        removeElements,
        updateElement
    }
}