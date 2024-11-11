import { ref, computed } from 'vue'

export function useElements() {
    const elements = ref([])
    const nextId = ref(1)
    const nextZIndex = ref(1)

    const validateNumber = (value, defaultValue = 0) => {
        const num = Number(value)
        return !isNaN(num) ? num : defaultValue
    }
    const createElement = (type, x, y) => {
        const element = {
            id: nextId.value++,
            type,
            x,
            y,
            width: 100,
            height: 100,
            rotation: 0,
            zIndex: nextZIndex.value++,
            backgroundColor: type === 'text' ? 'transparent' : '#EEEEEE',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 0,
            textColor: '#000000',
            fontSize: 16,
            fontFamily: 'Arial',
            text: type === 'text' ? 'Novo texto' : ''
        }

        elements.value = [...elements.value, element]
        return element
    }

    const updateElement = (elementId, updates) => {
        const index = elements.value.findIndex(el => el.id === elementId) 
        if (index !== -1) {
            elements.value[index] = { ...elements.value[index], ...updates }
        }
    }

    const removeElement = (elementId) => {
        elements.value = elements.value.filter(el => el.id !== elementId)
    }

    const getElementByPosition = (x, y) => {
        return elements.value.find(element => {
            const bounds = {
                left: element.x,
                right: element.x + element.width,
                top: element.y,
                bottom: element.y + element.height
            }
            return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom
        })
    }

    return {
        elements,
        createElement,
        updateElement,
        removeElement,
        getElementByPosition,
        validateNumber
    }
}
