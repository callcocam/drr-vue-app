<script setup>
const props = defineProps({
    availableElements: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['elementDragStart', 'elementDragEnd'])

const handleDragStart = (event, element) => {
    emit('elementDragStart', { event, element })
}

const handleDragEnd = (event) => {
    emit('elementDragEnd', event)
}
</script>

<template>
    <div class="w-64 bg-white shadow-lg p-4 select-none border-r" @mousedown.stop @click.stop>
        <h2 class="text-lg font-bold mb-4">Elementos</h2>
        <div class="space-y-2">
            <div v-for="element in availableElements" :key="element.type"
                class="p-3 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors" draggable="true"
                @dragstart="handleDragStart($event, element)" @dragend="handleDragEnd" @mousedown.stop @click.stop>
                <div class="flex items-center justify-between">
                    <span>{{ element.label }}</span>
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="element.type === 'rectangle'" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        <circle v-else-if="element.type === 'circle'" cx="12" cy="12" r="8" stroke-width="2" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>