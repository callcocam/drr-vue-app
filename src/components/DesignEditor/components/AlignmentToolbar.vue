<script setup>
const props = defineProps({
    hasSelection: Boolean,
    hasMultipleSelection: Boolean,
    canGroup: Boolean,
    isGroup: Boolean
})

const emit = defineEmits([
    'alignLeft',
    'alignCenter',
    'alignRight',
    'alignTop',
    'alignMiddle',
    'alignBottom',
    'distributeHorizontally',
    'distributeVertically'
])
</script>

<template>
    <div class="bg-white border-b px-4 py-2 flex items-center gap-2">
        <!-- Alinhamento Horizontal -->
        <div class="border-r pr-2 flex items-center gap-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignLeft')" title="Alinhar à Esquerda">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4v16M8 8h12M8 16h8" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignCenter')" title="Centralizar Horizontalmente">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 4v16M7 8h10M9 16h6" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignRight')" title="Alinhar à Direita">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 4v16M4 8h12M8 16h8" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
        </div>

        <!-- Alinhamento Vertical -->
        <div class="border-r pr-2 flex items-center gap-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignTop')" title="Alinhar ao Topo">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16M8 8v8M16 8v12" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignMiddle')" title="Centralizar Verticalmente">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12h16M8 7v10M16 5v14" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('alignBottom')" title="Alinhar à Base">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 20h16M8 8v8M16 4v12" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
        </div>

        <!-- Distribuição -->
        <div class="flex items-center gap-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasMultipleSelection" @click="$emit('distributeHorizontally')"
                title="Distribuir Horizontalmente">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4v16M20 4v16M12 8v8" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasMultipleSelection" @click="$emit('distributeVertically')"
                title="Distribuir Verticalmente">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16M4 20h16M8 12h8" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
        </div>
    </div>
</template>