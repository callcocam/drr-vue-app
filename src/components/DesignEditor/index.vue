<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from './components/EditorSidebar.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorProperties from './components/EditorProperties.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import AlignmentToolbar from './components/AlignmentToolbar.vue'

import { useCanvas } from '@/composables/useCanvas'
import { useSelection } from '@/composables/useSelection'
import { useHistory } from '@/composables/useHistory'
import { useInteraction } from '@/composables/useInteraction'
import { useClipboard } from '@/composables/useClipboard'
import { useGuides } from '@/composables/useGuides'
import { useEventUtils } from '@/composables/useEventUtils'

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

const FONT_SIZES = [
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72
]

// ==================== Estado Local ====================
const dragPreview = ref({
    visible: false,
    x: 0,
    y: 0
})

// ==================== Composables ====================
const { canvasElements, addElement, removeElements, updateElement } = useCanvas()
const {
    selectedElementIds,
    hasSelection,
    hasMultipleSelection,
    clearSelection,
    selectElement,
    addToSelection,
    removeFromSelection
} = useSelection()

const { getEventPosition, getCanvasPosition } = useEventUtils()

const { interaction, startMove, startResize, startRotate, resetInteraction } = useInteraction(
    { getEventPosition },
    { clearSelection, addToSelection, selectedElementIds }
)

const { canUndo, canRedo, saveState, undo, redo } = useHistory(canvasElements, selectedElementIds)
const { clipboard, copyElements, pasteElements } = useClipboard()
const { guides, updateGuides, clearGuides } = useGuides()

// ==================== Computed Properties ====================
const selectedElementsArray = computed(() => {
    return Array.from(selectedElementIds.value)
        .map(id => canvasElements.value.find(el => el.id === id))
        .filter(Boolean)
})

const selectedElement = computed(() => {
    return selectedElementsArray.value.length === 1 ? selectedElementsArray.value[0] : null
})

const selectionBounds = computed(() => {
    if (!hasSelection.value) return null

    return selectedElementsArray.value.reduce((bounds, element) => {
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
})

// ==================== Event Handlers ====================
const handleElementSelect = (element, event) => {
    // Apenas seleciona o elemento
    selectElement(element, event)
}

const handleElementMouseDown = (element, event) => {
    // Inicia o movimento apenas se o elemento estiver selecionado
    if (selectedElementIds.value.has(element.id)) {
        startMove({
            event,
            element,
            selectedElements: selectedElementIds.value,
            selectedElementsArray: selectedElementsArray.value
        })
    }
}

const handleDragStart = ({ event, element }) => {
    event.dataTransfer.setData('text/plain', element.type)
    dragPreview.value.visible = true
}

const handleDragEnd = () => {
    dragPreview.value.visible = false
}

const handleDragOver = ({ event, canvasRef }) => {
    event.preventDefault()
    const rect = canvasRef.getBoundingClientRect()
    dragPreview.value.x = event.clientX - rect.left - 50
    dragPreview.value.y = event.clientY - rect.top - 50
}

const handleDrop = ({ event, canvasRef }) => {
    const type = event.dataTransfer.getData('text/plain')
    const rect = canvasRef.getBoundingClientRect()
    const x = event.clientX - rect.left - 50
    const y = event.clientY - rect.top - 50

    const newElement = addElement(type, x, y)
    selectElement(newElement)
    dragPreview.value.visible = false
    saveState()
}

const handleMouseMove = (event) => {
    if (!hasSelection.value) return

    const pos = getEventPosition(event)

    if (interaction.value.isMoving && interaction.value.initialElements) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        // Movimenta todos os elementos selecionados
        interaction.value.initialElements.forEach(initialState => {
            const element = canvasElements.value.find(el => el.id === initialState.id)
            if (element) {
                element.x = initialState.x + dx
                element.y = initialState.y + dy
            }
        })

        updateGuides(selectedElementIds.value, selectedElementsArray.value, canvasElements.value)
    }

    if (interaction.value.isResizing && selectedElement.value && interaction.value.initialElementState) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        selectedElement.value.width = Math.max(50, interaction.value.initialElementState.width + dx)
        selectedElement.value.height = Math.max(50, interaction.value.initialElementState.height + dy)
    }

    if (interaction.value.isRotating && selectedElement.value) {
        const element = selectedElement.value
        const centerX = element.x + element.width / 2
        const centerY = element.y + element.height / 2

        const angle = Math.atan2(
            pos.clientY - centerY,
            pos.clientX - centerX
        ) * (180 / Math.PI)

        element.rotation = angle
    }
}

const handleMouseUp = () => {
    if (interaction.value.isMoving || interaction.value.isResizing || interaction.value.isRotating) {
        saveState()
    }
    resetInteraction()
    clearGuides()
}

const handleCopy = () => {
    if (hasSelection.value) {
        copyElements(selectedElementsArray.value)
    }
}

const handlePaste = () => {
    const newElements = pasteElements()
    if (newElements.length) {
        canvasElements.value.push(...newElements)
        clearSelection()
        newElements.forEach(element => addToSelection(element.id))
        saveState()
    }
}

// ==================== Lifecycle Hooks ====================
onMounted(() => {
    const handleKeyDown = (event) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'c':
                    event.preventDefault()
                    handleCopy()
                    break

                case 'v':
                    event.preventDefault()
                    handlePaste()
                    break

                case 'z':
                    event.preventDefault()
                    if (event.shiftKey) redo()
                    else undo()
                    break

                case 'y':
                    event.preventDefault()
                    redo()
                    break

                case 'a':
                    event.preventDefault()
                    canvasElements.value.forEach(element => addToSelection(element.id))
                    break
            }
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault()
            if (hasSelection.value) {
                removeElements(selectedElementIds.value)
                clearSelection()
                saveState()
            }
        }
    }

    const handleGlobalMouseMove = (event) => {
        handleMouseMove(event)
    }

    const handleGlobalMouseUp = (event) => {
        handleMouseUp(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchmove', handleGlobalMouseMove)
    window.addEventListener('touchend', handleGlobalMouseUp)

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
        window.removeEventListener('touchmove', handleGlobalMouseMove)
        window.removeEventListener('touchend', handleGlobalMouseUp)
    })
})
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <EditorToolbar :can-undo="canUndo" :can-redo="canRedo" :has-selection="hasSelection"
            :has-multiple-selection="hasMultipleSelection" @undo="undo" @redo="redo" @copy="handleCopy"
            @paste="handlePaste" />

        <AlignmentToolbar :has-selection="hasSelection" :has-multiple-selection="hasMultipleSelection" />

        <div class="flex flex-1 overflow-hidden">
            <EditorSidebar :available-elements="AVAILABLE_ELEMENTS" @element-drag-start="handleDragStart"
                @element-drag-end="handleDragEnd" />

            <EditorCanvas :elements="canvasElements" :selected-elements="selectedElementIds"
                :selection-bounds="selectionBounds" :guides="guides" :drag-preview="dragPreview"
                :interaction="interaction" @element-click="handleElementSelect"
                @element-mousedown="handleElementMouseDown" @deselect="clearSelection"
                @add-to-selection="addToSelection" @remove-from-selection="removeFromSelection"
                @start-resize="startResize" @start-rotate="startRotate" @drop="handleDrop"
                @drag-over="handleDragOver" />

            <EditorProperties v-if="selectedElement" :element="selectedElement"
                :is-group="selectedElement.type === 'group'" :available-fonts="AVAILABLE_FONTS" :font-sizes="FONT_SIZES"
                @update:element="updateElement" @remove-element="() => {
                    removeElements(selectedElementIds.value)
                    clearSelection()
                }" />
        </div>
    </div>
</template>