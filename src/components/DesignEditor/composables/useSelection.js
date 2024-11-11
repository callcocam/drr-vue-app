import { ref, computed } from 'vue'

export function useSelection(elements) {
    const selectedElementIds = ref(new Set())

    const selectedElements = computed(() => {
        return new Set(selectedElementIds.value)
    })

    const selectedElement = computed(() => {
        if (selectedElementIds.value.size !== 1) return null
        const elementId = Array.from(selectedElementIds.value)[0]
        // Retorna o elemento completo, não apenas o ID
        return elements.value.find(el => el.id === elementId)
    })

    const hasSelection = computed(() => selectedElementIds.value.size > 0)
    const hasMultipleSelection = computed(() => selectedElementIds.value.size > 1)

    const selectElement = (elementId, event) => {
        if (event?.ctrlKey || event?.metaKey) {
            const newSelection = new Set(selectedElementIds.value)
            if (newSelection.has(elementId)) {
                newSelection.delete(elementId)
            } else {
                newSelection.add(elementId)
            }
            selectedElementIds.value = newSelection
        } else {
            selectedElementIds.value = new Set([elementId])
        }
    }

    const clearSelection = () => {
        selectedElementIds.value = new Set()
    }

    const addToSelection = (elementId) => {
        const newSelection = new Set(selectedElementIds.value)
        newSelection.add(elementId)
        selectedElementIds.value = newSelection
    }

    const removeFromSelection = (elementId) => {
        const newSelection = new Set(selectedElementIds.value)
        newSelection.delete(elementId)
        selectedElementIds.value = newSelection
    }

    const updateSelectionFromBox = (elementIds, event) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selectedElementIds.value = new Set()
        }
        elementIds.forEach(id => addToSelection(id))
    }

    return {
        selectedElementIds,
        selectedElements,
        selectedElement,
        hasSelection,
        hasMultipleSelection,
        selectElement,
        clearSelection,
        addToSelection,
        removeFromSelection,
        updateSelectionFromBox
    }
}