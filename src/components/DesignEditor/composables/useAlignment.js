// src/components/DesignEditor/composables/useAlignment.js
export const useAlignment = (canvasElements, selectedElements, selectionBounds) => {
    const alignLeft = () => {
        if (!selectedElements.value.size) return
        const left = selectionBounds.value.left

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.x = left
            }
        })
    }

    const alignCenter = () => {
        if (!selectedElements.value.size) return
        const center = selectionBounds.value.centerX

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.x = center - element.width / 2
            }
        })
    }

    const alignRight = () => {
        if (!selectedElements.value.size) return
        const right = selectionBounds.value.right

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.x = right - element.width
            }
        })
    }

    const alignTop = () => {
        if (!selectedElements.value.size) return
        const top = selectionBounds.value.top

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.y = top
            }
        })
    }

    const alignMiddle = () => {
        if (!selectedElements.value.size) return
        const middle = selectionBounds.value.centerY

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.y = middle - element.height / 2
            }
        })
    }

    const alignBottom = () => {
        if (!selectedElements.value.size) return
        const bottom = selectionBounds.value.bottom

        selectedElements.value.forEach(elementId => {
            const element = canvasElements.value.find(el => el.id === elementId)
            if (element) {
                element.y = bottom - element.height
            }
        })
    }

    const distributeHorizontally = () => {
        if (selectedElements.value.size < 3) return

        const elements = Array.from(selectedElements.value)
            .map(id => canvasElements.value.find(el => el.id === id))
            .filter(Boolean)
            .sort((a, b) => a.x - b.x)

        const totalSpace = elements[elements.length - 1].x - elements[0].x
        const spacing = totalSpace / (elements.length - 1)

        elements.forEach((element, index) => {
            if (index > 0 && index < elements.length - 1) {
                element.x = elements[0].x + spacing * index
            }
        })
    }

    const distributeVertically = () => {
        if (selectedElements.value.size < 3) return

        const elements = Array.from(selectedElements.value)
            .map(id => canvasElements.value.find(el => el.id === id))
            .filter(Boolean)
            .sort((a, b) => a.y - b.y)

        const totalSpace = elements[elements.length - 1].y - elements[0].y
        const spacing = totalSpace / (elements.length - 1)

        elements.forEach((element, index) => {
            if (index > 0 && index < elements.length - 1) {
                element.y = elements[0].y + spacing * index
            }
        })
    }

    return {
        alignLeft,
        alignCenter,
        alignRight,
        alignTop,
        alignMiddle,
        alignBottom,
        distributeHorizontally,
        distributeVertically
    }
}