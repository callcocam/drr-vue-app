<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    elements: {
        type: Array,
        required: true,
    },
    selectedElements: {
        type: Set,
        required: true,
    },
    selectionBounds: {
        type: Object,
        default: null,
    },
    guides: {
        type: Array,
        default: () => []
    },
    dragPreview: {
        type: Object,
        required: true,
    },
    interaction: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits([
    'element-click',
    'element-mousedown',
    'deselect',
    'add-to-selection',
    'remove-from-selection',
    'start-move',
    'start-resize',
    'start-rotate',
    'drop',
    'drag-over'
])

const canvasRef = ref(null)

// Função para encontrar elemento na posição do mouse
const findElementAtPosition = (event) => {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Procura do último (topo) para o primeiro (fundo)
    for (let i = props.elements.length - 1; i >= 0; i--) {
        const element = props.elements[i]
        if (isPointInElement(x, y, element)) {
            return element
        }
    }
    return null
}

// Verifica se um ponto está dentro de um elemento
const isPointInElement = (x, y, element) => {
    return (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
    )
}

// Handlers de eventos
const handleCanvasClick = (event) => {
    const element = findElementAtPosition(event)
    if (element) {
        emit('element-click', element, event)
    } else {
        emit('deselect')
    }
}

const handleCanvasMouseDown = (event) => {
    const element = findElementAtPosition(event)
    if (element) {
        if (event.target.classList.contains('resize-handle') ||
            event.target.classList.contains('rotate-handle')) {
            return
        }
        emit('element-mousedown', element, event)
    }
}

const handleStartResize = (event, element, handle) => {
    event.stopPropagation()
    emit('start-resize', { event, element, handle })
}

const handleStartRotate = (event, element) => {
    event.stopPropagation()
    emit('start-rotate', { event, element })
}

const handleDragOver = (event) => {
    event.preventDefault()
    emit('drag-over', { event, canvasRef: canvasRef.value })
}

const handleDrop = (event) => {
    event.preventDefault()
    emit('drop', { event, canvasRef: canvasRef.value })
}

// Função para gerar estilos do elemento
const getElementStyle = (element) => {
    return {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
        backgroundColor: element.backgroundColor,
        borderStyle: element.borderStyle || 'solid',
        borderWidth: element.borderWidth ? `${element.borderWidth}px` : '0',
        borderColor: element.borderColor || 'transparent',
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
        zIndex: element.zIndex,
    }
}
console.log(props.guides)
</script>

<template>
    <div ref="canvasRef" class="canvas" @click="handleCanvasClick" @mousedown="handleCanvasMouseDown"
        @dragover="handleDragOver" @drop="handleDrop">
        <!-- Grid de fundo -->
        <div class="grid-background" />
        <!-- Elementos do canvas -->
        <template v-for="element in elements" :key="element.id">
            <!-- Template Element -->
            <div v-if="element.type === 'template'" :class="{
                'element': true,
                'selected': selectedElements.has(element.id)
            }" :style="getElementStyle(element)">
                <div class="template-content" v-html="element.template" />

                <!-- Controles de manipulação para templates -->
                <template v-if="selectedElements.has(element.id)">
                    <div v-for="handle in ['tl', 'tr', 'bl', 'br']" :key="handle" :class="`resize-handle ${handle}`"
                        @mousedown.stop="(e) => handleStartResize(e, element, handle)" />
                    <div class="rotate-handle" @mousedown.stop="(e) => handleStartRotate(e, element)" />
                </template>
            </div>

            <!-- Elementos regulares -->
            <div v-else :class="{
                'element': true,
                'selected': selectedElements.has(element.id)
            }" :style="getElementStyle(element)">
                <!-- Conteúdo específico do elemento baseado no tipo -->
                <template v-if="element.type === 'text'">
                    <div class="text-content" :style="{
                        color: element.textColor,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                    }">
                        {{ element.text }}
                    </div>
                </template>

                <!-- Controles de manipulação -->
                <template v-if="selectedElements.has(element.id)">
                    <div v-for="handle in ['tl', 'tr', 'bl', 'br']" :key="handle" :class="`resize-handle ${handle}`"
                        @mousedown.stop="(e) => handleStartResize(e, element, handle)" />
                    <div class="rotate-handle" @mousedown.stop="(e) => handleStartRotate(e, element)" />
                </template>
            </div>
        </template>

        <!-- Preview de arrasto -->
        <div v-if="dragPreview.visible" class="drag-preview" :style="{
            position: 'absolute',
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            width: '100px',
            height: '100px',
            border: '2px dashed #1a73e8',
        }" />

        <!-- Guias de alinhamento -->
        <div class="guides" aria-hidden="true">
            <template v-for="(guide, index) in guides" :key="`${guide.type}-${guide.position}-${index}`">
                <div class="guide" :class="[
                    guide.type,
                    guide.className
                ]" :style="{
                    [guide.type === 'vertical' ? 'left' : 'top']: `${guide.position}px`,
                    [guide.type === 'vertical' ? 'height' : 'width']: `${guide.end - guide.start}px`,
                    [guide.type === 'vertical' ? 'top' : 'left']: `${guide.start}px`
                }" />
            </template>
        </div>

        <!-- Bounds da seleção múltipla -->
        <template v-if="selectionBounds">
            <div class="selection-bounds" :style="{
                position: 'absolute',
                left: `${selectionBounds.left}px`,
                top: `${selectionBounds.top}px`,
                width: `${selectionBounds.right - selectionBounds.left}px`,
                height: `${selectionBounds.bottom - selectionBounds.top}px`,
                border: '1px solid #1a73e8',
            }" />
        </template>
    </div>
</template>

<style scoped>
.canvas {
    position: relative;
    width: 100%;
    height: 100%;
    background: white;
    user-select: none;
    overflow: hidden;
}

.element {
    cursor: move;
    user-select: none;
}

.template-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.text-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
}

.resize-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: white;
    border: 1px solid #1a73e8;
    border-radius: 4px;
}

.resize-handle.tl {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
}

.resize-handle.tr {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
}

.resize-handle.bl {
    bottom: -4px;
    left: -4px;
    cursor: sw-resize;
}

.resize-handle.br {
    bottom: -4px;
    right: -4px;
    cursor: se-resize;
}

.rotate-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: white;
    border: 1px solid #1a73e8;
    border-radius: 4px;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
}

.guides {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
}

.guide {
    position: absolute;
    background-color: #4299e1;
    pointer-events: none;
}

.guide.vertical {
    width: 1px;
}

.guide.horizontal {
    height: 1px;
}

.guide-center {
    background-color: #48bb78;
}

.guide-left,
.guide-right,
.guide-top,
.guide-bottom {
    background-color: #4299e1;
}

.guide-left-to-right,
.guide-right-to-left,
.guide-top-to-bottom,
.guide-bottom-to-top {
    background-color: #9f7aea;
}

.selection-bounds {
    pointer-events: none;
    z-index: 1000;
}

.drag-preview {
    pointer-events: none;
    z-index: 1000;
    background: rgba(26, 115, 232, 0.1);
}

.grid-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-size: 20px 20px;
    background-image:
        linear-gradient(to right, #f0f0f0 1px, transparent 1px),
        linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
}

.selected {
    outline: 2px solid #1a73e8;
}
</style>