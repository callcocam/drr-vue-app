// components/elements/CircleElement.vue
<script setup>
import { computed } from 'vue'
import { useElementInteraction } from '@/components/DesignEditor/composables/useElementInteraction'

const props = defineProps({
    element: {
        type: Object,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select', 'deselect'])

const { handleMouseDown } = useElementInteraction(props, emit)

const styles = computed(() => ({
    position: 'absolute',
    left: `${props.element.x}px`,
    top: `${props.element.y}px`,
    width: `${props.element.width}px`,
    height: `${props.element.height}px`,
    transform: `rotate(${props.element.rotation || 0}deg)`,
    backgroundColor: props.element.backgroundColor || '#ffffff',
    border: `${props.element.borderWidth || 1}px ${props.element.borderStyle || 'solid'} ${props.element.borderColor || '#000000'}`,
    borderRadius: '50%',
    opacity: props.element.opacity || 1,
    cursor: 'move',
    userSelect: 'none'
}))
</script>

<template>
    <div class="circle-element" :style="styles" @mousedown="handleMouseDown">
        <div v-if="isSelected" class="resize-handles">
            <div v-for="handle in ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']" :key="handle"
                :class="['resize-handle', `resize-handle-${handle}`]"
                @mousedown.stop="$emit('startResize', { handle, element: props.element })">
            </div>
            <div class="rotate-handle" @mousedown.stop="$emit('startRotate', { element: props.element })">
                ⟲
            </div>
        </div>
    </div>
</template>

<style scoped>
.circle-element {
    position: absolute;
}
.resize-handles {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    pointer-events: none;
}

.resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: white;
    border: 1px solid #4299e1;
    pointer-events: auto;
    z-index: 1;
}

.resize-handle-nw {
    top: -5px;
    left: -5px;
    cursor: nw-resize;
}

.resize-handle-n {
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    cursor: n-resize;
}

.resize-handle-ne {
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}

.resize-handle-w {
    top: 50%;
    left: -5px;
    transform: translateY(-50%);
    cursor: w-resize;
}

.resize-handle-e {
    top: 50%;
    right: -5px;
    transform: translateY(-50%);
    cursor: e-resize;
}

.resize-handle-sw {
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}

.resize-handle-s {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    cursor: s-resize;
}

.resize-handle-se {
    bottom: -5px;
    right: -5px;
    cursor: se-resize;
}

.rotate-handle {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: white;
    border: 1px solid #4299e1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    user-select: none;
}
</style>