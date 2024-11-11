// src/components/DesignEditor/index.vue

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import EditorSidebar from './DesignEditor/EditorSidebar.vue'
import EditorCanvas from './DesignEditor/EditorCanvas.vue'
import EditorProperties from './DesignEditor/EditorProperties.vue'

// ============ Estados do Editor ============
const canvasElements = ref([])
const selectedElement = ref(null)

// Estado de interação
const interaction = ref({
    isMoving: false,
    isResizing: false,
    isRotating: false,
    initialMousePos: { x: 0, y: 0 },
    initialElementState: null
})

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

// Contadores
let nextId = 1
let nextZIndex = 1

// ============ Configurações ============
const availableElements = [
    { type: 'rectangle', label: 'Retângulo' },
    { type: 'circle', label: 'Círculo' },
    { type: 'text', label: 'Texto' }
]

const availableFonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' }
]

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]
const snapThreshold = 10

// ============ Utilitários ============
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
        id: nextId++,
        type,
        x,
        y,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: nextZIndex++,
        backgroundColor: '#EEEEEE',
        borderColor: '#000000',
        borderWidth: 1,
        textColor: '#000000',
        fontSize: 16,
        fontFamily: 'Arial',
        text: type === 'text' ? 'Texto' : ''
    }
}

// ============ Métodos de Drag & Drop do Painel ============
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
    selectedElement.value = newElement
    dragPreview.value.visible = false
}

// ============ Métodos de Manipulação de Elementos ============
const updateSelectedElement = (element) => {
    selectedElement.value = element
}

const deselectElement = (event) => {
  // Só deseleciona se o clique foi diretamente no canvas
  if (event && event.target.closest('.properties-panel')) {
    return
  }
  selectedElement.value = null
}

const removeElement = () => {
    const index = canvasElements.value.indexOf(selectedElement.value)
    if (index > -1) {
        canvasElements.value.splice(index, 1)
        selectedElement.value = null
    }
}

// ============ Métodos de Interação ============
const startMove = (event, element) => {
    if (interaction.value.isResizing || interaction.value.isRotating) return

    const pos = getEventPosition(event)
    interaction.value = {
        isMoving: true,
        isResizing: false,
        isRotating: false,
        initialMousePos: pos,
        initialElementState: { ...element }
    }
    selectedElement.value = element
}

const startResize = (event, element) => {
    const pos = getEventPosition(event)
    interaction.value = {
        isMoving: false,
        isResizing: true,
        isRotating: false,
        initialMousePos: pos,
        initialElementState: { ...element }
    }
}

const startRotate = (event, element) => {
    const pos = getEventPosition(event)
    interaction.value = {
        isMoving: false,
        isResizing: false,
        isRotating: true,
        initialMousePos: pos,
        initialElementState: { ...element }
    }
}

// ============ Manipulação de Movimento ============
const handleMouseMove = (event) => {
    if (!selectedElement.value) return

    const pos = getEventPosition(event)

    if (interaction.value.isMoving) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        selectedElement.value.x = interaction.value.initialElementState.x + dx
        selectedElement.value.y = interaction.value.initialElementState.y + dy

        updateGuides()
    }

    if (interaction.value.isResizing) {
        const dx = pos.clientX - interaction.value.initialMousePos.clientX
        const dy = pos.clientY - interaction.value.initialMousePos.clientY

        selectedElement.value.width = Math.max(50, interaction.value.initialElementState.width + dx)
        selectedElement.value.height = Math.max(50, interaction.value.initialElementState.height + dy)
    }

    if (interaction.value.isRotating) {
        const elementCenter = {
            x: selectedElement.value.x + selectedElement.value.width / 2,
            y: selectedElement.value.y + selectedElement.value.height / 2
        }

        const angle = Math.atan2(
            pos.clientY - elementCenter.y,
            pos.clientX - elementCenter.x
        ) * (180 / Math.PI)

        selectedElement.value.rotation = angle
    }
}

const handleMouseUp = () => {
    interaction.value = {
        isMoving: false,
        isResizing: false,
        isRotating: false,
        initialMousePos: { x: 0, y: 0 },
        initialElementState: null
    }
    guides.value = { vertical: [], horizontal: [] }
}

// ============ Sistema de Guias ============
const updateGuides = () => {
    if (!interaction.value.isMoving || !selectedElement.value) return

    guides.value = { vertical: [], horizontal: [] }
    const positions = { vertical: new Set(), horizontal: new Set() }

    // Coleta posições dos outros elementos
    canvasElements.value.forEach(element => {
        if (element !== selectedElement.value) {
            const edges = {
                vertical: [
                    element.x,
                    element.x + element.width,
                    element.x + element.width / 2
                ],
                horizontal: [
                    element.y,
                    element.y + element.height,
                    element.y + element.height / 2
                ]
            }

            edges.vertical.forEach(x => positions.vertical.add(x))
            edges.horizontal.forEach(y => positions.horizontal.add(y))
        }
    })

    // Verifica alinhamentos
    const current = selectedElement.value
    const currentCenter = {
        x: current.x + current.width / 2,
        y: current.y + current.height / 2
    }

    // Alinhamento vertical
    positions.vertical.forEach(x => {
        const points = [
            { value: current.x, type: 'start' },
            { value: current.x + current.width, type: 'end' },
            { value: currentCenter.x, type: 'center' }
        ]

        points.forEach(point => {
            if (Math.abs(point.value - x) < snapThreshold) {
                guides.value.vertical.push({ position: x })
                switch (point.type) {
                    case 'start':
                        current.x = x
                        break
                    case 'end':
                        current.x = x - current.width
                        break
                    case 'center':
                        current.x = x - current.width / 2
                        break
                }
            }
        })
    })

    // Alinhamento horizontal
    positions.horizontal.forEach(y => {
        const points = [
            { value: current.y, type: 'start' },
            { value: current.y + current.height, type: 'end' },
            { value: currentCenter.y, type: 'center' }
        ]

        points.forEach(point => {
            if (Math.abs(point.value - y) < snapThreshold) {
                guides.value.horizontal.push({ position: y })
                switch (point.type) {
                    case 'start':
                        current.y = y
                        break
                    case 'end':
                        current.y = y - current.height
                        break
                    case 'center':
                        current.y = y - current.height / 2
                        break
                }
            }
        })
    })
}

// ============ Lifecycle Hooks ============
onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('touchmove', handleMouseMove)
    window.removeEventListener('touchend', handleMouseUp)
})
</script>

<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <EditorSidebar :available-elements="availableElements" @drag-start="handleDragStart"
            @drag-end="handleDragEnd" />

        <!-- Canvas -->
        <EditorCanvas :elements="canvasElements" :selected-element="selectedElement" :guides="guides"
            :drag-preview="dragPreview" @update:selected-element="updateSelectedElement" @start-move="startMove"
            @start-resize="startResize" @start-rotate="startRotate" @drop="handleDrop" @drag-over="handleDragOver"
            @deselect="deselectElement" />

        <!-- Properties -->
        <EditorProperties v-if="selectedElement" v-model:selected-element="selectedElement"
            :available-fonts="availableFonts" :font-sizes="fontSizes" @remove-element="removeElement"  class="properties-panel"/>
    </div>
</template>
<style>
/* Estilos anteriores permanecem... */

.guide-line {
    position: absolute;
    background-color: rgb(59, 130, 246);
    pointer-events: none;
    opacity: 0.7;
}

/* Estilização dos inputs de cor */
input[type="color"] {
    -webkit-appearance: none;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}

input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
}
</style>