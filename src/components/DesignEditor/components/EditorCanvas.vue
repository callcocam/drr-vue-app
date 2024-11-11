<script setup>
import { ref } from 'vue'

const props = defineProps({
    elements: {
        type: Array,
        required: true
    },
    selectedElements: {
        type: Set,
        required: true
    },
    guides: {
        type: Object,
        required: true
    },
    dragPreview: {
        type: Object,
        required: true
    },
    interaction: {
        type: Object,
        required: true
    }
})

const emit = defineEmits([
    'element-click',
    'deselect',
    'add-to-selection',
    'remove-from-selection',
    'update-selection',
    'start-move',
    'start-resize',
    'start-rotate',
    'drop',
    'drag-over'
])

const canvasRef = ref(null)

const isSelected = (element) => {
    return props.selectedElements.has(element.id)
}

// Handlers de interação
const handleElementClick = (event, element) => {
    event.stopPropagation()
    emit('element-click', element, event)
}

const handleStartMove = (event, element) => {
    if (!event) return
    event.stopPropagation()
    event.preventDefault() 
    emit('start-move', { event, element })
}

const handleStartResize = (event, element) => {
    if (!event) return
    event.stopPropagation()
    event.preventDefault()
    emit('start-resize', { event, element })
}

const handleStartRotate = (event, element) => {
    if (!event) return
    event.stopPropagation()
    event.preventDefault()
    emit('start-rotate', { event, element })
}

// Handlers do canvas
const handleCanvasClick = (event) => {
    if (event.target === canvasRef.value) {
        emit('deselect')
    }
}

const handleDragOver = (event) => {
    event.preventDefault()
    emit('drag-over', { event, canvasRef: canvasRef.value })
}

const handleDrop = (event) => {
    event.preventDefault()
    emit('drop', { event, canvasRef: canvasRef.value })
}
</script>

<template>
    <div class="flex-1 p-4">
        <div ref="canvasRef"
            class="w-full h-full bg-white border-2 border-dashed border-gray-300 relative overflow-hidden"
            @click="handleCanvasClick" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop">
            <!-- Elementos do Canvas -->
            <div v-for="element in elements" :key="element.id" class="absolute" :class="{
                'ring-2 ring-blue-500': isSelected(element),
                'cursor-move': !interaction.isMoving && !interaction.isResizing && !interaction.isRotating
            }" :style="{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            transform: `rotate(${element.rotation}deg)`,
            backgroundColor: element.backgroundColor || 'transparent',
            borderColor: element.borderColor || 'transparent',
            borderWidth: `${element.borderWidth}px`,
            borderStyle: 'solid',
            zIndex: isSelected(element) ? 9999 : element.zIndex,
            borderRadius: element.type === 'circle' ? '50%' : (element.borderRadius || 0) + 'px',
            userSelect: 'none'
        }" @mousedown="handleStartMove($event, element)" @click.stop="handleElementClick($event, element)">
                <!-- Alças de Manipulação -->
                <template v-if="isSelected(element)">
                    <!-- Alça de Redimensionamento -->
                    <div class="absolute w-3 h-3 bg-blue-500 rounded-full cursor-se-resize -bottom-1.5 -right-1.5 hover:scale-125 transition-transform"
                        @mousedown.stop="handleStartResize($event, element)" />

                    <!-- Alça de Rotação -->
                    <div class="absolute w-3 h-3 bg-green-500 rounded-full cursor-pointer -top-6 left-1/2 -translate-x-1/2 hover:scale-125 transition-transform"
                        @mousedown.stop="handleStartRotate($event, element)">
                        <div class="absolute w-px h-5 bg-green-500 left-1/2 top-full transform -translate-x-1/2" />
                    </div>
                </template>

                <!-- Conteúdo do Elemento -->
                <div class="w-full h-full flex items-center justify-center select-none" :style="{
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}px`,
                    color: element.textColor
                }">
                    {{ element.type === 'text' ? element.text : '' }}
                </div>
            </div>

            <!-- Guias de Alinhamento -->
            <div v-for="guide in guides.vertical" :key="'v-' + guide.position"
                class="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none opacity-70"
                :style="{ left: `${guide.position}px` }" />
            <div v-for="guide in guides.horizontal" :key="'h-' + guide.position"
                class="absolute left-0 right-0 h-px bg-blue-500 pointer-events-none opacity-70"
                :style="{ top: `${guide.position}px` }" />

            <!-- Preview de Arrasto -->
            <div v-if="dragPreview.visible"
                class="absolute border-2 border-gray-400 bg-gray-200 opacity-50 pointer-events-none" :style="{
                    left: `${dragPreview.x}px`,
                    top: `${dragPreview.y}px`,
                    width: '100px',
                    height: '100px'
                }" />
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