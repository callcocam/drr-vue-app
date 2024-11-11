// src/components/DesignEditor/index.vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from './components/EditorSidebar.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorProperties from './components/EditorProperties.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import AlignmentToolbar from './components/AlignmentToolbar.vue'

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

// ==================== Estados ====================
const canvasElements = ref([])
const selectedElementIds = ref(new Set()) // Mudamos para IDs
const nextId = ref(1)
const nextZIndex = ref(1)
const clipboard = ref(null)

// Preview de arrasto
const dragPreview = ref({
    visible: false,
    x: 0,
    y: 0
})

// Guias de alinhamento
const guides = ref({
    vertical: [],
    horizontal: []
})

// Estado de interação
const interaction = ref({
    isMoving: false,
    isResizing: false,
    isRotating: false,
    initialMousePos: { x: 0, y: 0 },
    initialElementState: null,
    initialElements: null
})

// ==================== Computed Properties ====================
const hasSelection = computed(() => selectedElements.value.size > 0)
const hasMultipleSelection = computed(() => selectedElements.value.size > 1)

const selectedElements = computed(() => {
    return new Set(selectedElementIds.value)
})

const selectedElement = computed(() => {
  if (selectedElementIds.value.size !== 1) return null
  const elementId = Array.from(selectedElementIds.value)[0]
  return canvasElements.value.find(el => el.id === elementId)
})

const selectedElementsArray = computed(() => {
    return Array.from(selectedElementIds.value)
        .map(id => canvasElements.value.find(el => el.id === id))
        .filter(Boolean)
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

// ==================== Utilitários ====================
const getEventPosition = (event) => {
    if (event.touches) {
        return {
            clientX: event.touches[0].clientX,
            clientY: event.touches[0].clientY
        }
    }
    return {
        clientX: event.clientX,
        clientY: event.clientY
    }
}

const createElement = (type, x, y) => {
    return {
        id: nextId.value++,
        type,
        x,
        y,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: nextZIndex.value++,
        backgroundColor: type === 'text' ? null : '#EEEEEE', // Texto começa sem fundo
        borderColor: '#000000',
        borderWidth: 1,
        textColor: '#000000',
        fontSize: 16,
        fontFamily: 'Arial',
        text: type === 'text' ? 'Clique duas vezes para editar' : ''
    }
}

// ==================== Gerenciamento de Seleção ====================
const handleElementSelect = (element, event) => {
    if (event.ctrlKey || event.metaKey) {
        // Toggle seleção quando Ctrl/Cmd está pressionado
        if (selectedElementIds.value.has(element.id)) {
            selectedElementIds.value.delete(element.id)
        } else {
            selectedElementIds.value.add(element.id)
        }
        // Força atualização do Set
        selectedElementIds.value = new Set(selectedElementIds.value)
    } else {
        // Seleção única quando Ctrl/Cmd não está pressionado
        selectedElementIds.value = new Set([element.id])
    }
}

const handleCanvasClick = (event) => {
    // Limpa seleção apenas se clicar diretamente no canvas
    if (event.target === event.currentTarget) {
        selectedElementIds.value = new Set()
    }
}

// Atualiza os métodos auxiliares
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
            removeFromSelection(element.id)
        } else {
            addToSelection(element.id)
        }
    } else {
        selectedElementIds.value = new Set([element.id])
    }
}


// ==================== Histórico ====================
const history = ref({
    states: [],
    currentIndex: -1
})

const saveState = () => {
    // Remove estados futuros se estivermos no meio do histórico
    if (history.value.currentIndex < history.value.states.length - 1) {
        history.value.states = history.value.states.slice(0, history.value.currentIndex + 1)
    }

    // Adiciona novo estado
    history.value.states.push(JSON.stringify({
        elements: canvasElements.value,
        selection: Array.from(selectedElements.value)
    }))
    history.value.currentIndex++

    // Limita o tamanho do histórico
    if (history.value.states.length > 50) {
        history.value.states = history.value.states.slice(-50)
        history.value.currentIndex = history.value.states.length - 1
    }
}

const canUndo = computed(() => history.value.currentIndex > 0)
const canRedo = computed(() => history.value.currentIndex < history.value.states.length - 1)

// Continuação do script:

// ==================== Ações do Histórico ====================
const handleUndo = () => {
    if (!canUndo.value) return

    history.value.currentIndex--
    const previousState = JSON.parse(history.value.states[history.value.currentIndex])
    canvasElements.value = previousState.elements
    selectedElements.value = new Set(previousState.selection)
}

const handleRedo = () => {
    if (!canRedo.value) return

    history.value.currentIndex++
    const nextState = JSON.parse(history.value.states[history.value.currentIndex])
    canvasElements.value = nextState.elements
    selectedElements.value = new Set(nextState.selection)
}
// ==================== Ações de Elementos ====================
const removeElement = () => {
    if (!hasSelection.value) return

    // Remove todos os elementos selecionados
    canvasElements.value = canvasElements.value.filter(
        element => !selectedElements.value.has(element.id)
    )

    // Limpa a seleção
    clearSelection()

    // Salva o estado após a remoção
    saveState()
}
// ==================== Handlers de Drag & Drop ====================
const handleDragStart = ({ event, element }) => {
    event.dataTransfer.setData('text/plain', element.type)
    dragPreview.value.visible = true
}

const handleDragEnd = () => {
    dragPreview.value.visible = false
}

const handleDragOver = ({ event, canvasRef }) => {
    const rect = canvasRef.getBoundingClientRect()
    dragPreview.value.x = event.clientX - rect.left - 50
    dragPreview.value.y = event.clientY - rect.top - 50
}

const handleDrop = ({ event, canvasRef }) => {
    const type = event.dataTransfer.getData('text/plain')
    const rect = canvasRef.getBoundingClientRect()
    const x = event.clientX - rect.left - 50
    const y = event.clientY - rect.top - 50

    const newElement = createElement(type, x, y)
    canvasElements.value.push(newElement)
    selectElement(newElement)
    dragPreview.value.visible = false
    saveState()
}

// ==================== Handlers de Manipulação ====================
const startMove = ({ event, element }) => {
    if (interaction.value.isResizing || interaction.value.isRotating) return

    const pos = getEventPosition(event)

    if (!selectedElements.value.has(element.id)) {
        if (!event.ctrlKey && !event.shiftKey) {
            clearSelection()
        }
        addToSelection(element.id)
    }

    interaction.value = {
        isMoving: true,
        isResizing: false,
        isRotating: false,
        initialMousePos: pos,
        initialElements: selectedElementsArray.value.map(el => ({ ...el })),
        initialElementState: { ...element }
    }
}

const startResize = ({ event, element }) => {
    const pos = getEventPosition(event)
    interaction.value = {
        isMoving: false,
        isResizing: true,
        isRotating: false,
        initialMousePos: pos,
        initialElementState: { ...element }
    }
}

const startRotate = ({ event, element }) => {
    const pos = getEventPosition(event)
    interaction.value = {
        isMoving: false,
        isResizing: false,
        isRotating: true,
        initialMousePos: pos,
        initialElementState: { ...element }
    }
}

const handleMouseMove = (event) => {
    if (!hasSelection.value) return

    const pos = getEventPosition(event)

    if (interaction.value.isMoving) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        selectedElementsArray.value.forEach(element => {
            const initialState = interaction.value.initialElements?.find(
                el => el.id === element.id
            )

            if (initialState) {
                element.x = initialState.x + dx
                element.y = initialState.y + dy
            }
        })

        updateGuides()
    }

    if (interaction.value.isResizing && selectedElement.value) {
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

    interaction.value = {
        isMoving: false,
        isResizing: false,
        isRotating: false,
        initialMousePos: { x: 0, y: 0 },
        initialElementState: null,
        initialElements: null
    }
    guides.value = { vertical: [], horizontal: [] }
}

// ==================== Alinhamento ====================
const updateGuides = () => {
    if (!interaction.value.isMoving || !hasSelection.value) return

    guides.value = { vertical: [], horizontal: [] }
    const positions = { vertical: new Set(), horizontal: new Set() }

    // Coleta posições dos elementos não selecionados
    canvasElements.value.forEach(element => {
        if (!selectedElements.value.has(element.id)) {
            positions.vertical.add(element.x)
            positions.vertical.add(element.x + element.width / 2)
            positions.vertical.add(element.x + element.width)

            positions.horizontal.add(element.y)
            positions.horizontal.add(element.y + element.height / 2)
            positions.horizontal.add(element.y + element.height)
        }
    })

    // Verifica alinhamentos
    selectedElementsArray.value.forEach(element => {
        const threshold = 5

        positions.vertical.forEach(x => {
            const checkPoints = [
                { value: element.x, snap: () => element.x = x },
                { value: element.x + element.width / 2, snap: () => element.x = x - element.width / 2 },
                { value: element.x + element.width, snap: () => element.x = x - element.width }
            ]

            checkPoints.forEach(point => {
                if (Math.abs(point.value - x) < threshold) {
                    guides.value.vertical.push({ position: x })
                    point.snap()
                }
            })
        })

        positions.horizontal.forEach(y => {
            const checkPoints = [
                { value: element.y, snap: () => element.y = y },
                { value: element.y + element.height / 2, snap: () => element.y = y - element.height / 2 },
                { value: element.y + element.height, snap: () => element.y = y - element.height }
            ]

            checkPoints.forEach(point => {
                if (Math.abs(point.value - y) < threshold) {
                    guides.value.horizontal.push({ position: y })
                    point.snap()
                }
            })
        })
    })
}

// ==================== Clipboard ====================
const copySelected = () => {
    if (!hasSelection.value) return
    clipboard.value = selectedElementsArray.value.map(element => ({ ...element }))
}

const pasteElements = () => {
    if (!clipboard.value?.length) return

    clearSelection()
    const offset = 20

    const newElements = clipboard.value.map(element => ({
        ...element,
        id: nextId.value++,
        x: element.x + offset,
        y: element.y + offset,
        zIndex: nextZIndex.value++
    }))

    canvasElements.value.push(...newElements)
    newElements.forEach(element => addToSelection(element.id))
    saveState()
}
const updateSelectedElement = (updatedElement) => {
    const index = canvasElements.value.findIndex(el => el.id === updatedElement.id)
    if (index !== -1) {
        canvasElements.value[index] = updatedElement
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
                    copySelected()
                    break

                case 'v':
                    event.preventDefault()
                    pasteElements()
                    break

                case 'z':
                    event.preventDefault()
                    if (event.shiftKey) handleRedo()
                    else handleUndo()
                    break

                case 'y':
                    event.preventDefault()
                    handleRedo()
                    break

                case 'a':
                    event.preventDefault()
                    canvasElements.value.forEach(element => addToSelection(element.id))
                    break
            }
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault()
            if (hasSelection.value) {
                canvasElements.value = canvasElements.value.filter(
                    element => !selectedElements.value.has(element.id)
                )
                clearSelection()
                saveState()
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleMouseMove)
        window.removeEventListener('touchend', handleMouseUp)
    }
})
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-100">
        <EditorToolbar :can-undo="canUndo" :can-redo="canRedo" :has-selection="hasSelection"
            :has-multiple-selection="hasMultipleSelection" @undo="handleUndo" @redo="handleRedo" @copy="copySelected"
            @paste="pasteElements" />

        <AlignmentToolbar :has-selection="hasSelection" :has-multiple-selection="hasMultipleSelection" />

        <div class="flex flex-1 overflow-hidden">
            <EditorSidebar :available-elements="AVAILABLE_ELEMENTS" @element-drag-start="handleDragStart"
                @element-drag-end="handleDragEnd" />

            <EditorCanvas 
                :elements="canvasElements"
                :selected-elements="selectedElements"
                :selection-bounds="selectionBounds" 
                :guides="guides" 
                :drag-preview="dragPreview"
                :interaction="interaction"
                @element-click="handleElementSelect"
                @deselect="clearSelection"
                @add-to-selection="addToSelection"
                @remove-from-selection="removeFromSelection"
                @start-move="startMove"
                @start-resize="startResize"
                @start-rotate="startRotate"
                @drop="handleDrop"
                @drag-over="handleDragOver" />

            <EditorProperties v-if="selectedElement" :element="selectedElement"
                :is-group="selectedElement.type === 'group'" :available-fonts="AVAILABLE_FONTS" :font-sizes="FONT_SIZES"
                @update:element="updateSelectedElement" @remove-element="removeElement" />
        </div>
    </div>
</template>