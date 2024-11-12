// TextElement.vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useElementInteraction } from '@/components/DesignEditor/composables/useElementInteraction'

const props = defineProps({
    element: {
        type: Object,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    },
    isEditing: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:element', 'select', 'deselect', 'startEdit', 'endEdit'])

const textRef = ref(null)
const isEditing = ref(false)
const editableText = ref(props.element.text)

const { handleMouseDown } = useElementInteraction(props, emit)

const handleDoubleClick = (event) => {
    event.stopPropagation()
    if (!isEditing.value) {
        isEditing.value = true
        emit('startEdit', props.element)
        // Focar o elemento na próxima atualização do DOM
        setTimeout(() => {
            if (textRef.value) {
                textRef.value.focus()
                // Seleciona todo o texto
                const range = document.createRange()
                range.selectNodeContents(textRef.value)
                const selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }, 0)
    }
}

const handleBlur = () => {
    finishEditing()
}

const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        finishEditing()
    }
    if (event.key === 'Escape') {
        isEditing.value = false
        editableText.value = props.element.text // Reset to original text
        emit('endEdit', false)
    }
}

const finishEditing = () => {
    if (isEditing.value) {
        isEditing.value = false
        const newText = textRef.value.innerText.trim()
        if (newText !== props.element.text) {
            emit('update:element', {
                ...props.element,
                text: newText
            })
        }
        emit('endEdit', true)
    }
}

// Impede que a seleção seja limpa quando clicamos no elemento de edição
const handleClick = (event) => {
    if (isEditing.value) {
        event.stopPropagation()
    }
}

onMounted(() => {
    if (props.isEditing && textRef.value) {
        textRef.value.focus()
    }
})

// Cleanup any selection when unmounting
onUnmounted(() => {
    if (isEditing.value) {
        const selection = window.getSelection()
        selection.removeAllRanges()
    }
})
</script>

<template>
    <div class="text-element" @mousedown.stop="handleMouseDown" @dblclick="handleDoubleClick" @click="handleClick">
        <div ref="textRef" :contenteditable="isEditing" :class="{
            'text-content': true,
            'editing': isEditing,
            'selected': isSelected && !isEditing
        }" :style="{
            fontSize: `${element.fontSize || 16}px`,
            fontFamily: element.fontFamily || 'Arial',
            color: element.color || '#000000',
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            textDecoration: element.textDecoration || 'none',
            textAlign: element.textAlign || 'left',
            lineHeight: element.lineHeight || '1.2',
            padding: '2px',
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: isEditing ? 'text' : 'none',
        }" @blur="handleBlur" @keydown="handleKeyDown">
            {{ element.text }}
        </div>
    </div>
</template>

<style scoped>
.text-element {
    position: absolute;
    cursor: move;
    min-width: 20px;
    min-height: 20px;
}

.text-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.text-content.editing {
    cursor: text;
    outline: none;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.text-content.selected:not(.editing) {
    /* Estilo quando selecionado mas não em edição */
    background-color: rgba(66, 153, 225, 0.1);
}
</style>