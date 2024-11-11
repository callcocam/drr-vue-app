// src/components/DesignEditor/index.vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorSidebar from './components/EditorSidebar.vue'
import EditorProperties from './components/EditorProperties.vue'
import { useSelection } from './composables/useSelection'
import { useElements } from './composables/useElements'
import { useHistory } from './composables/useHistory'
import { useInteraction } from './composables/useInteraction'
import { useGuides } from './composables/useGuides'
import { useDragAndDrop } from './composables/useDragAndDrop'

// ==================== Configurações ====================
const AVAILABLE_ELEMENTS = [
    { type: 'rectangle', label: 'Retângulo' },
    { type: 'circle', label: 'Círculo' },
    { type: 'text', label: 'Texto' }
]

const AVAILABLE_FONTS = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' }
]

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

// ==================== Funções Utilitárias ====================
const validateNumber = (value, defaultValue = 0) => {
    const num = Number(value)
    return !isNaN(num) ? num : defaultValue
}

// ==================== Composables ====================
const {
    elements,
    createElement,
    updateElement,
    removeElement,
    getElementByPosition
} = useElements()

const {
    selectedElements,
    selectedElement,
    hasSelection,
    hasMultipleSelection,
    selectElement,
    clearSelection,
    addToSelection,
    removeFromSelection,
    updateSelectionFromBox
} = useSelection(elements)

const {
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo
} = useHistory([])

const {
    interaction,
    startMove,
    startResize,
    startRotate,
    stopInteraction,
    getEventPosition
} = useInteraction()

const {
    guides,
    clearGuides,
    updateGuides
} = useGuides()

const {
    dragPreview,
    showPreview,
    hidePreview,
    updatePreviewPosition
} = useDragAndDrop()

// ==================== Event Handlers ====================
// Drag & Drop
const handleDragStart = ({ event, element }) => {
    if (!event) return
    event.dataTransfer.setData('elementType', element.type) // Mudamos a key para ser mais específica
    showPreview(0, 0)
}


const handleDragEnd = () => {
    hidePreview()
}

const handleDragOver = ({ event, canvasRef }) => {
    if (!event || !canvasRef) return
    updatePreviewPosition(event, canvasRef)
}


const handleDrop = ({ event, canvasRef }) => {
    if (!event || !canvasRef) return

    const type = event.dataTransfer.getData('elementType')
    if (!type) return

    const rect = canvasRef.getBoundingClientRect()
    const x = validateNumber(event.clientX - rect.left - 50)
    const y = validateNumber(event.clientY - rect.top - 50)

    const newElement = createElement(type, x, y)
    if (newElement) {
        // Certifique-se de que o elemento foi realmente criado
        addToHistory(elements.value)
        selectElement(newElement.id)
    }
    hidePreview()
}

// Element Manipulation
const handleElementSelect = (element, event) => {
    if (!element) return
    selectElement(element.id, event)
}

const handleElementMove = (event) => {
    if (!interaction.value || (!interaction.value.isMoving && !interaction.value.isResizing && !interaction.value.isRotating)) return

    const pos = getEventPosition(event)
    if (!pos) return


    if (interaction.value.isMoving && interaction.value.initialElements) {
        const dx = validateNumber(pos.clientX - interaction.value.initialMousePos.clientX)
        const dy = validateNumber(pos.clientY - interaction.value.initialMousePos.clientY)
        interaction.value.initialElements.forEach(initialElement => {
            if (!initialElement) return
            const elementIndex = elements.value.findIndex(el => el.id === initialElement.id)
            if (elementIndex !== -1) {
                elements.value[elementIndex] = {
                    ...elements.value[elementIndex],
                    x: validateNumber(initialElement.x + dx),
                    y: validateNumber(initialElement.y + dy)
                }
            }
        })

        if (selectedElement.value) {
            updateGuides(selectedElement.value, elements.value, selectedElements.value)
        }
    }

    if (interaction.value.isResizing && selectedElement.value && interaction.value.initialElementState) {
        const dx = validateNumber(pos.clientX - interaction.value.initialMousePos.clientX)
        const dy = validateNumber(pos.clientY - interaction.value.initialMousePos.clientY)

        const elementIndex = elements.value.findIndex(el => el.id === selectedElement.value.id)
        if (elementIndex !== -1) {
            elements.value[elementIndex] = {
                ...elements.value[elementIndex],
                width: Math.max(50, validateNumber(interaction.value.initialElementState.width + dx)),
                height: Math.max(50, validateNumber(interaction.value.initialElementState.height + dy))
            }
        }
    }

    if (interaction.value.isRotating && selectedElement.value) {
        const elementIndex = elements.value.findIndex(el => el.id === selectedElement.value.id)
        if (elementIndex !== -1) {
            const element = elements.value[elementIndex]
            const centerX = validateNumber(element.x + element.width / 2)
            const centerY = validateNumber(element.y + element.height / 2)

            const angle = validateNumber(Math.atan2(
                pos.clientY - centerY,
                pos.clientX - centerX
            ) * (180 / Math.PI))

            elements.value[elementIndex] = {
                ...elements.value[elementIndex],
                rotation: angle
            }
        }
    }
}

const handleMouseUp = () => {
    if (interaction.value && (interaction.value.isMoving || interaction.value.isResizing || interaction.value.isRotating)) {
        addToHistory(elements.value)
    }
    stopInteraction()
    clearGuides()
}

const handleStartMove = (data) => {
    if (!data || !data.element) return
    startMove(data, selectedElements.value, elements.value)
}

const handleElementUpdate = (updatedElement) => {
    if (!updatedElement || !updatedElement.id) return

    const validatedElement = {
        ...updatedElement,
        x: validateNumber(updatedElement.x),
        y: validateNumber(updatedElement.y),
        width: validateNumber(updatedElement.width, 100),
        height: validateNumber(updatedElement.height, 100),
        rotation: validateNumber(updatedElement.rotation),
        borderWidth: validateNumber(updatedElement.borderWidth, 1),
        borderRadius: validateNumber(updatedElement.borderRadius),
        fontSize: validateNumber(updatedElement.fontSize, 16),
        zIndex: validateNumber(updatedElement.zIndex, 1)
    }

    updateElement(validatedElement.id, validatedElement)
    addToHistory(elements.value)
}

const handleElementRemove = () => {
    if (!selectedElement.value) return
    removeElement(selectedElement.value.id)
    clearSelection()
    addToHistory(elements.value)
}

// Keyboard Shortcuts
const handleKeyDown = (event) => {
    if (!event) return

    if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
            case 'z':
                event.preventDefault()
                if (event.shiftKey) {
                    const nextState = redo()
                    if (nextState) {
                        elements.value = nextState
                        clearSelection()
                    }
                } else {
                    const previousState = undo()
                    if (previousState) {
                        elements.value = previousState
                        clearSelection()
                    }
                }
                break

            case 'a':
                event.preventDefault()
                elements.value.forEach(element => {
                    if (element) addToSelection(element.id)
                })
                break
        }
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        if (hasSelection.value) {
            Array.from(selectedElements.value).forEach(elementId => {
                if (elementId) removeElement(elementId)
            })
            clearSelection()
            addToHistory(elements.value)
        }
    }

    if (event.key === 'Escape') {
        clearSelection()
    }
}

// ==================== Lifecycle Hooks ====================
onMounted(() => {
    window.addEventListener('mousemove', handleElementMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchmove', handleElementMove)
    window.addEventListener('touchend', handleMouseUp)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleElementMove)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('touchmove', handleElementMove)
    window.removeEventListener('touchend', handleMouseUp)
})
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <EditorSidebar :available-elements="AVAILABLE_ELEMENTS" @element-drag-start="handleDragStart"
                @element-drag-end="handleDragEnd" />

            <!-- Canvas -->
            <EditorCanvas :elements="elements" :selected-elements="selectedElements" :guides="guides"
                :drag-preview="dragPreview" :interaction="interaction" @element-click="handleElementSelect"
                @deselect="clearSelection" @add-to-selection="addToSelection"
                @remove-from-selection="removeFromSelection" @update-selection="updateSelectionFromBox"
                @start-move="handleStartMove" @start-resize="startResize" @start-rotate="startRotate" @drop="handleDrop"
                @drag-over="handleDragOver" />

            <!-- Properties Panel -->
            <EditorProperties v-if="selectedElement" :element="selectedElement" :available-fonts="AVAILABLE_FONTS"
                :font-sizes="FONT_SIZES" @update:element="handleElementUpdate" @remove-element="handleElementRemove" />
        </div>
    </div>
</template>

<style>
.guide-line {
    position: absolute;
    background-color: rgb(59, 130, 246);
    pointer-events: none;
    opacity: 0.7;
}
</style>