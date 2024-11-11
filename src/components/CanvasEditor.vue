// DesignEditor.vue

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ============ Estados ============
const canvasRef = ref(null)
const selectedElement = ref(null)

// Lista de elementos no canvas
const canvasElements = ref([])

// Estados de interação
const interaction = ref({
  isMoving: false,
  isResizing: false,
  isRotating: false,
  initialMousePos: { x: 0, y: 0 },
  initialElementState: null
})

// Preview do elemento sendo arrastado
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

// Elementos disponíveis para adicionar
const availableElements = [
  { type: 'rectangle', label: 'Retângulo' },
  { type: 'circle', label: 'Círculo' },
  { type: 'text', label: 'Texto' }
]

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

const getCanvasPosition = (clientX, clientY) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

// ============ Manipulação de Elementos ============
// Estados anteriores permanecem...
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
    // Novos atributos de estilo
    backgroundColor: '#EEEEEE',
    borderColor: '#000000',
    borderWidth: 1,
    textColor: '#000000',
    fontSize: 16,
    fontFamily: 'Arial',
    text: type === 'text' ? 'Texto' : ''
  }
}

// Opções de fonte disponíveis
const availableFonts = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' }
]

// Tamanhos de fonte predefinidos
const fontSizes = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72
]

const selectElement = (element) => {
  selectedElement.value = element
}

const deselectElement = (event) => {
  if (event.target === canvasRef.value) {
    selectedElement.value = null
  }
}

const removeElement = () => {
  const index = canvasElements.value.indexOf(selectedElement.value)
  if (index > -1) {
    canvasElements.value.splice(index, 1)
    selectedElement.value = null
  }
}

// ============ Eventos de Drag & Drop do Painel ============
const handleDragStart = (event, element) => {
  event.dataTransfer.setData('text/plain', element.type)
  dragPreview.value.visible = true
}

const handleDragEnd = () => {
  dragPreview.value.visible = false
}

const handleDragOver = (event) => {
  if (!canvasRef.value) return
  const pos = getCanvasPosition(event.clientX, event.clientY)
  dragPreview.value.x = pos.x - 50
  dragPreview.value.y = pos.y - 50
}

const handleDrop = (event) => {
  const type = event.dataTransfer.getData('text/plain')
  const pos = getCanvasPosition(event.clientX, event.clientY)
  const element = createElement(type, pos.x - 50, pos.y - 50)

  canvasElements.value.push(element)
  selectElement(element)
  dragPreview.value.visible = false
}

// ============ Eventos de Manipulação ============
const startMove = (event, element) => {
  if (interaction.value.isResizing || interaction.value.isRotating) return

  const pos = getEventPosition(event)
  const canvasPos = getCanvasPosition(pos.clientX, pos.clientY)

  interaction.value = {
    isMoving: true,
    isResizing: false,
    isRotating: false,
    initialMousePos: {
      x: canvasPos.x - element.x,
      y: canvasPos.y - element.y
    },
    initialElementState: { ...element }
  }

  selectElement(element)
}

const startResize = (event, element) => {
  event.stopPropagation()
  const pos = getEventPosition(event)

  interaction.value = {
    isMoving: false,
    isResizing: true,
    isRotating: false,
    initialMousePos: {
      x: pos.clientX,
      y: pos.clientY
    },
    initialElementState: { ...element }
  }
}

const startRotate = (event, element) => {
  event.stopPropagation()
  const pos = getEventPosition(event)

  interaction.value = {
    isMoving: false,
    isResizing: false,
    isRotating: true,
    initialMousePos: {
      x: pos.clientX,
      y: pos.clientY
    },
    initialElementState: { ...element }
  }
}

const handleMove = (event) => {
  if (!selectedElement.value) return

  const pos = getEventPosition(event)
  const canvasPos = getCanvasPosition(pos.clientX, pos.clientY)

  if (interaction.value.isMoving) {
    const newX = canvasPos.x - interaction.value.initialMousePos.x
    const newY = canvasPos.y - interaction.value.initialMousePos.y

    const rect = canvasRef.value.getBoundingClientRect()
    const maxX = rect.width - selectedElement.value.width
    const maxY = rect.height - selectedElement.value.height

    selectedElement.value.x = Math.max(0, Math.min(maxX, newX))
    selectedElement.value.y = Math.max(0, Math.min(maxY, newY))

    updateGuides()
  }

  if (interaction.value.isResizing) {
    const dx = pos.clientX - interaction.value.initialMousePos.x
    const dy = pos.clientY - interaction.value.initialMousePos.y

    selectedElement.value.width = Math.max(50, interaction.value.initialElementState.width + dx)
    selectedElement.value.height = Math.max(50, interaction.value.initialElementState.height + dy)
  }

  if (interaction.value.isRotating) {
    const rect = canvasRef.value.getBoundingClientRect()
    const elementCenterX = rect.left + selectedElement.value.x + selectedElement.value.width / 2
    const elementCenterY = rect.top + selectedElement.value.y + selectedElement.value.height / 2

    const angle = Math.atan2(
      pos.clientY - elementCenterY,
      pos.clientX - elementCenterX
    )

    selectedElement.value.rotation = angle * (180 / Math.PI)
  }
}

const endInteraction = () => {
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
const snapThreshold = 10

const updateGuides = () => {
  if (!interaction.value.isMoving || !selectedElement.value) return

  guides.value = { vertical: [], horizontal: [] }
  const positions = { vertical: new Set(), horizontal: new Set() }

  // Coleta posições de todos os elementos exceto o selecionado
  canvasElements.value.forEach(element => {
    if (element !== selectedElement.value) {
      positions.vertical.add(element.x) // Esquerda
      positions.vertical.add(element.x + element.width) // Direita
      positions.vertical.add(element.x + element.width / 2) // Centro-X

      positions.horizontal.add(element.y) // Topo
      positions.horizontal.add(element.y + element.height) // Base
      positions.horizontal.add(element.y + element.height / 2) // Centro-Y
    }
  })

  // Verifica alinhamentos
  const element = selectedElement.value
  const elementCenter = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  }

  // Alinhamento vertical
  positions.vertical.forEach(pos => {
    const snapPoints = [
      { value: element.x, target: pos }, // Esquerda
      { value: element.x + element.width, target: pos }, // Direita
      { value: elementCenter.x, target: pos } // Centro
    ]

    snapPoints.forEach(point => {
      if (Math.abs(point.value - point.target) < snapThreshold) {
        guides.value.vertical.push({ position: point.target })
        if (point.value === element.x) element.x = point.target
        else if (point.value === elementCenter.x) element.x = point.target - element.width / 2
        else element.x = point.target - element.width
      }
    })
  })

  // Alinhamento horizontal
  positions.horizontal.forEach(pos => {
    const snapPoints = [
      { value: element.y, target: pos }, // Topo
      { value: element.y + element.height, target: pos }, // Base
      { value: elementCenter.y, target: pos } // Centro
    ]

    snapPoints.forEach(point => {
      if (Math.abs(point.value - point.target) < snapThreshold) {
        guides.value.horizontal.push({ position: point.target })
        if (point.value === element.y) element.y = point.target
        else if (point.value === elementCenter.y) element.y = point.target - element.height / 2
        else element.y = point.target - element.height
      }
    })
  })
}

// ============ Lifecycle Hooks ============
onMounted(() => {
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('mouseup', endInteraction)
  window.addEventListener('touchmove', handleMove)
  window.addEventListener('touchend', endInteraction)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('mouseup', endInteraction)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('touchend', endInteraction)
})
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Painel Lateral -->
    <div class="w-64 bg-white shadow-lg p-4">
      <h2 class="text-lg font-bold mb-4">Elementos</h2>
      <div class="space-y-2">
        <div v-for="element in availableElements" :key="element.type" class="p-2 bg-gray-200 rounded cursor-move"
          draggable="true" @dragstart="handleDragStart($event, element)" @dragend="handleDragEnd">
          {{ element.label }}
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="flex-1 p-4">
      <div ref="canvasRef" class="w-full h-full bg-white border-2 border-dashed border-gray-300 relative"
        @dragover.prevent="handleDragOver" @drop.prevent="handleDrop" @click="deselectElement">
        <!-- Guias -->
        <div v-for="guide in guides.vertical" :key="'v-' + guide.position"
          class="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none opacity-70"
          :style="{ left: guide.position + 'px' }" />
        <div v-for="guide in guides.horizontal" :key="'h-' + guide.position"
          class="absolute left-0 right-0 h-px bg-blue-500 pointer-events-none opacity-70"
          :style="{ top: guide.position + 'px' }" />

        <!-- Preview -->
        <div v-if="dragPreview.visible"
          class="absolute border-2 border-gray-400 bg-gray-200 opacity-50 pointer-events-none" :style="{
            left: dragPreview.x + 'px',
            top: dragPreview.y + 'px',
            width: '100px',
            height: '100px'
          }" />

        <!-- Elementos -->
        <div v-for="element in canvasElements" :key="element.id" class="absolute"
          :class="{ 'border-2 border-blue-500': selectedElement === element }" :style="{
            left: element.x + 'px',
            top: element.y + 'px',
            width: element.width + 'px',
            height: element.height + 'px',
            transform: `rotate(${element.rotation}deg)`,
            zIndex: element === selectedElement ? 9999 : element.zIndex,
            cursor: interaction.isMoving ? 'grabbing' : 'grab'
          }" @mousedown.prevent="startMove($event, element)" @touchstart.prevent="startMove($event, element)"
          @click.stop="selectElement(element)">
          <!-- Alças -->
          <template v-if="selectedElement === element">
            <!-- Redimensionar -->
            <div class="absolute w-3 h-3 bg-blue-500 rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
              @mousedown.stop="startResize($event, element)" @touchstart.stop="startResize($event, element)" />

            <!-- Rotacionar -->
            <div class="absolute w-3 h-3 bg-green-500 rounded-full cursor-pointer -top-6 left-1/2"
              @mousedown.stop="startRotate($event, element)" @touchstart.stop="startRotate($event, element)" />
          </template>

          <!-- Conteúdo -->
          <div class="w-full h-full bg-gray-200 flex items-center justify-center select-none">
            {{ element.type }}
          </div>
        </div>
      </div>
    </div>

    <!-- Painel de Propriedades -->
    <div v-if="selectedElement" class="w-64 bg-white shadow-lg p-4">
      <h2 class="text-lg font-bold mb-4">Propriedades</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Posição X</label>
          <input type="number" v-model.number="selectedElement.x" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium">Posição Y</label>
          <input type="number" v-model.number="selectedElement.y" class="mt-1 w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium">Posição Y</label>
          <input type="number" v-model.number="selectedElement.y" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium">Largura</label>
          <input type="number" v-model.number="selectedElement.width" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium">Altura</label>
          <input type="number" v-model.number="selectedElement.height" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium">Rotação</label>
          <input type="number" v-model.number="selectedElement.rotation" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <div>
          <label class="block text-sm font-medium">Ordem (Z-Index)</label>
          <input type="number" v-model.number="selectedElement.zIndex" class="mt-1 w-full rounded border-gray-300" />
        </div>
        <button @click="removeElement" class="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
          Remover
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-line {
  position: absolute;
  background-color: rgb(59, 130, 246);
  pointer-events: none;
  opacity: 0.7;
}
</style>