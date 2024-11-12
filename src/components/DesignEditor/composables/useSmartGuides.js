// useSmartGuides.js
import { ref } from 'vue'

export function useSmartGuides() {
    const guides = ref([])
    const SNAP_THRESHOLD = 5 // Distância em pixels para ativar o snap

    const findAlignments = (movingElements, otherElements) => {
        const alignments = []
        const movingBounds = getSelectionBounds(movingElements)

        // Pontos de referência do elemento em movimento
        const movingPoints = {
            left: movingBounds.left,
            centerX: movingBounds.left + (movingBounds.right - movingBounds.left) / 2,
            right: movingBounds.right,
            top: movingBounds.top,
            centerY: movingBounds.top + (movingBounds.bottom - movingBounds.top) / 2,
            bottom: movingBounds.bottom
        }

        otherElements.forEach(other => {
            const otherBounds = {
                left: other.x,
                right: other.x + other.width,
                top: other.y,
                bottom: other.y + other.height
            }

            const otherPoints = {
                left: otherBounds.left,
                centerX: otherBounds.left + (otherBounds.right - otherBounds.left) / 2,
                right: otherBounds.right,
                top: otherBounds.top,
                centerY: otherBounds.top + (otherBounds.bottom - otherBounds.top) / 2,
                bottom: otherBounds.bottom
            }

            function checkAlignment(type, value1, value2, position) {
                const diff = Math.abs(value1 - value2)
                if (diff <= SNAP_THRESHOLD) {
                    const guide = {
                        type,
                        position: value2,
                        start: type === 'vertical'
                            ? Math.min(movingBounds.top, otherBounds.top) - 1000
                            : Math.min(movingBounds.left, otherBounds.left) - 1000,
                        end: type === 'vertical'
                            ? Math.max(movingBounds.bottom, otherBounds.bottom) + 1000
                            : Math.max(movingBounds.right, otherBounds.right) + 1000,
                        className: `guide-${position}`
                    }
                    alignments.push(guide)
                }
            }

            // Verificar alinhamentos verticais
            checkAlignment('vertical', movingPoints.left, otherPoints.left, 'left')
            checkAlignment('vertical', movingPoints.left, otherPoints.right, 'left-to-right')
            checkAlignment('vertical', movingPoints.centerX, otherPoints.centerX, 'center')
            checkAlignment('vertical', movingPoints.right, otherPoints.left, 'right-to-left')
            checkAlignment('vertical', movingPoints.right, otherPoints.right, 'right')

            // Verificar alinhamentos horizontais
            checkAlignment('horizontal', movingPoints.top, otherPoints.top, 'top')
            checkAlignment('horizontal', movingPoints.top, otherPoints.bottom, 'top-to-bottom')
            checkAlignment('horizontal', movingPoints.centerY, otherPoints.centerY, 'center')
            checkAlignment('horizontal', movingPoints.bottom, otherPoints.top, 'bottom-to-top')
            checkAlignment('horizontal', movingPoints.bottom, otherPoints.bottom, 'bottom')
        })

        return alignments
    }

    const getSelectionBounds = (elements) => {
        return elements.reduce((bounds, element) => {
            if (!bounds) {
                return {
                    left: element.x,
                    top: element.y,
                    right: element.x + element.width,
                    bottom: element.y + element.height
                }
            }

            return {
                left: Math.min(bounds.left, element.x),
                top: Math.min(bounds.top, element.y),
                right: Math.max(bounds.right, element.x + element.width),
                bottom: Math.max(bounds.bottom, element.y + element.height)
            }
        }, null)
    }

    const updateGuides = (selectedElementIds, selectedElements, allElements) => {
        if (!selectedElements?.length || !allElements?.length) {
            clearGuides()
            return
        }

        // Filtra os elementos que não estão selecionados
        const otherElements = allElements.filter(
            element => !selectedElementIds.has(element.id)
        )

        // Encontra os alinhamentos
        guides.value = findAlignments(selectedElements, otherElements)
    }

    const clearGuides = () => {
        guides.value = []
    }

    return {
        guides,
        updateGuides,
        clearGuides
    }
}