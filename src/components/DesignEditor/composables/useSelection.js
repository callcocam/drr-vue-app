// composables/useSelection.js
import { ref, computed } from 'vue'

export const useSelection = () => {
    const selectedElementIds = ref(new Set())

    const hasSelection = computed(() => selectedElementIds.value.size > 0)
    const hasMultipleSelection = computed(() => selectedElementIds.value.size > 1)

    const clearSelection = () => {
        selectedElementIds.value = new Set()
    }

    const addToSelection = (elementId) => {
        const newSet = new Set(selectedElementIds.value)
        newSet.add(elementId)
        selectedElementIds.value = newSet
    }

    const removeFromSelection = (elementId) => {
        const newSet = new Set(selectedElementIds.value)
        newSet.delete(elementId)
        selectedElementIds.value = newSet
    }

    const selectElement = (element, event) => {
        if (event?.ctrlKey || event?.metaKey) {
            if (selectedElementIds.value.has(element.id)) {
                // removeFromSelection(element.id)
            } else {
                addToSelection(element.id)
            }
        } else {
            selectedElementIds.value = new Set([element.id])
        }
    }

    return {
        selectedElementIds,
        hasSelection,
        hasMultipleSelection,
        clearSelection,
        addToSelection,
        removeFromSelection,
        selectElement
    }
}