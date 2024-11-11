import { ref, computed } from 'vue'

export function useGuides() {
    const guides = ref({
        vertical: [],
        horizontal: []
    })

    const snapThreshold = 5

    const clearGuides = () => {
        guides.value = {
            vertical: [],
            horizontal: []
        }
    }

    const updateGuides = (movingElement, allElements, selectedElements) => {
        clearGuides()

        // Coleta posições dos elementos não selecionados
        const positions = {
            vertical: new Set(),
            horizontal: new Set()
        }

        allElements.forEach(element => {
            if (!selectedElements.has(element.id)) {
                // Linhas verticais
                positions.vertical.add(element.x) // Esquerda
                positions.vertical.add(element.x + element.width / 2) // Centro
                positions.vertical.add(element.x + element.width) // Direita

                // Linhas horizontais
                positions.horizontal.add(element.y) // Topo
                positions.horizontal.add(element.y + element.height / 2) // Meio
                positions.horizontal.add(element.y + element.height) // Base
            }
        })

        // Verifica alinhamentos
        const checkSnap = (value, positions, isHorizontal = false) => {
            let snapped = false
            let snappedPosition = value

            positions.forEach(pos => {
                const distance = Math.abs(value - pos)
                if (distance < snapThreshold && !snapped) {
                    snapped = true
                    snappedPosition = pos
                    if (isHorizontal) {
                        guides.value.horizontal.push({ position: pos })
                    } else {
                        guides.value.vertical.push({ position: pos })
                    }
                }
            })

            return snappedPosition
        }

        // Aplica snap para o elemento em movimento
        const elementCenter = {
            x: movingElement.x + movingElement.width / 2,
            y: movingElement.y + movingElement.height / 2
        }

        // Snap vertical
        movingElement.x = checkSnap(movingElement.x, positions.vertical)
        movingElement.x = checkSnap(elementCenter.x, positions.vertical) - movingElement.width / 2
        movingElement.x = checkSnap(movingElement.x + movingElement.width, positions.vertical) - movingElement.width

        // Snap horizontal
        movingElement.y = checkSnap(movingElement.y, positions.horizontal, true)
        movingElement.y = checkSnap(elementCenter.y, positions.horizontal, true) - movingElement.height / 2
        movingElement.y = checkSnap(movingElement.y + movingElement.height, positions.horizontal, true) - movingElement.height

        return movingElement
    }

    return {
        guides,
        clearGuides,
        updateGuides
    }
}