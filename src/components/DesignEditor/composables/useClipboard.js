// composables/useClipboard.js
import { ref } from 'vue'

export const useClipboard = () => {
    const clipboard = ref(null)
    let idCounter = 1

    const generateUniqueId = () => {
        return Date.now() + '-' + (idCounter++)
    }

    const copyElements = (elements) => {
        clipboard.value = elements.map(element => ({ ...element }))
    }

    const pasteElements = () => {
        if (!clipboard.value?.length) return []

        const offset = 20
        return clipboard.value.map(element => ({
            ...element,
            id: generateUniqueId(),
            x: element.x + offset,
            y: element.y + offset,
            zIndex: Math.max(...clipboard.value.map(el => el.zIndex), 0) + 1
        }))
    }

    return {
        clipboard,
        copyElements,
        pasteElements,
        generateUniqueId
    }
}