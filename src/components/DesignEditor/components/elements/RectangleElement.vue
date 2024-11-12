<template>
    <div :class="{
        'element': true,
        'selected': selectedElements.has(element.id)
    }" :style="getElementStyle(element)">
        <!-- Controles de manipulação -->
        <slot />
    </div>
</template>
<script setup>

import { useElementInteraction } from '@/components/DesignEditor/composables/useElementInteraction'

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
</script>
