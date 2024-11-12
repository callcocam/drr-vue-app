<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from './components/EditorSidebar.vue'
import TemplateSidebar from './components/TemplateSidebar.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorProperties from './components/EditorProperties.vue'
import EditorToolbar from './components/EditorToolbar.vue'

import { useCanvas } from '@/components/DesignEditor/composables/useCanvas'
import { useSelection } from '@/components/DesignEditor/composables/useSelection'
import { useHistory } from '@/components/DesignEditor/composables/useHistory'
import { useInteraction } from '@/components/DesignEditor/composables/useInteraction'
import { useClipboard } from '@/components/DesignEditor/composables/useClipboard'
import { useGuides } from '@/components/DesignEditor/composables/useGuides'
import { useEventUtils } from '@/components/DesignEditor/composables/useEventUtils'
import { useKeyboardShortcuts } from '@/components/DesignEditor/composables/useKeyboardShortcuts'
import { EDITOR_CONFIG } from '@/components/DesignEditor/config/editorConfig'
import { debugLog } from '@/components/DesignEditor/utils/debug'

// Estado
const activeTab = ref('elements')
const dragPreview = ref({
    visible: false,
    x: 0,
    y: 0
})



const selectedElementsArray = computed(() => {
    return Array.from(selectedElementIds.value)
        .map(id => canvasElements.value.find(el => el.id === id))
        .filter(Boolean)
})

// Canvas & Elementos
const {
    canvasElements,
    addElement,
    removeElements,
    updateElement,
    generateUniqueId
} = useCanvas()

// Seleção
const {
    selectedElementIds,
    hasSelection,
    hasMultipleSelection,
    clearSelection,
    selectElement,
    addToSelection,
    removeFromSelection, 
    selectedElement,
    selectionBounds
} = useSelection(canvasElements)

// Utilidades de Eventos
const { getEventPosition, getCanvasPosition } = useEventUtils()

// Guias
const {
    guides,
    updateGuides,
    clearGuides
} = useGuides()

// Interação
const {
    interaction,
    startMove,
    startResize,
    startRotate,
    resetInteraction, 
} = useInteraction({
    getEventPosition,
    selectedElementsArray,
    updateGuides
})

// Histórico
const {
    canUndo,
    canRedo,
    saveState,
    undo,
    redo
} = useHistory(canvasElements, selectedElementIds)

// Área de transferência
const {
    copyElements,
    pasteElements,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate
} = useClipboard({
    canvasElements,
    selectedElementIds,
    selectedElementsArray,
    clearSelection,
    addToSelection,
    generateUniqueId,
    saveState
})


// Operações com Elementos
const handleDelete = () => {
    debugLog('handleDelete', { selectedElementIds: selectedElementIds.value })

    if (!hasSelection.value) return

    removeElements(selectedElementIds.value)
    clearSelection()
    saveState()
}

// Operações de Arrastar
const handleDragOperations = {
    start: ({ event, element }) => {
        if (!event?.dataTransfer || !element) return

        debugLog('dragStart', { element })

        event.dataTransfer.setData('text/plain', element.type)
        dragPreview.value.visible = true
    },

    end: () => {
        dragPreview.value.visible = false
    },

    over: ({ event, canvasRef }) => {
        if (!event || !canvasRef) return

        event.preventDefault()
        const rect = canvasRef.getBoundingClientRect()
        dragPreview.value.x = event.clientX - rect.left - 50
        dragPreview.value.y = event.clientY - rect.top - 50
    },

    drop: async ({ event, canvasRef }) => {
        try {
            if (!event?.dataTransfer || !canvasRef) return

            const type = event.dataTransfer.getData('text/plain')
            const rect = canvasRef.getBoundingClientRect()
            const position = {
                x: event.clientX - rect.left - 50,
                y: event.clientY - rect.top - 50
            }

            let newElement = null

            if (type === 'template') {
                const templateData = JSON.parse(event.dataTransfer.getData('application/json'))
                if (!templateData) throw new Error('Template data not found')
                newElement = await addElement('template', position.x, position.y, templateData)
            } else {
                newElement = await addElement(type, position.x, position.y)
            }

            if (newElement) {
                selectElement(newElement)
                dragPreview.value.visible = false
                saveState()
                debugLog('elementDropped', { newElement })
            }
        } catch (error) {
            console.error('Error handling drop:', error)
        }
    }
}

// Operações do Mouse
const handleMouseOperations = {
    move: (event) => {

        console.log('selectedElementsArray', selectedElementsArray)
        if (!hasSelection.value || !selectedElementsArray.value?.length) return

        const pos = getEventPosition(event)
        if (!pos) return

        // handleElementInteraction(pos)
    },

    up: () => {
        const wasInteracting =
            interaction.value.isMoving ||
            interaction.value.isResizing ||
            interaction.value.isRotating

        if (wasInteracting) {
            saveState()
            debugLog('interactionComplete', {
                type: interaction.value.isMoving ? 'move' :
                    interaction.value.isResizing ? 'resize' : 'rotate'
            })
        }

        resetInteraction()
        clearGuides?.()
    }
}

// Atalhos de Teclado
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
    selectedElementsArray
})

// Ciclo de Vida
onMounted(() => {
    const handlers = {
        mousemove: handleMouseOperations.move,
        mouseup: handleMouseOperations.up,
        touchmove: handleMouseOperations.move,
        touchend: handleMouseOperations.up
    }

    // Adiciona os event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
        window.addEventListener(event, handler, { passive: true })
    })

    setupKeyboardShortcuts()

    // Limpeza
    onBeforeUnmount(() => {
        Object.entries(handlers).forEach(([event, handler]) => {
            window.removeEventListener(event, handler)
        })
    })

    debugLog('editorMounted')
})
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <EditorToolbar :can-undo="canUndo" :can-redo="canRedo" :has-selection="hasSelection"
            :has-multiple-selection="hasMultipleSelection" @undo="undo" @redo="redo" @copy="handleCopy"
            @paste="handlePaste" @remove-element="handleDelete" />

        <div class="flex flex-1 overflow-hidden">
            <div class="flex">
                <div class="w-64 bg-white border-r">
                    <div class="flex border-b">
                        <button v-for="tab in ['elements', 'templates']" :key="tab"
                            class="flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200" :class="[
                                activeTab === tab
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            ]" @click="activeTab = tab">
                            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                        </button>
                    </div>

                    <component :is="activeTab === 'elements' ? EditorSidebar : TemplateSidebar" v-bind="activeTab === 'elements'
                        ? { 'available-elements': EDITOR_CONFIG.AVAILABLE_ELEMENTS }
                        : {}" @element-drag-start="handleDragOperations.start"
                        @element-drag-end="handleDragOperations.end" @template-drag-start="handleDragOperations.start"
                        @template-drag-end="handleDragOperations.end" />
                </div>
            </div>

            <EditorCanvas :elements="canvasElements" :selected-elements="selectedElementIds"
                :selection-bounds="selectionBounds" :guides="guides" :drag-preview="dragPreview"
                :interaction="interaction" @element-click="selectElement" @element-mousedown="startMove"
                @deselect="clearSelection" @add-to-selection="addToSelection"
                @remove-from-selection="removeFromSelection" @start-resize="startResize" @start-rotate="startRotate"
                @drop="handleDragOperations.drop" @drag-over="handleDragOperations.over" />

            <EditorProperties v-if="selectedElement" :element="selectedElement"
                :is-group="selectedElement.type === 'group'" :available-fonts="EDITOR_CONFIG.AVAILABLE_FONTS"
                :font-sizes="EDITOR_CONFIG.FONT_SIZES" :border-styles="EDITOR_CONFIG.BORDER_STYLES"
                @update:element="updateElement" @remove-element="handleDelete" />
        </div>
    </div>
</template>

<style scoped>
.flex {
    display: flex;
}

.flex-col {
    flex-direction: column;
}

.flex-1 {
    flex: 1;
}

.h-screen {
    height: 100vh;
}

.bg-gray-100 {
    background-color: rgb(243 244 246);
}

.overflow-hidden {
    overflow: hidden;
}
</style>