<template>
    <div :class="{
        'element': true,
        'selected': selectedElements.has(element.id)
    }" :style="getCircleStyle">
        <!-- Circle -->
        <!-- Controles de manipulação -->
        <slot />
    </div>
</template>
<script setup>

import { useElementInteraction } from '@/components/DesignEditor/composables/useElementInteraction'
import { computed } from 'vue';

const props = defineProps({
    element: {
        type: Object,
        required: true
    },
    selectedElements: {
        type: Set,
        required: true
    }
})


const { getElementStyle } = useElementInteraction()
const getCircleStyle = computed(() => {
    const baseStyle = getElementStyle(props.element)
    return {
        ...baseStyle,
        borderRadius: '50%', // Força o elemento a ser circular 
    }
})

</script>

<style scoped>
.circle-element {
    transition: all 0.2s ease;
}

.circle-element.selected {
    outline: 2px solid #4299e1;
    outline-offset: 1px;
}

/* Estilos para quando o elemento estiver sendo arrastado */
.circle-element:active {
    cursor: move;
}
</style>