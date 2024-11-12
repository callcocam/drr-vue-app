<script setup>
const props = defineProps({
    canUndo: Boolean,
    canRedo: Boolean,
    hasSelection: Boolean,
    hasMultipleSelection: Boolean,
    canGroup: Boolean,
    isGroup: Boolean,
    isSaving: Boolean,
    isLoading: Boolean
})

const emit = defineEmits([
    'undo',
    'redo',
    'group',
    'ungroup',
    'removeElement',
    'copy',
    'paste',
    'bring-to-front',
    'send-to-back',
    'bring-forward',
    'send-backward',
    'save',
    'load',
    'export',
    'import'
])

// Handler para importar arquivo
const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            emit('import', file)
        }
    }
    input.click()
}
</script>

<template>
    <div class="bg-white border-b px-4 py-2 flex items-center gap-2">
        <!-- Undo/Redo -->
        <div class="flex items-center gap-1 border-r pr-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!canUndo" @click="$emit('undo')" title="Desfazer (Ctrl+Z)">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 10h10a8 8 0 018 8v2M3 10l6-6M3 10l6 6" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!canRedo" @click="$emit('redo')" title="Refazer (Ctrl+Y)">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10H11a8 8 0 00-8 8v2M21 10l-6-6M21 10l-6 6" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <!-- Salvar/Carregar/Exportar/Importar -->
        <div class="flex items-center gap-1 border-r pr-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isSaving" @click="$emit('save')" title="Salvar Projeto">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-if="isSaving"
                    class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></span>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading" @click="$emit('load')" title="Carregar Projeto">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-if="isLoading"
                    class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></span>
            </button>

            <button class="p-2 rounded hover:bg-gray-100 transition-colors" @click="$emit('export')"
                title="Exportar para JSON">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <button class="p-2 rounded hover:bg-gray-100 transition-colors" @click="handleImportClick"
                title="Importar de JSON">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5-5 5 5M12 4v12" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <!-- New Z-Index Controls -->
        <div class="flex items-center space-x-2 border-r pr-2">
            <button class="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('bring-forward')" title="Trazer para frente (Ctrl+])">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                    <path d="M14 4h4a2 2 0 0 1 2 2v4" />
                </svg>
            </button>

            <button class="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('send-backward')" title="Enviar para trás (Ctrl+[)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                    <path d="M4 14v4a2 2 0 0 0 2 2h4" />
                </svg>
            </button>
        </div>

        <!-- Copiar/Colar -->
        <div class="flex items-center gap-1 border-r pr-2">
            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!hasSelection" @click="$emit('copy')" title="Copiar (Ctrl+C)">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M8 4h8M8 4v2m8-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2V6a2 2 0 012-2h2"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                @click="$emit('paste')" title="Colar (Ctrl+V)">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                        d="M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-12a2 2 0 012-2h2m4 0h4M8 4v2h8V4M8 4a2 2 0 00-2 2m2-2a2 2 0 012 2m6-2a2 2 0 012 2m-10 6h8m-8 4h6"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>

        <!-- Excluir -->
        <button
            class="p-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!hasSelection" @click="$emit('removeElement')" title="Excluir (Delete)">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.group-hover\:opacity-100:hover {
    opacity: 1;
}
</style>