<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from './components/EditorSidebar.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorProperties from './components/EditorProperties.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import AlignmentToolbar from './components/AlignmentToolbar.vue'

import { useCanvas } from '@/components/DesignEditor/composables/useCanvas'
import { useSelection } from '@/components/DesignEditor/composables/useSelection'
import { useHistory } from '@/components/DesignEditor/composables/useHistory'
import { useInteraction } from '@/components/DesignEditor/composables/useInteraction'
import { useClipboard } from '@/components/DesignEditor/composables/useClipboard'
import { useGuides } from '@/components/DesignEditor/composables/useGuides'
import { useEventUtils } from '@/components/DesignEditor/composables/useEventUtils'

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
    { getEventPosition }
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
    if (!element) return

    // Primeiro faz a seleção
    selectElement(element, event)
}

const handleElementMouseDown = (element, event) => {
    if (!element || !selectedElementIds.value) return

    if (!selectedElementIds.value.has(element.id)) {
        // Se o elemento não está selecionado, seleciona primeiro
        selectElement(element, event)
    }

    // Inicia o movimento com os elementos atualmente selecionados
    startMove({
        event,
        element,
        selectedElements: selectedElementIds.value,
        selectedElementsArray: selectedElementsArray.value
    })
}


const handleDragStart = ({ event, element }) => {
    if (!event?.dataTransfer || !element) return
    event.dataTransfer.setData('text/plain', element.type)
    dragPreview.value.visible = true
}

const handleDragEnd = () => {
    dragPreview.value.visible = false
}

const handleDragOver = ({ event, canvasRef }) => {
    if (!event || !canvasRef) return
    event.preventDefault()
    const rect = canvasRef.getBoundingClientRect()
    dragPreview.value.x = event.clientX - rect.left - 50
    dragPreview.value.y = event.clientY - rect.top - 50
}

const handleDrop = ({ event, canvasRef }) => {
    if (!event?.dataTransfer || !canvasRef) return

    const type = event.dataTransfer.getData('text/plain')
    const rect = canvasRef.getBoundingClientRect()
    const x = event.clientX - rect.left - 50
    const y = event.clientY - rect.top - 50

    const newElement = addElement(type, x, y)
    if (newElement) {
        selectElement(newElement)
        dragPreview.value.visible = false
        saveState()
    }
}

const handleMouseMove = (event) => {
    if (!hasSelection.value) return

    const pos = getEventPosition(event)

    if (interaction.value.isMoving && interaction.value.initialElements?.length > 0) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        // Move todos os elementos selecionados
        selectedElementsArray.value.forEach(element => {
            const initialState = interaction.value.initialElements.find(
                el => el.id === element.id
            )
            if (initialState) {
                element.x = initialState.x + dx
                element.y = initialState.y + dy
            }
        })

        if (typeof updateGuides === 'function') {
            updateGuides(selectedElementIds.value, selectedElementsArray.value, canvasElements.value)
        }
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
    if (typeof clearGuides === 'function') {
        clearGuides()
    }
}


const handleCopy = () => {
    if (hasSelection.value && selectedElementsArray.value.length > 0) {
        copyElements(selectedElementsArray.value)
    }
}

const handlePaste = () => {
    const newElements = pasteElements()
    if (newElements?.length) {
        canvasElements.value.push(...newElements)
        clearSelection()
        newElements.forEach(element => addToSelection(element.id))
        saveState()
    }
}

// ==================== Keyboard Handlers ====================
const MOVEMENT_STEP = 1 // Pixels por movimento
const FAST_MOVEMENT_STEP = 10 // Pixels para movimento rápido com Shift

const handleKeyDown = (event) => {
    // Se não houver elemento selecionado ou estivermos em um campo de texto, não processa
    if (!hasSelection.value || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
    }

    const step = event.shiftKey ? FAST_MOVEMENT_STEP : MOVEMENT_STEP

    // Manipulação básica (Delete, Copy, Paste, etc)
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

            case 'x':
                event.preventDefault()
                handleCopy()
                removeElements(selectedElementIds.value)
                clearSelection()
                saveState()
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

            case 'd':
                event.preventDefault()
                handleDuplicate()
                break
        }
        return
    }

    // Movimento com setas
    let dx = 0
    let dy = 0

    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault()
            dx = -step
            break
        case 'ArrowRight':
            event.preventDefault()
            dx = step
            break
        case 'ArrowUp':
            event.preventDefault()
            dy = -step
            break
        case 'ArrowDown':
            event.preventDefault()
            dy = step
            break
        case 'Delete':
        case 'Backspace':
            event.preventDefault()
            if (hasSelection.value) {
                removeElements(selectedElementIds.value)
                clearSelection()
                saveState()
            }
            break
    }

    // Aplica o movimento se houver
    if (dx !== 0 || dy !== 0) {
        selectedElementsArray.value.forEach(element => {
            element.x += dx
            element.y += dy
        })
        saveState()
    }
}
const generateUniqueId = () => {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

const handleDuplicate = () => {
    if (!hasSelection.value) return

    const offset = 20
    const maxZIndex = Math.max(...canvasElements.value.map(el => el.zIndex), 0)

    const newElements = selectedElementsArray.value.map((element, index) => ({
        ...element,
        id: generateUniqueId(),
        x: element.x + offset,
        y: element.y + offset,
        zIndex: maxZIndex + index + 1
    }))

    clearSelection()
    canvasElements.value.push(...newElements)
    newElements.forEach(element => addToSelection(element.id))
    saveState()
}

// ==================== Lifecycle Hooks ====================
onMounted(() => {


    const handleGlobalMouseMove = (event) => {
        handleMouseMove(event)
    }

    const handleGlobalMouseUp = (event) => {
        handleMouseUp(event)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchmove', handleGlobalMouseMove, { passive: true })
    window.addEventListener('touchend', handleGlobalMouseUp)

    window.addEventListener('keydown', handleKeyDown)

    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
        window.removeEventListener('touchmove', handleGlobalMouseMove)
        window.removeEventListener('touchend', handleGlobalMouseUp)

        window.removeEventListener('keydown', handleKeyDown)
    })
})
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <EditorToolbar :can-undo="canUndo" :can-redo="canRedo" :has-selection="hasSelection"
            :has-multiple-selection="hasMultipleSelection" @undo="undo" @redo="redo" @copy="handleCopy"
            @paste="handlePaste" />

        <!-- <AlignmentToolbar :has-selection="hasSelection" :has-multiple-selection="hasMultipleSelection" /> -->

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