<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <EditorToolbar :can-undo="canUndo" :can-redo="canRedo" :has-selection="hasSelection"
            :has-multiple-selection="hasMultipleSelection" @undo="undo" @redo="redo" @copy="handleCopy"
            @paste="handlePaste" @remove-element="handleDelete" @bring-to-front="bringToFront"
            @send-to-back="sendToBack" @bring-forward="bringForward" @send-backward="sendBackward" />

        <CanvasControls v-model:width="canvasWidth" v-model:height="canvasHeight" v-model:zoom="canvasZoom" />
        <!-- <AlignmentToolbar :has-selection="hasSelection" :has-multiple-selection="hasMultipleSelection" /> -->

        <div class="flex flex-1 overflow-hidden">
            <div class="flex">
                <!-- Sidebar com abas -->
                <div class="w-64 bg-white border-r">
                    <div class="flex border-b">
                        <button class="flex-1 px-4 py-2 text-sm font-medium"
                            :class="activeTab === 'elements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
                            @click="activeTab = 'elements'">
                            Elementos
                        </button>
                        <button class="flex-1 px-4 py-2 text-sm font-medium"
                            :class="activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
                            @click="activeTab = 'templates'">
                            Templates
                        </button>
                    </div>

                    <EditorSidebar v-if="activeTab === 'elements'"
                        :available-elements="EDITOR_CONFIG.AVAILABLE_ELEMENTS" @element-drag-start="handleDragStart"
                        @element-drag-end="handleDragEnd" />

                    <TemplateSidebar v-else @template-drag-start="handleTemplateDragStart"
                        @template-drag-end="handleTemplateDragEnd" />
                </div>
            </div>

            <EditorCanvas :elements="canvasElements" :selected-elements="selectedElementIds"
                :selection-bounds="selectionBounds" :guides="guides" :drag-preview="dragPreview"
                :interaction="interaction" :editingElementId="editingElementId"
                :selected-element-ids="selectedElementIds" :canvas-width="canvasWidth" :canvas-height="canvasHeight"
                :zoom="canvasZoom" @element-click="handleElementSelect" @element-mousedown="handleElementMouseDown"
                @deselect="clearSelection" @add-to-selection="addToSelection"
                @remove-from-selection="removeFromSelection" @start-resize="startResize" @start-rotate="startRotate"
                @drop="handleDrop" @drag-over="handleDragOver" />

            <!-- Painel de propriedades fixo -->
            <EditorProperties :element="selectedElement" :is-group="hasMultipleSelection"
                :available-fonts="EDITOR_CONFIG.AVAILABLE_FONTS" :font-sizes="EDITOR_CONFIG.FONT_SIZES"
                :border-styles="EDITOR_CONFIG.BORDER_STYLES" @update:element="updateElement"
                @remove-element="handleDelete" />
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from '@/components/DesignEditor/components/EditorSidebar.vue'
import TemplateSidebar from '@/components/DesignEditor/components/TemplateSidebar.vue'
import EditorCanvas from '@/components/DesignEditor/components/EditorCanvas.vue'
import EditorProperties from '@/components/DesignEditor/components/EditorProperties.vue'
import EditorToolbar from '@/components/DesignEditor/components/EditorToolbar.vue'
import CanvasControls from '@/components/DesignEditor/components/CanvasControls.vue'
// import AlignmentToolbar from '@/components/DesignEditor/components/AlignmentToolbar.vue'

import { useCanvas } from '@/components/DesignEditor/composables/useCanvas'
import { useSelection } from '@/components/DesignEditor/composables/useSelection'
import { useHistory } from '@/components/DesignEditor/composables/useHistory'
import { useInteraction } from '@/components/DesignEditor/composables/useInteraction'
import { useClipboard } from '@/components/DesignEditor/composables/useClipboard'
import { useSmartGuides } from '@/components/DesignEditor/composables/useSmartGuides'
import { useEventUtils } from '@/components/DesignEditor/composables/useEventUtils'
import { useKeyboardShortcuts } from '@/components/DesignEditor/composables/useKeyboardShortcuts'
import { debugLog } from '@/components/DesignEditor/utils/debug'
import { EDITOR_CONFIG } from '@/components/DesignEditor/config/editorConfig'

// ==================== Configurações ====================
const activeTab = ref('elements')

// Estado do canvas
const canvasWidth = ref(1080)
const canvasHeight = ref(1080)
const canvasZoom = ref(100)


// Adicione aos refs
const editingElementId = ref(null)

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

const { getEventPosition } = useEventUtils()

const { interaction, startMove, startResize, startRotate, resetInteraction } = useInteraction(
    { getEventPosition }
)

const { canUndo, canRedo, saveState, undo, redo } = useHistory(canvasElements, selectedElementIds)
const { clipboard, copyElements, pasteElements } = useClipboard()
const {
    guides,
    updateGuides,
    clearGuides } = useSmartGuides()

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
const handleStartEdit = (element) => {
    editingElementId.value = element.id
    // Desativa temporariamente os atalhos de teclado durante a edição
    if (typeof disableKeyboardShortcuts === 'function') {
        disableKeyboardShortcuts()
    }
}

const handleEndEdit = (element, saveChanges) => {
    if (saveChanges) {
        saveState()
    }
    editingElementId.value = null
    // Reativa os atalhos de teclado
    if (typeof enableKeyboardShortcuts === 'function') {
        enableKeyboardShortcuts()
    }
}

const handleElementSelect = (element, event) => {
    if (!element) return
    debugLog('Element selected:', { element })
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

    debugLog('Drag start:', { element })

    event.dataTransfer.setData('text/plain', element.type)
    event.dataTransfer.setData('name', element.name)
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
    const type = event.dataTransfer.getData('text/plain')
    const name = event.dataTransfer.getData('name')
    const rect = canvasRef.getBoundingClientRect()
    const x = event.clientX - rect.left - 50
    const y = event.clientY - rect.top - 50

    let newElement
    try {
        if (type === 'template') {
            const templateData = JSON.parse(event.dataTransfer.getData('application/json'))
            if (!templateData) {
                console.error('Template data not found')
                return
            }
            newElement = addElement('template', x, y, templateData)
            newElement.name = name
        } else {
            newElement = addElement(type, x, y)
            newElement.name = name
        }

        if (newElement) {
            selectElement(newElement)
            dragPreview.value.visible = false
            saveState()
        }
    } catch (error) {
        console.error('Error creating element:', error)
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

        if (typeof updateGuides === 'function') { // Atualiza as guias de alinhamento
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


const handleTemplateDragStart = ({ event, template }) => {
    if (!template) return
    const templateData = {
        template: template.template,
        width: template.width,
        height: template.height
    }

    event.dataTransfer.setData('text/plain', 'template')
    event.dataTransfer.setData('application/json', JSON.stringify(templateData))
    event.dataTransfer.setData('name', template.name)
    dragPreview.value.visible = true
}

const handleTemplateDragEnd = () => {
    dragPreview.value.visible = false
}

// ==================== Keyboard Handlers ====================
const handleCopy = () => {
    if (hasSelection.value && selectedElementsArray.value.length > 0) {
        copyElements(selectedElementsArray.value)
    }
}

const handleCut = () => {
    if (hasSelection.value && selectedElementsArray.value.length > 0) {
        copyElements(selectedElementsArray.value)
        removeElements(selectedElementIds.value)
        clearSelection()
        saveState()
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

const handleDelete = () => {
    if (hasSelection.value) {
        removeElements(selectedElementIds.value)
        clearSelection()
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


const bringToFront = () => {
    if (!hasSelection.value) return

    const maxZIndex = Math.max(...canvasElements.value.map(el => el.zIndex), 0)

    selectedElementsArray.value.forEach((element, index) => {
        updateElement({
            ...element,
            zIndex: maxZIndex + index + 1
        })
    })
    saveState()
}

const sendToBack = () => {
    if (!hasSelection.value) return

    const minZIndex = Math.min(...canvasElements.value.map(el => el.zIndex), 0)

    selectedElementsArray.value.forEach((element, index) => {
        updateElement({
            ...element,
            zIndex: minZIndex - selectedElementsArray.value.length + index
        })
    })
    saveState()
}

const bringForward = () => {
    if (!hasSelection.value) return

    const sortedElements = [...canvasElements.value].sort((a, b) => a.zIndex - b.zIndex)
    const selectedIds = new Set(selectedElementIds.value)

    selectedElementsArray.value.forEach(element => {
        const currentIndex = sortedElements.findIndex(el => el.id === element.id)
        const nextElement = sortedElements[currentIndex + 1]

        if (nextElement && !selectedIds.has(nextElement.id)) {
            const newZIndex = nextElement.zIndex + 1
            updateElement({
                ...element,
                zIndex: newZIndex
            })

            // Update the sorted array to maintain correct order
            sortedElements.splice(currentIndex, 1)
            sortedElements.splice(currentIndex + 1, 0, { ...element, zIndex: newZIndex })
        }
    })
    saveState()
}

const sendBackward = () => {
    if (!hasSelection.value) return

    const sortedElements = [...canvasElements.value].sort((a, b) => b.zIndex - a.zIndex)
    const selectedIds = new Set(selectedElementIds.value)

    selectedElementsArray.value.forEach(element => {
        const currentIndex = sortedElements.findIndex(el => el.id === element.id)
        const previousElement = sortedElements[currentIndex + 1]

        if (previousElement && !selectedIds.has(previousElement.id)) {
            const newZIndex = previousElement.zIndex - 1
            updateElement({
                ...element,
                zIndex: newZIndex
            })

            // Update the sorted array to maintain correct order
            sortedElements.splice(currentIndex, 1)
            sortedElements.splice(currentIndex + 1, 0, { ...element, zIndex: newZIndex })
        }
    })
    saveState()
}

const { setupKeyboardShortcuts } = useKeyboardShortcuts({
    undo,
    redo,
    handleCopy,
    handlePaste,
    handleCut,
    handleDelete,
    handleDuplicate,
    addToSelection,
    canvasElements,
    selectedElementsArray,
    editingElementId,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward
})
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

    // window.addEventListener('keydown', handleKeyDown)

    setupKeyboardShortcuts()

    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
        window.removeEventListener('touchmove', handleGlobalMouseMove)
        window.removeEventListener('touchend', handleGlobalMouseUp)

    })
})
</script>
